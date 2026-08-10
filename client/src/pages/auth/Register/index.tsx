import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/store/useAuth';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { checkAuth } = useAuth();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const parts = data.name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || firstName; // fallback to first name if no last name provided

      await api.post('/auth/register', {
        firstName,
        lastName,
        email: data.email,
        password: data.password
      });
      
      await checkAuth(); // Load the newly registered user into state
      toast.success('Account created successfully! Check your email.');
      navigate('/onboarding');
    } catch (error) {
      // Errors are already handled by the global api interceptor toast, but we can do extra logging if needed
      console.error('Registration failed', error);
    }
  };

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Start building your personalized career roadmap today."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Full Name</label>
          <Input 
            placeholder="John Doe"
            {...register('name')}
            className={errors.name ? 'border-error focus-visible:ring-error' : ''}
          />
          {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Email</label>
          <Input 
            type="email" 
            placeholder="john@university.edu"
            {...register('email')}
            className={errors.email ? 'border-error focus-visible:ring-error' : ''}
          />
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Password</label>
          <PasswordInput 
            placeholder="••••••••"
            {...register('password')}
            className={errors.password ? 'border-error focus-visible:ring-error' : ''}
          />
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Confirm Password</label>
          <PasswordInput 
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-error focus-visible:ring-error' : ''}
          />
          {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base mt-6" 
          variant="accent"
          isLoading={isSubmitting}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
