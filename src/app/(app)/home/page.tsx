import { redirect } from 'next/navigation';

export default function RootPage() {
   console.log("HomePage");
  redirect('/home');
}

