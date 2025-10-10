import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// 客户端Stripe实例
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// 服务端Stripe实例
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Stripe配置常量
export const STRIPE_CONFIG = {
  currency: 'usd', // 美元
  payment_method_types: ['card'],
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: 'never',
  },
} as const;