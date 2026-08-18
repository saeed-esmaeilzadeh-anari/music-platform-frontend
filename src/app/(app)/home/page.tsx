// import { redirect } from 'next/navigation';

// export default function RootPage() {
//    console.log("HomePage");
//   redirect('/home');
// }

import type { Metadata } from 'next';
import { HomeClient } from '../home-client';

export const metadata: Metadata = {
  title: 'Home',
};

export default function HomePage() {
  return <HomeClient />;
}

