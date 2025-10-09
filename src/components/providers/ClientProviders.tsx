'use client';

import { CaptchaProvider } from '@/components/security/CaptchaProvider';
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';
import { AdvancedSearchProvider } from '@/contexts/AdvancedSearchContext';
import { PaymentProvider } from '@/contexts/PaymentContext';
import { BookingProvider } from '@/contexts/BookingContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { PriceAlertProvider } from '@/contexts/PriceAlertContext';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <CaptchaProvider
      hideDefaultBadge={false}
      onError={(error) => {
        // In production, you might want to log this to an external service
        if (process.env.NODE_ENV === 'development') {
          console.error('🔒 CAPTCHA Error:', error);
        }
      }}
      onSuccess={(token, action) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ CAPTCHA Success: ${action}`);
        }
      }}
    >
      <AuthProvider>
        <CurrencyProvider>
          <EnhancedAuthProvider>
            <AdvancedSearchProvider>
              <PaymentProvider>
                <BookingProvider>
                  <PriceAlertProvider>
                    {children}
                  </PriceAlertProvider>
                </BookingProvider>
              </PaymentProvider>
            </AdvancedSearchProvider>
          </EnhancedAuthProvider>
        </CurrencyProvider>
      </AuthProvider>
    </CaptchaProvider>
  );
}
