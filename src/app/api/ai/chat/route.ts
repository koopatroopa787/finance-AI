import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatWithContext } from '@/lib/claude';
import prisma from '@/lib/prisma';
import { DEMO_TRANSACTIONS } from '@/lib/demo-data';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id && process.env.DEMO_MODE !== 'true') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { message, history } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // --- DEMO MODE ---
        if (process.env.DEMO_MODE === 'true') {
            const claudeTransactions = DEMO_TRANSACTIONS.map((t: any) => ({
                date: t.date,
                amount: t.amount,
                category: t.category,
                merchantName: t.merchantName,
                description: t.description,
            }));

            const response = await chatWithContext(message, claudeTransactions, history || []);
            return NextResponse.json({ response });
        }
        // --- END DEMO MODE ---

        const userId = session!.user!.id;

        // Fetch user's recent transactions for context (last 30 days)
        const recentTransactions = await prisma.transaction.findMany({
            where: {
                account: { userId },
                date: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
            orderBy: { date: 'desc' },
            take: 50, // Limit context size
        });

        const claudeTransactions = recentTransactions.map(t => ({
            date: t.date.toISOString().split('T')[0],
            amount: Number(t.amount),
            category: t.primaryCategory || 'Uncategorized',
            merchantName: t.merchantName,
            description: t.description,
        }));

        const response = await chatWithContext(message, claudeTransactions, history || []);

        return NextResponse.json({ response });

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        );
    }
}
