import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
  return new TextEncoder().encode(value);
};
export async function makeSession(payload: { role: 'employee'|'admin'; employeeId?: string }) {
  const token = await new SignJWT(payload).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(secret());
  (await cookies()).set('lm_session', token, {httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:8*60*60});
}
export async function getSession() {
  const token = (await cookies()).get('lm_session')?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret())).payload as {role:'employee'|'admin'; employeeId?:string}; }
  catch { return null; }
}
