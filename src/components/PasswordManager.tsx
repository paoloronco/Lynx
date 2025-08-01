import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, CheckCircle, AlertTriangle, Shield } from "lucide-react";
import { getCurrentCredentials, authenticateUser, isPasswordStrong, clearAllAuthData } from "@/lib/auth";

export const PasswordManager = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const credentials = getCurrentCredentials();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate current password using the secure authentication
      const isValid = await authenticateUser(credentials?.username || '', currentPassword);
      if (!isValid) {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
        setIsLoading(false);
        return;
      }

      // Validate new password strength
      if (!isPasswordStrong(newPassword)) {
        setMessage({ 
          type: 'error', 
          text: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
        });
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        setIsLoading(false);
        return;
      }

      // Show warning about password change requirement
      setMessage({ 
        type: 'error', 
        text: 'To change your password, you need to re-deploy the app with new credentials. This ensures maximum security.' 
      });
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to validate password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetApp = () => {
    if (window.confirm('This will clear all authentication data and require you to set up credentials again. Continue?')) {
      clearAllAuthData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Security Status */}
      <Card className="glass-card p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold gradient-text">Security Status</h2>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Enhanced Security Active</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>✅ Passwords are hashed with PBKDF2 (10,000 iterations)</p>
            <p>✅ Data encrypted with AES-256</p>
            <p>✅ Device-specific encryption keys</p>
            <p>✅ 12-hour session timeout</p>
            <p>✅ Strong password requirements</p>
          </div>
        </div>

        {credentials && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Username:</strong> {credentials.username}</p>
          </div>
        )}
      </Card>

      {/* Password Change Form */}
      <Card className="glass-card p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold gradient-text">Password Validation</h2>
          <p className="text-muted-foreground text-sm">
            Test your current password strength
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="glass-card border-primary/20 pr-10"
                placeholder="Enter current password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Test New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="glass-card border-primary/20 pr-10"
                placeholder="Test password strength"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Requirements:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li className={newPassword.length >= 8 ? 'text-green-400' : ''}>At least 8 characters</li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-green-400' : ''}>Uppercase letter</li>
                <li className={/[a-z]/.test(newPassword) ? 'text-green-400' : ''}>Lowercase letter</li>
                <li className={/\d/.test(newPassword) ? 'text-green-400' : ''}>Number</li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-400' : ''}>Special character</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Test Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-card border-primary/20 pr-10"
                placeholder="Confirm test password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {message && (
            <div className={`text-sm p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}

          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Validating..." : "Test Password"}
          </Button>
        </form>

        <div className="pt-4 border-t border-primary/20">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Reset Authentication</span>
            </div>
            <p className="text-xs text-muted-foreground">
              To change your password, clear all auth data and re-deploy with new credentials.
            </p>
            <Button
              onClick={handleResetApp}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              Clear Auth Data & Reset
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};