'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegistrationSuccess = () => {
    // Redirect to home or dashboard after successful registration
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegisterForm onSuccess={handleRegistrationSuccess} />
      </div>
    </div>
  );
}
