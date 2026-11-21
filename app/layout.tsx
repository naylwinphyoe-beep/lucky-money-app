import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {title:'Tazaungdaing Lucky Money',description:'Staff lucky money draw'};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="my"><body>{children}</body></html>; }
