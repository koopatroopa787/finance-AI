import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'AI Finance Analyst - Save Money with AI-Powered Insights',
    description: 'Connect your bank accounts and let AI analyze your spending to find savings opportunities. Detect unused subscriptions, identify spending patterns, and get personalized financial advice.',
    keywords: ['finance', 'AI', 'savings', 'spending analysis', 'subscriptions', 'personal finance'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
