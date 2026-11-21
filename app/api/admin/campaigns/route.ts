
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/supabase';

// Campaign စာရင်းကြည့်ရန်
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
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ campaigns: data });
  } catch {
    return NextResponse.json(
      { error: 'Campaign စာရင်းရယူ၍မရပါ။' },
      { status: 500 }
    );
  }
}

// Campaign အသစ်ဖန်တီးရန်
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

    const name = String(body.name || '').trim();
    const expiresAt = body.expiresAt;
    const maxDraws = Number(body.maxDraws);

    if (!name || !expiresAt || !Number.isInteger(maxDraws) || maxDraws < 1) {
      return NextResponse.json(
        { error: 'Campaign အချက်အလက်များ မှန်ကန်စွာ ဖြည့်ပါ။' },
        { status: 400 }
      );
    }

    const expiryDate = new Date(expiresAt);

    if (Number.isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiry Date သည် အနာဂတ်အချိန် ဖြစ်ရပါမယ်။' },
        { status: 400 }
      );
    }

    const { data, error } = await db()
      .from('campaigns')
      .insert({
        name,
        is_active: false,
        expires_at: expiryDate.toISOString(),
        max_draws: maxDraws
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, campaign: data },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Campaign ဖန်တီး၍မရပါ။ Database ကို စစ်ဆေးပါ။' },
      { status: 500 }
    );
  }
}

// Campaign Active / Inactive ပြောင်းရန်
export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const campaignId = String(body.id || '');
    const isActive = body.is_active;

    if (!campaignId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Campaign အချက်အလက် မမှန်ကန်ပါ။' },
        { status: 400 }
      );
    }

    if (isActive) {
      const { error } = await db().rpc('activate_campaign', {
        p_campaign_id: campaignId
      });

      if (error) throw error;
    } else {
      const { error } = await db()
        .from('campaigns')
        .update({ is_active: false })
        .eq('id', campaignId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
   } catch (error) {
    console.error('Campaign GET error:', error);
    return NextResponse.json(
      { error: 'Campaign စာရင်းရယူ၍မရပါ။' },
      { status: 500 }
    );
  }
}
