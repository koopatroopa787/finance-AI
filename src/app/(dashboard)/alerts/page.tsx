'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeDate } from '@/lib/utils';
import { Bell, Check, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

interface Alert {
    id: string;
    alertType: string;
    title: string;
    message: string;
    severity: string;
    isRead: boolean;
    createdAt: string;
}

const severityConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
    low: { icon: Info, color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
    medium: { icon: AlertCircle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
    high: { icon: AlertTriangle, color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' },
    critical: { icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' },
};

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch('/api/alerts');
            const data = await res.json();
            setAlerts(data.alerts || []);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId: id }),
            });
            setAlerts(alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
        } catch (error) {
            console.error('Failed to mark alert as read:', error);
        }
    };

    const markAllAsRead = async () => {
        const unreadAlerts = alerts.filter((a) => !a.isRead);
        for (const alert of unreadAlerts) {
            await markAsRead(alert.id);
        }
    };

    const unreadCount = alerts.filter((a) => !a.isRead).length;

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64 bg-slate-700" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 bg-slate-700" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-yellow-400" />
                        Alerts
                        {unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                        )}
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Proactive notifications about your finances
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={markAllAsRead}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Mark All as Read
                    </Button>
                )}
            </div>

            {/* Alerts List */}
            {alerts.length > 0 ? (
                <div className="space-y-4">
                    {alerts.map((alert) => {
                        const config = severityConfig[alert.severity] || severityConfig.medium;
                        const Icon = config.icon;

                        return (
                            <Card
                                key={alert.id}
                                className={`bg-slate-800/50 border transition-all ${alert.isRead
                                        ? 'border-slate-700 opacity-60'
                                        : `${config.borderColor} border-l-4`
                                    }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-5 h-5 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-white font-medium">{alert.title}</h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${config.color} border-current`}
                                                        >
                                                            {alert.severity}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-400 text-sm">{alert.message}</p>
                                                    <p className="text-slate-500 text-xs mt-2">
                                                        {formatRelativeDate(alert.createdAt)}
                                                    </p>
                                                </div>
                                                {!alert.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-400 hover:text-white flex-shrink-0"
                                                        onClick={() => markAsRead(alert.id)}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
                        <p className="text-slate-400">
                            You have no alerts at the moment. We'll notify you if we detect anything unusual.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
