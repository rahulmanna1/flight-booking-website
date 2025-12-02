'use client';

import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Live Chat Widget Component
 * Integrates Crisp chat for customer support
 * Free tier: unlimited chats, 2 team members
 * 
 * Setup Instructions:
 * 1. Sign up at https://crisp.chat/
 * 2. Get your Website ID from Settings -> Setup Instructions
 * 3. Add NEXT_PUBLIC_CRISP_WEBSITE_ID to your .env.local
 * 
 * Alternative: Use Tawk.to (also free)
 * 1. Sign up at https://www.tawk.to/
 * 2. Get your Property ID and Widget ID
 * 3. Add to .env.local
 */

interface LiveChatWidgetProps {
  variant?: 'crisp' | 'tawk' | 'custom';
}

export default function LiveChatWidget({ variant }: LiveChatWidgetProps) {
  const crispWebsiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
  const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('[LiveChat] Environment check:', {
      hasCrisp: !!crispWebsiteId,
      hasTawk: !!(tawkPropertyId && tawkWidgetId),
      tawkPropertyId: tawkPropertyId ? `${tawkPropertyId.substring(0, 8)}...` : 'not set',
      tawkWidgetId: tawkWidgetId ? `${tawkWidgetId.substring(0, 5)}...` : 'not set'
    });
  }
  
  // Auto-detect provider if not specified
  const detectedVariant = variant || 
    (crispWebsiteId ? 'crisp' : 
     (tawkPropertyId && tawkWidgetId ? 'tawk' : 'custom'));
  
  useEffect(() => {
    // Only load in browser
    if (typeof window === 'undefined') return;

    console.log('[LiveChat] Loading with variant:', detectedVariant);

    if (detectedVariant === 'crisp' && crispWebsiteId) {
      console.log('[LiveChat] Loading Crisp chat...');
      // Load Crisp Chat
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = crispWebsiteId;
      
      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.head.appendChild(script);

      // Customize Crisp appearance
      script.onload = () => {
        if (window.$crisp) {
          // Set color theme
          window.$crisp.push(['config', 'color:theme', ['blue']]);
          // Set initial message
          window.$crisp.push(['config', 'hide:on:mobile', [false]]);
          // Auto-show on certain pages (optional)
          if (window.location.pathname.includes('/booking')) {
            setTimeout(() => {
              window.$crisp.push(['do', 'chat:open']);
            }, 3000);
          }
        }
      };

      return () => {
        // Cleanup on unmount
        const existingScript = document.querySelector('script[src*="crisp.chat"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }

    if (detectedVariant === 'tawk' && tawkPropertyId && tawkWidgetId) {
      // Load Tawk.to Chat
      console.log('[LiveChat] Loading Tawk.to chat...', {
        propertyId: tawkPropertyId,
        widgetId: tawkWidgetId,
        scriptUrl: `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`
      });
      
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      script.onload = () => {
        console.log('[LiveChat] Tawk.to script loaded successfully');
      };
      
      script.onerror = (error) => {
        console.error('[LiveChat] Failed to load Tawk.to script:', error);
      };
      
      document.body.appendChild(script);
      console.log('[LiveChat] Tawk.to script element appended to body');

      return () => {
        const existingScript = document.querySelector('script[src*="tawk.to"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [detectedVariant, crispWebsiteId, tawkPropertyId, tawkWidgetId]);

  // Show nothing if no API keys configured - chat widget will load automatically
  if (!crispWebsiteId && !tawkPropertyId) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => alert('Chat will be available soon! For now, please email support@flightbooker.com')}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="Chat with us"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="ml-2 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Need help?
          </span>
        </button>
      </div>
    );
  }

  // Return null when chat widget is loaded (it will appear automatically)
  return null;
}

// Extend Window type for TypeScript
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}
