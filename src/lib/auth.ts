import { authApi, utilityApi } from './api-client';

// Secure randomness utilities
const getCrypto = (): Crypto => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    return globalThis.crypto as Crypto;
  }
  throw new Error('Secure crypto.getRandomValues is not available in this environment');
};

const getSecureRandomInt = (maxExclusive: number): number => {
  if (maxExclusive <= 0) throw new Error('maxExclusive must be > 0');
  const cryptoObj = getCrypto();
  // Rejection sampling to avoid modulo bias
  const maxUint32 = 0xFFFFFFFF;
  const limit = Math.floor((maxUint32 + 1) / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);
  let value = 0;
  do {
    cryptoObj.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % maxExclusive;
};

const secureShuffle = (input: string[]): string[] => {
  for (let i = input.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const tmp = input[i];
    input[i] = input[j];
    input[j] = tmp;
  }
  return input;
};

// Check if this is the first time setup (no admin exists)
export const isFirstTimeSetup = async (): Promise<boolean> => {
  try {
    const result = await authApi.checkSetupStatus();
    return result.isFirstTimeSetup;
  } catch (error) {
    console.error('Error in isFirstTimeSetup:', error);
    return true;
  }
};

// Setup initial admin credentials
export const setupInitialCredentials = async (password: string): Promise<boolean> => {
  try {
    await authApi.setup(password);
    return true;
  } catch (error) {
    console.error('Error in setupInitialCredentials:', error);
    throw error;
  }
};

// Authenticate admin user
export const authenticateUser = async (password: string): Promise<boolean> => {
  try {
    await authApi.login(password);
    return true;
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return false;
  }
};

// Check if user is currently authenticated
export const isAuthenticated = (): boolean => {
  return authApi.isAuthenticated();
};

// This function is kept for backward compatibility but is now a no-op
// The API client handles setting the authentication token directly
export const setAuthenticated = (_username: string): void => {
  // No-op - token management is handled by the API client
  console.log('setAuthenticated is deprecated - use authApi.login() instead');
};

// Logout user
export const logout = (): void => {
  authApi.logout();
};

// Enhanced password validation
export const isPasswordStrong = async (password: string): Promise<boolean> => {
  try {
    const result = await utilityApi.validatePassword(password);
    return result.isStrong;
  } catch (error) {
    // Fallback to client-side validation
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChar;
  }
};

// Generate a cryptographically secure password
export const generateSecurePassword = async (): Promise<string> => {
  try {
    const result = await utilityApi.generatePassword();
    return result.password;
  } catch (error) {
    // Fallback to client-side generation
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*(),.?":{}|<>';
    
    // Ensure at least one character from each category
    let password = '';
    password += uppercase[getSecureRandomInt(uppercase.length)];
    password += lowercase[getSecureRandomInt(lowercase.length)];
    password += numbers[getSecureRandomInt(numbers.length)];
    password += special[getSecureRandomInt(special.length)];
    
    // Fill remaining length with random characters
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < 16; i++) {
      password += allChars[getSecureRandomInt(allChars.length)];
    }
    
    // Shuffle the password
    const shuffled = secureShuffle(password.split(''));
    return shuffled.join('');
  }
};

// Get current user credentials (safe data only)
// Always returns admin username if authenticated, null otherwise
export const getCurrentCredentials = async (): Promise<{ username: string } | null> => {
  try {
    if (!isAuthenticated()) return null;
    
    const result = await authApi.verify();
    return result.valid ? { username: 'admin' } : null;
  } catch {
    return null;
  }
};

// Security utilities
export const clearAllAuthData = (): void => {
  // Clear all auth-related data from localStorage
  const preserveKeys = ['lynx-theme', 'lynx-settings']; // Preserve these keys
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (!preserveKeys.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear session storage as well
  sessionStorage.clear();
  
  // Clear any cookies that might be used for auth
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  });
};

/**
 * Reset the entire application to its initial state
 * This will clear all user data and redirect to the setup page
 */
export const resetApplication = async (force: boolean = false): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Starting application reset...');
    // Clear local data first
    clearAllAuthData();
    
    let result;
    
    try {
      // First try the authenticated reset
      if (!force) {
        console.log('Trying authenticated reset...');
        result = await authApi.reset();
      }
    } catch (error) {
      console.log('Authenticated reset failed, trying force reset...', error);
      // If authenticated reset fails, try the force reset
      try {
        console.log('Attempting force reset...');
        const response = await fetch('http://localhost:3001/api/auth/force-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Reset-Token': 'default-reset-token' // This should match your server's expected token
          },
          // Alternative: Send token in body
          // body: JSON.stringify({ token: 'default-reset-token' })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        result = await response.json();
        console.log('Force reset response:', result);
      } catch (fetchError) {
        console.error('Force reset failed:', fetchError);
        throw new Error(`Force reset failed: ${fetchError.message}`);
      }
    }
    
    if (result?.success) {
      console.log('Reset successful, redirecting to setup page...');
      // Redirect to setup page after a short delay
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
      
      return result;
    }
    
    throw new Error(result?.error || 'Failed to reset application');
    
  } catch (error) {
    console.error('Error resetting application:', error);
    // Even if the API call fails, clear local data and redirect
    clearAllAuthData();
    
    // Redirect to setup page after a short delay
    setTimeout(() => {
      window.location.href = '/admin';
    }, 1000);
    
    return { 
      success: false, 
      message: error.message || 'Application reset may be incomplete. Please refresh the page.' 
    };
  }
};

// Get security information
export const getSecurityInfo = async () => {
  const isAuth = isAuthenticated();
  
  return {
    hasCredentials: isAuth, // If authenticated, we have credentials
    isAuthenticated: isAuth,
    username: isAuth ? 'admin' : undefined,
    sessionExpiry: null // JWT handles expiry internally
  };
};
