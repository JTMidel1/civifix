import React, { useCallback, useState } from 'react';
import { loginWithPassword } from 'modelence/client';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sage-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest-200/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sage-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-accent-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <LoginForm />
    </div>
  );
}

function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await loginWithPassword({ email, password });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <Card className="relative z-10 w-full max-w-sm mx-auto bg-white/90 backdrop-blur-sm shadow-elevated border border-sage-100 rounded-2xl">
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
          Welcome back
        </CardTitle>
        <p className="text-sm text-sage-600 mt-1">Sign in to continue to your dashboard</p>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="block mb-2 text-forest-800 font-medium">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              required
              className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="password" className="block mb-2 text-forest-800 font-medium">
              Password
            </Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              required
              className="border-sage-200 focus:border-forest-400 focus:ring-forest-400 rounded-xl"
            />
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
                Signing in...
              </span>
            ) : 'Sign In'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pt-2 pb-6">
        <p className="text-center text-sm text-sage-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-forest-600 hover:text-forest-700 font-semibold hover:underline transition-colors"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
