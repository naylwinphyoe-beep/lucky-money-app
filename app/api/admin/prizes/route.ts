
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/supabase';

// Campaign တစ်ခုအတွက် Prize စာရင်းကြည့်ရန်
export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    let query = db()
      .from('prizes')
      .select('*')
      .order('amount', { ascending: true });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ prizes: data });
  } catch {
    return NextResponse.json(
      { error: 'Prize စာရင်းရယူ၍မရပါ။' },
      { status: 500 }
    );
  }
}

// Prize အသစ်ထည့်ရန်
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

    const campaignId = String(body.campaignId || '');
    const amount = Number(body.amount);
    const quantity = Number(body.quantity);

    if (
      !campaignId ||
      !Number.isInteger(amount) ||
      amount < 1 ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        { error: 'Campaign, Amount နှင့် Quantity ကို မှန်ကန်စွာ ဖြည့်ပါ။' },
        { status: 400 }
      );
    }

    const { data: campaign, error: campaignError } = await db()
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .maybeSingle();

    if (campaignError) throw campaignError;

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign မတွေ့ပါ။' },
        { status: 404 }
      );
    }

    const { data, error } = await db()
      .from('prizes')
      .insert({
        campaign_id: campaignId,
        amount,
        quantity,
        claimed: 0,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, prize: data },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Prize ထည့်၍မရပါ။ Database ကို စစ်ဆေးပါ။' },
      { status: 500 }
    );
  }
}

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
    const prizeId = String(body.id || '');
    const isActive = body.is_active;

    if (!prizeId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Prize အချက်အလက် မမှန်ကန်ပါ။' },
        { status: 400 }
      );
    }

    const { data, error } = await db()
      .from('prizes')
      .update({ is_active: isActive })
      .eq('id', prizeId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      prize: data
    });
  } catch {
    return NextResponse.json(
      { error: 'Prize Status ပြောင်းလဲ၍မရပါ။' },
      { status: 400 }
    );
  }
}
