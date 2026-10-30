'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { PiggyBank, Sparkles, CheckCircle, TrendingDown, CreditCard, AlertTriangle, Lightbulb, Download } from 'lucide-react';

interface Insight {
    id: string;
    insightType: string;
    title: string;
    description: string;
    potentialSavings: number;
    relatedMerchant: string | null;
    isActioned: boolean;
    createdAt: string;
}

const insightTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
    subscription: { icon: CreditCard, color: 'text-red-400', bgColor: 'bg-red-500/20' },
    spending_pattern: { icon: TrendingDown, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    savings_opportunity: { icon: Lightbulb, color: 'text-green-400', bgColor: 'bg-green-500/20' },
    bill_review: { icon: AlertTriangle, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
};

export default function SavingsPage() {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const res = await fetch('/api/ai/analyze');
            const data = await res.json();
            setInsights(data.insights || []);
        } catch (error) {
            console.error('Failed to fetch insights:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalSavings = insights
        .filter((i) => !i.isActioned)
        .reduce((sum, i) => sum + i.potentialSavings, 0);

    const exportInsights = () => {
        const csvCell = (value: string) => {
            const safeValue = /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
            return `"${safeValue.replace(/"/g, '""')}"`;
        };
        const rows = [
            'Type,Title,Description,Potential Savings,Actioned',
            ...insights.map((insight) => [
                csvCell(insight.insightType),
                csvCell(insight.title),
                csvCell(insight.description),
                insight.potentialSavings.toFixed(2),
                insight.isActioned ? 'Yes' : 'No',
            ].join(',')),
        ];
        const url = URL.createObjectURL(new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'savings-insights.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const markAsActioned = async (id: string) => {
        // Update locally immediately for better UX
        setInsights(insights.map(i =>
            i.id === id ? { ...i, isActioned: true } : i
        ));
        // TODO: Add API call to persist this
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64 bg-slate-700" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-48 bg-slate-700" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <PiggyBank className="w-8 h-8 text-green-400" />
                        Savings Opportunities
                    </h1>
                    <p className="text-slate-400 mt-1">
                        AI-detected ways to reduce your spending
                    </p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={exportInsights} disabled={insights.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-300 text-sm font-medium">Total Potential Savings</p>
                            <p className="text-4xl font-bold text-white mt-1">
                                {formatCurrency(totalSavings)}
                                <span className="text-lg text-green-300">/month</span>
                            </p>
                            <p className="text-green-400 mt-2">
                                That's {formatCurrency(totalSavings * 12)}/year!
                            </p>
                        </div>
                        <div className="w-20 h-20 rounded-2xl bg-green-500/20 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-green-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Insights Grid */}
            {insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {insights.map((insight) => {
                        const config = insightTypeConfig[insight.insightType] || insightTypeConfig.savings_opportunity;
                        const Icon = config.icon;

                        return (
                            <Card
                                key={insight.id}
                                className={`bg-slate-800/50 border-slate-700 transition-all ${insight.isActioned ? 'opacity-60' : 'hover:border-slate-600'
                                    }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                                                <Icon className={`w-5 h-5 ${config.color}`} />
                                            </div>
                                            <div>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs mb-1"
                                                >
                                                    {insight.insightType.replace('_', ' ')}
                                                </Badge>
                                                <CardTitle className="text-lg text-white">
                                                    {insight.title}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-green-400 font-bold text-lg">
                                                +{formatCurrency(insight.potentialSavings)}
                                            </p>
                                            <p className="text-slate-500 text-xs">/month</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-400 text-sm mb-4">
                                        {insight.description}
                                    </p>
                                    {insight.relatedMerchant && (
                                        <p className="text-slate-500 text-sm mb-4">
                                            Related to: <span className="text-slate-300">{insight.relatedMerchant}</span>
                                        </p>
                                    )}
                                    {insight.isActioned ? (
                                        <Button
                                            variant="outline"
                                            className="w-full border-green-600 text-green-400 hover:bg-green-500/10"
                                            disabled
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Marked as Resolved
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                                            onClick={() => markAsActioned(insight.id)}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Mark as Done
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
                            <Lightbulb className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Insights Yet</h3>
                        <p className="text-slate-400 mb-6">
                            Connect a bank account and let AI analyze your transactions to find savings opportunities.
                        </p>
                        <Button className="bg-blue-500 hover:bg-blue-600">
                            Run Analysis
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
