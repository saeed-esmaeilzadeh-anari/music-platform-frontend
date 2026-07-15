import type { Metadata } from 'next';
import { SubscriptionClient } from './subscription-client';

export const metadata: Metadata = { title: 'Premium' };

export default function SubscriptionPage() {
  return <SubscriptionClient />;
}