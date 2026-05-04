import { redirect } from 'next/navigation';

import { SignUpGlassCard } from '@/components/auth/SignUpGlassCard';
import { getCurrentUser } from '@/lib/auth/get-current-user';

export const metadata = {
  title: 'Criar conta · KEYRA',
  description: 'Crie sua conta KEYRA — gestão financeira para clínicas de estética',
};

export default async function CadastroPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return <SignUpGlassCard />;
}
