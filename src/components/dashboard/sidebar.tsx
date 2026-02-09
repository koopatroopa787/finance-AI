'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    DollarSign,
    LayoutDashboard,
    MessageSquare,
    PiggyBank,
    Bell,
    Settings,
    LogOut,
    CreditCard,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { href: '/savings', icon: PiggyBank, label: 'Savings' },
    { href: '/alerts', icon: Bell, label: 'Alerts' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800/50 border-r border-slate-700 flex flex-col">
            {/* Logo */}
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">FinanceAI</span>
                </Link>
            </div>

            <Separator className="bg-slate-700" />

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <Separator className="bg-slate-700" />

            {/* User section */}
            <div className="p-4 space-y-4">
                <Link
                    href="/settings"
                    className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        pathname === '/settings'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    )}
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>

                <div className="flex items-center gap-3 px-4 py-3">
                    <Avatar>
                        <AvatarFallback className="bg-blue-500 text-white">
                            {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {session?.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {session?.user?.email}
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => signOut({ callbackUrl: '/' })}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
