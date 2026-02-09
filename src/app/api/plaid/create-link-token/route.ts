import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLinkToken } from '@/lib/plaid';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if demo mode
        if (process.env.DEMO_MODE === 'true') {
            return NextResponse.json({
                link_token: 'demo-link-token',
                expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                request_id: 'demo-request',
            });
        }

        const linkTokenResponse = await createLinkToken(session.user.id);

        return NextResponse.json({
            link_token: linkTokenResponse.link_token,
            expiration: linkTokenResponse.expiration,
            request_id: linkTokenResponse.request_id,
        });
    } catch (error) {
        console.error('Error creating link token:', error);
        return NextResponse.json(
            { error: 'Failed to create link token' },
            { status: 500 }
        );
    }
}
