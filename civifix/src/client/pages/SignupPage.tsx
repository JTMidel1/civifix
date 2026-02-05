import React, { useCallback, useState } from 'react';
import { signupWithPassword } from 'modelence/client';
import { useMutation } from '@tanstack/react-query';
import { modelenceMutation } from '@modelence/react-query';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

type UserRole = 'Citizen' | 'Admin' | 'Technician';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sage-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest-200/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sage-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-accent-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <SignupForm />
    </div>
  );
}

function SignupForm() {
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createProfile } = useMutation({
    ...modelenceMutation('fixnet.createProfile'),
  });

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const confirmPassword = String(formData.get('confirmPassword'));
    const fullName = String(formData.get('fullName'));
    const phone = String(formData.get('phone'));
    const role = String(formData.get('role')) as UserRole;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create auth account
      await signupWithPassword({ email, password });

      // Create user profile
      await createProfile({ fullName, phone, role });

      setIsSignupSuccess(true);
    } catch (error) {
      toast.error((error as Error).message);
      console.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [createProfile]);

  if (isSignupSuccess) {
    return (
      <Card className="relative z-10 w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-elevated border border-sage-100 rounded-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-forest-100 to-sage-100 rounded-2xl flex items-center justify-center shadow-glow">
              <svg className="w-10 h-10 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl text-forest-900">
            Welcome to CiviFix!
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 pt-4">
          <p className="text-sage-600 text-center leading-relaxed">
            Your account has been created successfully. You can now sign in and start making a difference in your community.
          </p>
          <Link to="/login" className="w-full">
            <Button className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white shadow-soft hover:shadow-glow transition-all duration-300 rounded-xl py-2.5">
              Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative z-10 w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-elevated border border-sage-100 rounded-2xl my-8">
      <CardHeader className="text-center pb-2">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6 group">
          <div className="w-12 h-12 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-105">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-forest-900 font-bold text-xl block">CiviFix</span>
            <span className="text-sage-500 text-xs">Sustainable Communities</span>
          </div>
        </Link>
        <CardTitle className="text-xl text-forest-900">
          Create your account
        </CardTitle>
        <p className="text-sm text-sage-600 mt-1">Join us in building a better community</p>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="fullName" className="block mb-2 text-forest-800 font-medium">
              Full Name
            </Label>
            <Input
              type="text"
              name="fullName"
              id="fullName"
              placeholder="John Doe"
              required
              className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="email" className="block mb-2 text-forest-800 font-medium">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="john@example.com"
              required
              className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="block mb-2 text-forest-800 font-medium">
              Phone Number
            </Label>
            <Input
              type="tel"
              name="phone"
              id="phone"
              placeholder="+1 (555) 123-4567"
              required
              className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="role" className="block mb-2 text-forest-800 font-medium">
              I am a...
            </Label>
            <select
              name="role"
              id="role"
              defaultValue="Citizen"
              className="flex h-10 w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 focus-visible:ring-offset-2"
              required
            >
              <option value="Citizen">Citizen - Report issues in my community</option>
              <option value="Technician">Technician - Fix reported issues</option>
              <option value="Admin">Admin - Manage and coordinate</option>
            </select>
          </div>

          <div>
            <Label htmlFor="password" className="block mb-2 text-forest-800 font-medium">
              Password
            </Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="confirm-password" className="block mb-2 text-forest-800 font-medium">
              Confirm password
            </Label>
            <Input
              type="password"
              name="confirmPassword"
              id="confirm-password"
              placeholder="Confirm your password"
              required
              className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-xl"
            />
          </div>

          <div className="flex items-start bg-sage-50/50 p-3 rounded-xl">
            <div className="flex items-center h-5">
              <input
                id="consent-terms"
                type="checkbox"
                name="consent-terms"
                className="w-4 h-4 border-sage-300 rounded bg-white focus:ring-forest-400 text-forest-600 transition-colors"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <Label htmlFor="consent-terms" className="text-sage-700">
                I accept the <Link to="/terms" className="font-medium text-forest-600 hover:text-forest-700 hover:underline transition-colors">Terms and Conditions</Link>
              </Label>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white shadow-soft hover:shadow-glow transition-all duration-300 rounded-xl py-2.5"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : 'Create account'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pt-2 pb-6">
        <p className="text-center text-sm text-sage-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-forest-600 hover:text-forest-700 font-semibold hover:underline transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
