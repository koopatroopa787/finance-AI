'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaidLinkButton } from '@/components/plaid/plaid-link-button';
import { SpendingChart } from '@/components/charts/spending-chart';
import { formatCurrency, formatRelativeDate, getCategoryIcon } from '@/lib/utils';
import {
    Wallet,
    TrendingDown,
    Lightbulb,
    ArrowRight,
    RefreshCw,
    CreditCard,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
    accounts: Array<{
        id: string;
        institution: string;
        accountName: string;
        currentBalance: number;
        accountType: string;
    }>;
    totalBalance: number;
    totalSpending: number;
    spendingByCategory: Record<string, number>;
    recentTransactions: Array<{
        id: string;
        date: string;
        amount: number;
        category: string;
        merchantName: string | null;
        description: string;
        accountName: string;
    }>;
    insights: Array<{
        id: string;
        insightType: string;
        title: string;
        description: string;
        potentialSavings: number;
    }>;
    alerts: Array<{
        id: string;
        alertType: string;
        title: string;
        message: string;
        severity: string;
    }>;
    totalPotentialSavings: number;
    hasAccounts: boolean;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dashboard');
            const dashboardData = await res.json();
            setData(dashboardData);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            await fetch('/api/ai/analyze', { method: 'POST' });
            await fetchData();
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    // No accounts connected - show onboarding
    if (!data?.hasAccounts) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome to FinanceAI</h1>
                    <p className="text-slate-400">Connect your bank account to get started</p>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
                            <CreditCard className="w-10 h-10 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Bank Account</h2>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Securely link your bank account using Plaid. We'll analyze your transactions
                            and find opportunities to save money.
                        </p>
                        <PlaidLinkButton onSuccess={fetchData} />
                        <p className="text-slate-500 text-sm mt-4">
                            🔒 Bank-level security • Read-only access • We never store your credentials
                        </p>
                    </CardContent>
                </Card>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <Card className="bg-slate-800/30 border-slate-700">
                        <CardContent className="p-6 text-center">
                            <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-3" />
                            <h3 className="text-white font-medium mb-1">Find Unused Subscriptions</h3>
                            <p className="text-slate-400 text-sm">Detect recurring charges you forgot about</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/30 border-slate-700">
                        <CardContent className="p-6 text-center">
                            <Lightbulb className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                            <h3 className="text-white font-medium mb-1">Smart Insights</h3>
                            <p className="text-slate-400 text-sm">AI analyzes your spending patterns</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/30 border-slate-700">
                        <CardContent className="p-6 text-center">
                            <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-3" />
                            <h3 className="text-white font-medium mb-1">Save Money</h3>
                            <p className="text-slate-400 text-sm">Average users save $200+/month</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Your financial overview</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={handleAnalyze}
                        disabled={analyzing}
                    >
                        {analyzing ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Refresh Analysis
                    </Button>
                    <PlaidLinkButton onSuccess={fetchData} />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Total Balance</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {formatCurrency(data.totalBalance)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm mt-2">
                            Across {data.accounts.length} account{data.accounts.length !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Monthly Spending</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {formatCurrency(data.totalSpending)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <TrendingDown className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm mt-2">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-300 text-sm">Potential Savings</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {formatCurrency(data.totalPotentialSavings)}<span className="text-lg text-green-300">/mo</span>
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                        <Link href="/savings" className="text-green-400 text-sm mt-2 flex items-center hover:underline">
                            View opportunities <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spending Chart */}
                <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Spending by Category</CardTitle>
                        <CardDescription className="text-slate-400">Last 30 days breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SpendingChart data={data.spendingByCategory} />
                    </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                AI Insights
                            </CardTitle>
                            <CardDescription className="text-slate-400">Top savings opportunities</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.insights.length > 0 ? (
                            data.insights.slice(0, 3).map((insight) => (
                                <div
                                    key={insight.id}
                                    className="p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <Badge
                                                variant={insight.insightType === 'subscription' ? 'destructive' : 'secondary'}
                                                className="mb-2"
                                            >
                                                {insight.insightType.replace('_', ' ')}
                                            </Badge>
                                            <h4 className="text-white font-medium">{insight.title}</h4>
                                            <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                                                {insight.description}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-green-400 font-bold">
                                                +{formatCurrency(insight.potentialSavings)}
                                            </span>
                                            <p className="text-slate-500 text-xs">/month</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No insights yet</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 border-slate-600"
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                >
                                    Run Analysis
                                </Button>
                            </div>
                        )}
                        {data.insights.length > 3 && (
                            <Link href="/savings">
                                <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300">
                                    View All Insights <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Recent Transactions</CardTitle>
                    <CardDescription className="text-slate-400">Your latest spending activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {data.recentTransactions.slice(0, 10).map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                                        {getCategoryIcon(transaction.category)}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">
                                            {transaction.merchantName || transaction.description}
                                        </p>
                                        <p className="text-slate-500 text-sm">
                                            {transaction.category} • {formatRelativeDate(transaction.date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={transaction.amount > 0 ? 'text-red-400 font-medium' : 'text-green-400 font-medium'}>
                                        {transaction.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                                    </p>
                                    <p className="text-slate-500 text-xs">{transaction.accountName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-48 bg-slate-700" />
                    <Skeleton className="h-4 w-32 mt-2 bg-slate-700" />
                </div>
                <Skeleton className="h-10 w-40 bg-slate-700" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-6">
                            <Skeleton className="h-4 w-24 bg-slate-700" />
                            <Skeleton className="h-8 w-32 mt-2 bg-slate-700" />
                            <Skeleton className="h-3 w-20 mt-2 bg-slate-700" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                        <Skeleton className="h-64 w-full bg-slate-700" />
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 w-full bg-slate-700" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
