import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DEMO_ACCOUNTS, DEMO_TRANSACTIONS, DEMO_INSIGHTS, DEMO_ALERTS } from '@/lib/demo-data';

// Get user's dashboard data
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id && process.env.DEMO_MODE !== 'true') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // --- DEMO MODE BYPASS ---
        if (process.env.DEMO_MODE === 'true') {
            // Check for a specific cookie/header to simulate "connected" state
            // For simplicity, let's look for a query param or just always return true for now, 
            // BUT the user wants to see the connection flow.
            // If we always return true, they never see the "Connect Bank" screen.
            // Let's check if the request has a cookie "demo_connected=true"
            const cookies = request.cookies;
            const isDemoConnected = cookies.get('demo_connected')?.value === 'true';

            if (!isDemoConnected) {
                return NextResponse.json({
                    accounts: [],
                    totalBalance: 0,
                    totalSpending: 0,
                    spendingByCategory: {},
                    recentTransactions: [],
                    insights: [],
                    alerts: [],
                    totalPotentialSavings: 0,
                    hasAccounts: false, // Show onboarding
                });
            }

            return NextResponse.json({
                accounts: DEMO_ACCOUNTS,
                totalBalance: DEMO_ACCOUNTS.reduce((sum, a) => a.accountType === 'credit' ? sum - a.currentBalance : sum + a.currentBalance, 0),
                totalSpending: 2345.67,
                spendingByCategory: {
                    'Food and Drink': 450.23,
                    'Shops': 320.10,
                    'Entertainment': 85.99,
                    'Service': 150.00,
                    'Travel': 890.00,
                },
                recentTransactions: DEMO_TRANSACTIONS,
                insights: DEMO_INSIGHTS,
                alerts: DEMO_ALERTS,
                totalPotentialSavings: DEMO_INSIGHTS.reduce((sum, i) => sum + i.potentialSavings, 0),
                hasAccounts: true,
            });
        }
        // --- END DEMO MODE ---

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get accounts with transactions
        const accounts = await prisma.plaidAccount.findMany({
            where: { userId: session.user.id },
            include: {
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 50,
                },
            },
        });

        // Get insights
        const insights = await prisma.aIInsight.findMany({
            where: {
                userId: session.user.id,
                isActioned: false,
            },
            orderBy: { potentialSavings: 'desc' },
            take: 5,
        });

        // Get unread alerts
        const alerts = await prisma.alert.findMany({
            where: {
                userId: session.user.id,
                isRead: false,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        // Calculate totals
        const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

        // Get all transactions for spending analysis
        const allTransactions = await prisma.transaction.findMany({
            where: {
                account: {
                    userId: session.user.id,
                },
                date: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                amount: { gt: 0 },
            },
        });

        // Calculate spending by category
        const spendingByCategory = allTransactions.reduce((acc, t) => {
            acc[t.primaryCategory] = (acc[t.primaryCategory] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        const totalSpending = Object.values(spendingByCategory).reduce((a, b) => a + b, 0);
        const totalPotentialSavings = insights.reduce((sum, i) => sum + i.potentialSavings, 0);

        return NextResponse.json({
            accounts: accounts.map(a => ({
                id: a.id,
                institution: a.institution,
                accountName: a.accountName,
                currentBalance: a.currentBalance,
                accountType: a.accountType,
            })),
            totalBalance,
            totalSpending,
            spendingByCategory,
            recentTransactions: accounts.flatMap(a =>
                a.transactions.map(t => ({
                    id: t.id,
                    date: t.date,
                    amount: t.amount,
                    category: t.primaryCategory,
                    merchantName: t.merchantName,
                    description: t.description,
                    accountName: a.accountName,
                }))
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20),
            insights,
            alerts,
            totalPotentialSavings,
            hasAccounts: accounts.length > 0,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Only return 500 if not in demo mode (which shouldn't happen with our guard above, but safe to keep)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
