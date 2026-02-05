import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { modelenceMutation } from '@modelence/react-query';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { toast } from 'react-hot-toast';

type UserRole = 'Citizen' | 'Admin' | 'Technician';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createProfile } = useMutation({
    ...modelenceMutation('fixnet.createProfile'),
  });

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('fullName'));
    const phone = String(formData.get('phone'));
    const role = String(formData.get('role')) as UserRole;

    try {
      await createProfile({ fullName, phone, role });
      toast.success('Profile completed!');

      // Redirect based on role
      const path = role === 'Admin' ? '/admin' :
        role === 'Technician' ? '/technician' : '/citizen';
      navigate(path);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [createProfile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white text-gray-900">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-primary-600 font-bold text-xl">CiviFix</span>
          </div>
          <CardTitle className="text-xl">
            Complete Your Profile
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Please provide some additional information to get started.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="fullName" className="block mb-2">
                Full Name
              </Label>
              <Input
                type="text"
                name="fullName"
                id="fullName"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="block mb-2">
                Phone Number
              </Label>
              <Input
                type="tel"
                name="phone"
                id="phone"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <div>
              <Label htmlFor="role" className="block mb-2">
                I am a...
              </Label>
              <select
                name="role"
                id="role"
                defaultValue="Citizen"
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                required
              >
                <option value="Citizen">Citizen - Report issues in my community</option>
                <option value="Technician">Technician - Fix reported issues</option>
                <option value="Admin">Admin - Manage and coordinate</option>
              </select>
            </div>

            <Button
              className="w-full bg-forest-600 text-white hover:bg-forest-700"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
