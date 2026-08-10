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
import { loginSchema, type LoginFormData } from '@/features/auth/schemas';

export default function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { checkAuth } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });
      
      await checkAuth();
      toast.success('Welcome back!');
      navigate('/app/dashboard');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Invalid email or password');
      }
      console.error('Login failed', error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await api.get('/auth/google/url');
      window.location.href = response.data.data.url;
    } catch (error) {
      toast.error('Google Auth is currently unavailable');
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your details to access your dashboard."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-muted-foreground">Password</label>
            <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
          </div>
          <PasswordInput 
            placeholder="••••••••"
            {...register('password')}
            className={errors.password ? 'border-error focus-visible:ring-error' : ''}
          />
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input 
            type="checkbox" 
            id="rememberMe"
            className="rounded border-input text-accent focus:ring-accent"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe" className="text-sm text-muted-foreground">Remember me</label>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base mt-6" 
          variant="accent"
          isLoading={isSubmitting}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 mb-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">OR</span>
        </div>
      </div>

      <Button variant="outline" className="w-full h-12" type="button" onClick={handleGoogleAuth}>
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
