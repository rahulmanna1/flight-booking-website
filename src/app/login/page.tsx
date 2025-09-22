'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Redirect to dashboard or previous page
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}