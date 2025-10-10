'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { AuthModalProvider } from '../contexts/AuthModalContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthModalProvider>
    </AuthProvider>
  );
}