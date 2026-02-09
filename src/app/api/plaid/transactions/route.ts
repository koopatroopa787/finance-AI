import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTransactions, mapCategory } from '@/lib/plaid';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's accounts
        const accounts = await prisma.plaidAccount.findMany({
            where: { userId: session.user.id },
            include: {
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 100,
                },
            },
        });

        // Aggregate all transactions
        const allTransactions = accounts.flatMap(a => a.transactions);

        return NextResponse.json({
            transactions: allTransactions,
            totalCount: allTransactions.length,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

// Sync transactions (can be called periodically)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Skip sync in demo mode
        if (process.env.DEMO_MODE === 'true') {
            return NextResponse.json({ success: true, synced: 0 });
        }

        // Get user's accounts
        const accounts = await prisma.plaidAccount.findMany({
            where: { userId: session.user.id },
        });

        let totalSynced = 0;
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        for (const account of accounts) {
            if (account.accessToken.startsWith('demo')) continue;

            try {
                const transactionsResponse = await getTransactions(account.accessToken, startDate, endDate);

                for (const transaction of transactionsResponse.transactions) {
                    if (transaction.account_id !== account.accountId) continue;

                    await prisma.transaction.upsert({
                        where: { plaidTransactionId: transaction.transaction_id },
                        update: {
                            date: new Date(transaction.date),
                            amount: transaction.amount,
                            category: transaction.category || [],
                            primaryCategory: mapCategory(transaction.category),
                            merchantName: transaction.merchant_name,
                            description: transaction.name,
                            pending: transaction.pending,
                        },
                        create: {
                            accountId: account.id,
                            plaidTransactionId: transaction.transaction_id,
                            date: new Date(transaction.date),
                            amount: transaction.amount,
                            category: transaction.category || [],
                            primaryCategory: mapCategory(transaction.category),
                            merchantName: transaction.merchant_name,
                            description: transaction.name,
                            pending: transaction.pending,
                        },
                    });
                    totalSynced++;
                }
            } catch (error) {
                console.error(`Error syncing transactions for account ${account.id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            synced: totalSynced,
        });
    } catch (error) {
        console.error('Error syncing transactions:', error);
        return NextResponse.json(
            { error: 'Failed to sync transactions' },
            { status: 500 }
        );
    }
}
