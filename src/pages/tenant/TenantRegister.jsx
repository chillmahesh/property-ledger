import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import TenantAuthLayout from '@/components/tenant/TenantAuthLayout';
import GoogleIcon from '@/components/GoogleIcon';
import { useToast } from '@/components/ui/use-toast';

export default function TenantRegister() {
  const [step, setStep] = useState('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep('otp');
      toast({ title: 'OTP sent', description: `Verification code sent to ${email}` });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode: otp });
      base44.auth.setToken(result.access_token);
      window.location.href = '/tenant/dashboard';
    } catch (err) {
      setError(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await base44.auth.resendOtp(email);
      toast({ title: 'OTP resent', description: `New code sent to ${email}` });
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider('google', '/tenant/dashboard');
  };

  return (
    <TenantAuthLayout
      title={step === 'register' ? 'Create your account' : 'Verify your email'}
      subtitle={step === 'register'
        ? 'Use the same email your property manager registered you with'
        : `Enter the 6-digit code sent to ${email}`}
    >
      {step === 'register' && (
        <>
          <Button variant="outline" className="w-full h-12 mb-4" onClick={handleGoogle}>
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" value={confirm}
                  onChange={(e) => setConfirm(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/tenant/login" className="text-primary font-medium hover:underline">Log in</Link>
          </div>
        </>
      )}

      {step === 'otp' && (
        <>
          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-14 text-center text-2xl tracking-[0.5em] font-bold"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : <><ShieldCheck className="w-4 h-4 mr-2" />Verify & continue</>}
            </Button>
          </form>
          <button onClick={handleResend} className="mt-4 w-full text-center text-sm text-primary hover:underline">
            Resend code
          </button>
          <button onClick={() => setStep('register')} className="mt-2 w-full text-center text-sm text-muted-foreground hover:text-foreground">
            ← Back to registration
          </button>
        </>
      )}
    </TenantAuthLayout>
  );
}