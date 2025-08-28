import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        
        return NextResponse.json({
            success: true,
            sessionExists: !!session,
            userExists: !!session?.user,
            ssidExists: !!session?.user?.ssid,
            userKeys: session?.user ? Object.keys(session.user) : [],
            provider: session?.user?.provider || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}