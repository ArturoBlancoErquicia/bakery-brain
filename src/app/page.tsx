import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
  // return null; // Or a loading spinner, but redirect is usually immediate on server
}
