
'use client';

import { useEffect, useState } from 'react';

type Employee = {
  employee_id: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadEmployees() {
    try {
      const res = await fetch('/api/admin/employees');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'စာရင်းရယူ၍မရပါ။');

      setEmployees(data.employees || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error ဖြစ်နေပါသည်။');
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function createEmployee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, fullName, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Account ဖန်တီး၍မရပါ။');

      setMessage(data.message);
      setEmployeeId('');
      setFullName('');
      setPassword('');
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error ဖြစ်နေပါသည်။');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2 className="gold">Employee Management</h2>
      <p className="small">Employee Account အသစ်ဖန်တီးရန်</p>

      <form onSubmit={createEmployee}>
        <label>Employee ID</label>
        <input
          className="field"
          value={employeeId}
          onChange={e => setEmployeeId(e.target.value)}
          placeholder="ဥပမာ - EMP001"
          required
        />

        <label>Full Name</label>
        <input
          className="field"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="ဝန်ထမ်းအမည်"
          required
        />

        <label>Password</label>
        <input
          className="field"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="အနည်းဆုံး ၈ လုံး"
          minLength={8}
          required
        />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Employee Account'}
        </button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <hr style={{ borderColor: '#69402d', margin: '24px 0' }} />

      <h2 className="gold">Employee List</h2>

      {employees.length === 0 ? (
        <p className="small">Employee စာရင်း မရှိသေးပါ။</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th align="left">Employee ID</th>
                <th align="left">Full Name</th>
                <th align="left">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.employee_id} style={{ borderTop: '1px solid #69402d' }}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.is_active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
