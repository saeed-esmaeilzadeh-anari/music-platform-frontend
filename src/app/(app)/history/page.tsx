import type { Metadata } from 'next';
import { HistoryClient } from './history-client';

export const metadata: Metadata = { title: 'Listening History' };

export default function HistoryPage() {
  return <HistoryClient />;
}
