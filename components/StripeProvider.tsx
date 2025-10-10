'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// 确保在客户端加载Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
  amount?: number;
}

export default function StripeProvider({ 
  children, 
  clientSecret,
  amount 
}: StripeProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#3b82f6', // Dvit blue
        colorBackground: 'rgba(255, 255, 255, 0.05)', // 半透明白色背景
        colorText: '#ffffff', // 白色文字
        colorTextSecondary: 'rgba(255, 255, 255, 0.7)', // 半透明白色文字
        colorDanger: '#ef4444', // 红色错误提示
        fontFamily: 'SF Pro Display, system-ui, sans-serif', // Dvit字体
        spacingUnit: '4px',
        borderRadius: '12px', // 更圆润的边角
        fontSizeBase: '16px',
        fontWeightNormal: '400',
        fontWeightMedium: '500',
      },
      rules: {
        '.Input': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '16px',
          color: '#ffffff',
          backdropFilter: 'blur(8px)',
        },
        '.Input:focus': {
          border: '1px solid #3b82f6',
          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
          outline: 'none',
        },
        '.Input::placeholder': {
          color: 'rgba(255, 255, 255, 0.4)',
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          color: '#ffffff',
          marginBottom: '8px',
        },
        '.Tab': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
        },
        '.Tab:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
        },
        '.Tab--selected': {
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid #3b82f6',
          color: '#ffffff',
        },
        '.Error': {
          color: '#ef4444',
          fontSize: '14px',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : undefined}>
      {children}
    </Elements>
  );
}