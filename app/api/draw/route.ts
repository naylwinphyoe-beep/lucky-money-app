import {NextResponse} from 'next/server';
import {getSession} from '@/lib/session';
import {db} from '@/lib/supabase';
export async function POST(){const s=await getSession();if(!s||s.role!=='employee'||!s.employeeId)return NextResponse.json({error:'Login ပြန်ဝင်ပါ။'},{status:401});const {data,error}=await db().rpc('draw_lucky_prize',{p_employee_id:s.employeeId});if(error)return NextResponse.json({error:error.message.includes('ALREADY_DRAWN')?'မဲဖောက်ပြီးသားဖြစ်ပါသည်။':error.message.includes('CAMPAIGN_CLOSED')?'မဲဖောက်ချိန် ကုန်ဆုံးသွားပါပြီ။':'မဲဖောက်၍မရပါ။ Admin ကို ဆက်သွယ်ပါ။'},{status:400});return NextResponse.json({result:data});}
