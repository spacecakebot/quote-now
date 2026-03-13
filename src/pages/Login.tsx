import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Gem, Mail, Phone } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithPhone, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithPhone(phone);
      setOtpSent(true);
      toast({ title: 'OTP sent!', description: 'Check your phone for the verification code.' });
    } catch (err: any) {
      toast({ title: 'Failed to send OTP', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Verification failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gold-gradient mb-4">
            <Gem className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gold Shop Manager</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your shop</p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-2"><Mail className="w-4 h-4" /> Email</TabsTrigger>
            <TabsTrigger value="phone" className="gap-2" onClick={() => { setOtpSent(false); setOtp(''); }}><Phone className="w-4 h-4" /> Phone</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <form onSubmit={handleEmailSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  <p className="text-xs text-muted-foreground">Include country code (e.g. +91)</p>
                </div>
                <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Enter OTP sent to {phone}</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={loading || otp.length < 6}>
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
                <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={() => { setOtpSent(false); setOtp(''); }}>
                  Change number
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
