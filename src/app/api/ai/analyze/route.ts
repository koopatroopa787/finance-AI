import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeTransactions, detectAlerts } from '@/lib/claude';
import prisma from '@/lib/prisma';
import { DEMO_TRANSACTIONS, DEMO_INSIGHTS } from '@/lib/demo-data';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id && process.env.DEMO_MODE !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const insights = process.env.DEMO_MODE === 'true'
            ? DEMO_INSIGHTS
            : await prisma.aIInsight.findMany({
                where: { userId: session!.user!.id },
                orderBy: { createdAt: 'desc' },
            });
        return NextResponse.json({ insights });
    } catch (error) {
        console.error('Error fetching insights:', error);
        return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id && process.env.DEMO_MODE !== 'true') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // --- DEMO MODE ---
        if (process.env.DEMO_MODE === 'true') {
            // Call real Claude API with demo data
            // We can mix static insights with dynamic ones if we want, or just use dynamic.
            // Let's try to get real dynamic insights first.
            try {
                const claudeTransactions = DEMO_TRANSACTIONS.map((t: any) => ({
                    date: t.date,
                    amount: t.amount,
                    category: t.category,
                    merchantName: t.merchantName,
                    description: t.description,
                }));

                const aiInsights = await analyzeTransactions(claudeTransactions);

                // If AI fails (e.g. no key), fall back to static demo insights
                const combinedInsights = aiInsights.length > 0 ? aiInsights : DEMO_INSIGHTS;

                return NextResponse.json({
                    success: true,
                    insights: combinedInsights,
                    alerts: [], // We'll let the dashboard handle alerts or add simple ones
                });
            } catch (error) {
                console.error('Demo AI Analysis failed:', error);
                return NextResponse.json({
                    success: true,
                    insights: DEMO_INSIGHTS,
                    alerts: [],
                });
            }
        }
        // --- END DEMO MODE ---

        const userId = session!.user!.id;

        // Fetch user's recent transactions for analysis (last 30 days)
        const recentTransactions = await prisma.transaction.findMany({
            where: {
                account: { userId },
                date: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
            take: 100,
        });

        if (recentTransactions.length === 0) {
            return NextResponse.json({ message: 'No transactions to analyze' });
        }

        // Run AI Analysis
        const claudeTransactions = recentTransactions.map(t => ({
            date: t.date.toISOString().split('T')[0],
            amount: Number(t.amount),
            category: t.primaryCategory || 'Uncategorized',
            merchantName: t.merchantName,
            description: t.description,
        }));

        const insights = await analyzeTransactions(claudeTransactions);

        // Store Insights
        const savedInsights = [];
        for (const insight of insights) {
            // Check for duplicate existing active insight
            const existing = await prisma.aIInsight.findFirst({
                where: {
                    userId,
                    title: insight.title,
                    isActioned: false,
                },
            });

            if (!existing) {
                const saved = await prisma.aIInsight.create({
                    data: {
                        userId,
                        insightType: insight.type,
                        title: insight.title,
                        description: insight.description,
                        potentialSavings: insight.potentialSavings,
                        relatedMerchant: insight.relatedMerchant,
                    },
                });
                savedInsights.push(saved);
            }
        }

        // Run Rule-based Alerts
        // Run Rule-based Alerts
        const alerts = await detectAlerts(claudeTransactions);
        const savedAlerts = [];
        for (const alert of alerts) {
            const existing = await prisma.alert.findFirst({
                where: {
                    userId,
                    title: alert.title,
                    isRead: false,
                },
            });

            if (!existing) {
                const saved = await prisma.alert.create({
                    data: {
                        userId,
                        alertType: alert.type,
                        title: alert.title,
                        message: alert.message,
                        severity: alert.severity,
                    },
                });
                savedAlerts.push(saved);
            }
        }

        return NextResponse.json({
            success: true,
            insightsCount: savedInsights.length,
            alertsCount: savedAlerts.length,
            insights: savedInsights,
            alerts: savedAlerts,
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze transactions' },
            { status: 500 }
        );
    }
}
