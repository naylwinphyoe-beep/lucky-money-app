
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import { db } from '@/lib/supabase';

// Employee စာရင်းကြည့်ရန်
export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await db()
      .from('employees')
      .select('employee_id, full_name, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ employees: data });
  } catch {
    return NextResponse.json(
      { error: 'Employee list ကို ရယူ၍မရပါ။' },
      { status: 500 }
    );
  }
}

// Employee Account အသစ်ဖန်တီးရန်
export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const employeeId = String(body.employeeId || '').trim();
    const fullName = String(body.fullName || '').trim();
    const password = String(body.password || '');

    if (!employeeId || !fullName || !password) {
      return NextResponse.json(
        { error: 'အချက်အလက်အားလုံး ဖြည့်ပါ။' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password အနည်းဆုံး ၈ လုံး ရှိရပါမယ်။' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { error } = await db()
      .from('employees')
      .insert({
        employee_id: employeeId,
        full_name: fullName,
        password_hash: passwordHash,
        is_active: true
      });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'ဒီ Employee ID ရှိပြီးသားပါ။' },
          { status: 409 }
        );
      }

      throw error;
    }

    return NextResponse.json(
      { success: true, message: 'Employee Account ဖန်တီးပြီးပါပြီ။' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Account ဖန်တီး၍မရပါ။ Server ကို စစ်ဆေးပါ။' },
      { status: 500 }
    );
  }
}
