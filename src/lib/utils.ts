import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

export function formatRelativeDate(date: Date | string): string {
    const now = new Date();
    const target = new Date(date);
    const diffInDays = Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(date);
}

export function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        'Food and Drink': '#FF6B6B',
        'Shopping': '#4ECDC4',
        'Transportation': '#45B7D1',
        'Entertainment': '#96CEB4',
        'Bills and Utilities': '#FFEAA7',
        'Healthcare': '#DDA0DD',
        'Travel': '#98D8C8',
        'Transfer': '#B8B8B8',
        'Income': '#4CAF50',
        'Other': '#9E9E9E',
    };
    return colors[category] || colors['Other'];
}

export function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        'Food and Drink': '🍔',
        'Shopping': '🛍️',
        'Transportation': '🚗',
        'Entertainment': '🎬',
        'Bills and Utilities': '📱',
        'Healthcare': '💊',
        'Travel': '✈️',
        'Transfer': '💸',
        'Income': '💰',
        'Other': '📦',
    };
    return icons[category] || icons['Other'];
}
