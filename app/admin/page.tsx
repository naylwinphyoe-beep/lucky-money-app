import CampaignManager from './CampaignManager';
import { getSession } from '@/lib/session';
import { db } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import EmployeeManager from './EmployeeManager';

export default async function Admin() {
  const s = await getSession();

  if (!s || s.role !== 'admin') {
    redirect('/login');
  }

  const { data: campaign } = await db()
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: draws } = await db()
    .from('draws')
    .select('result_id,employee_id,amount,created_at,payment_status')
    .order('created_at', { ascending: false });

  const total = (draws || []).reduce(
    (a, d) => a + Number(d.amount),
    0
  );

  return (
  <main className="shell">
    <h1 className="title">Admin Dashboard</h1>

    <EmployeeManager />

    <CampaignManager />

    <section className="panel">
      <h2 className="gold">Draw & Payment Verification</h2>
      <p className="small">
        Total Draw Amount: {total.toLocaleString()} MMK
      </p>
    </section>
  </main>
);
}
