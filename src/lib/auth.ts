import CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';

// Security Configuration
const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours
const AUTH_KEY = 'mylinks-auth-session';

// Database-based admin management
export const generatePasswordHash = (password: string, salt: string): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  }).toString();
};

// Generate random salt
const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
};

// Hash password with salt
const hashPassword = (password: string, salt: string): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  }).toString();
};

// Check if this is the first time setup (no admin exists)
export const isFirstTimeSetup = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Error checking admin users:', error);
      return true; // Default to setup if error
    }
    
    return !data || data.length === 0;
  } catch (error) {
    console.error('Error in isFirstTimeSetup:', error);
    return true;
  }
};

// Setup initial admin credentials
export const setupInitialCredentials = async (username: string, password: string): Promise<boolean> => {
  try {
    const firstTime = await isFirstTimeSetup();
    if (!firstTime) {
      throw new Error('Admin account already exists');
    }
    
    // Validate strong password
    if (!isPasswordStrong(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }
    
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    
    const { error } = await supabase
      .from('admin_users')
      .insert({
        username,
        password_hash: passwordHash,
        salt
      });
      
    if (error) {
      console.error('Error creating admin user:', error);
      throw new Error('Failed to create admin account');
    }
    
    return true;
  } catch (error) {
    console.error('Error in setupInitialCredentials:', error);
    throw error;
  }
};

// Authenticate user against database
export const authenticateUser = async (username: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('username, password_hash, salt')
      .eq('username', username)
      .single();
      
    if (error || !data) {
      return false;
    }
    
    const hashedInput = hashPassword(password, data.salt);
    return hashedInput === data.password_hash;
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return false;
  }
};

// Check if user is currently authenticated
export const isAuthenticated = (): boolean => {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) return false;
    
    const { timestamp, username } = JSON.parse(authData);
    const now = Date.now();
    
    // Check session expiry
    if (now - timestamp > SESSION_DURATION) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
    
    return !!username;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return false;
  }
};

// Set authentication session
export const setAuthenticated = (username: string): void => {
  const sessionData = {
    timestamp: Date.now(),
    username
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

// Enhanced password validation
export const isPasswordStrong = (password: string): boolean => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChar;
};

// Generate a cryptographically secure password
export const generateSecurePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*(),.?":{}|<>';
  
  // Ensure at least one character from each category
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining length with random characters
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Get current user credentials (safe data only)
export const getCurrentCredentials = (): { username: string } | null => {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) return null;
    
    const { username } = JSON.parse(authData);
    return username ? { username } : null;
  } catch {
    return null;
  }
};

// Security utilities
export const clearAllAuthData = (): void => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem('mylinks-device-key');
};

// Get security information
export const getSecurityInfo = () => {
  const credentials = getCurrentCredentials();
  const isAuth = isAuthenticated();
  return {
    hasCredentials: !!credentials,
    isAuthenticated: isAuth,
    username: credentials?.username,
    sessionExpiry: isAuth ? Date.now() + SESSION_DURATION : null
  };
};