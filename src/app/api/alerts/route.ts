import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id && process.env.DEMO_MODE !== 'true') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // --- DEMO MODE MOCK ---
        if (process.env.DEMO_MODE === 'true') {
            return NextResponse.json({
                alerts: [
                    { id: 'alt_1', alertType: 'unusual_spending', title: 'Unusual Transaction Detected', message: 'A transaction of $299.00 at "Electronics Store" is significantly higher than average.', severity: 'medium', isRead: false, createdAt: new Date().toISOString() },
                    { id: 'alt_2', alertType: 'high_spending', title: 'High Food Spending', message: 'You spent 30% more on dining out this week compared to last month.', severity: 'low', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
                ],
            });
        }
        // --- END DEMO MODE ---

        const alerts = await prisma.alert.findMany({
            where: { userId: session!.user!.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ alerts });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id && process.env.DEMO_MODE !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // --- DEMO MODE MOCK ---
        if (process.env.DEMO_MODE === 'true') {
            const { alertId } = await request.json();
            return NextResponse.json({ success: true, message: `Mock alert ${alertId} marked as read` });
        }
        // --- END DEMO MODE ---

        const { alertId } = await request.json();

        await prisma.alert.update({
            where: {
                id: alertId,
                userId: session!.user!.id, // Ensure ownership
            },
            data: { isRead: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update alert' },
            { status: 500 }
        );
    }
}
