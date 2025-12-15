import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { setupInitialCredentials, setAuthenticated, isPasswordStrong, generateSecurePassword } from "@/lib/auth";

interface InitialSetupProps {
  onSetupComplete: () => void;
}

export const InitialSetup = ({ onSetupComplete }: InitialSetupProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const username = 'admin'; // Fixed username

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isPasswordStrong(password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const success = await setupInitialCredentials(password);
      if (success) {
        setAuthenticated('admin');
        onSetupComplete();
      } else {
        setError("Setup failed. Please try again.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Setup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePassword = async () => {
    const generated = await generateSecurePassword();
    setPassword(generated);
    setConfirmPassword(generated);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <Card className="glass-card p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Admin Setup</h1>
          <p className="text-muted-foreground text-sm">
            Set up your admin password to secure your link hub
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Account Setup</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Set up your admin credentials. These will be stored securely and can be changed later in the admin panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Admin Username</Label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm">
              <span className="text-muted-foreground">admin</span>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Fixed</span>
            </div>
            <p className="text-xs text-muted-foreground">The admin username is fixed and cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Admin Password</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
                className="text-xs"
              >
                Generate Secure
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-card border-primary/20 pr-10"
                placeholder="Choose a secure password"
                required
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Password Requirements:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li className={password.length >= 8 ? 'text-green-400' : ''}>
                  <span className={password.length >= 8 ? 'text-green-400' : ''}>At least 8 characters</span>
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
                  <span className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>Uppercase letter</span>
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-400' : ''}>
                  <span className={/[a-z]/.test(password) ? 'text-green-400' : ''}>Lowercase letter</span>
                </li>
                <li className={/\d/.test(password) ? 'text-green-400' : ''}>
                  <span className={/\d/.test(password) ? 'text-green-400' : ''}>Number</span>
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : ''}>
                  <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : ''}>Special character</span>
                </li>
              </ul>
              {isPasswordStrong(password) && (
                <div className="flex items-center gap-1 text-green-400 mt-2">
                  <CheckCircle className="w-3 h-3" />
                  <span>Password is strong!</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-card border-primary/20 pr-10"
                placeholder="Confirm your password"
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

          {error && (
            <div className="text-destructive text-sm text-center p-2 bg-destructive/10 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </Card>
    </div>
  );
};