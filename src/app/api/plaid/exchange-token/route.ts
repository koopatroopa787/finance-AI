import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exchangePublicToken, getAccounts, getTransactions, getInstitution, mapCategory } from '@/lib/plaid';
import prisma from '@/lib/prisma';
import { DEMO_ACCOUNTS } from '@/lib/demo-data';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { public_token, institution } = await request.json();

        // Check if demo mode - return mock data directly (bypass DB)
        if (process.env.DEMO_MODE === 'true' || public_token === 'demo-public-token') {
            // Return just the first account as "newly connected"
            const demoAccount = {
                ...DEMO_ACCOUNTS[0],
                userId: session.user.id,
                accessToken: 'demo-access-token',
                itemId: `demo-item-${Date.now()}`,
                accountId: `demo-account-${Date.now()}`,
            };

            const response = NextResponse.json({
                success: true,
                accounts: [demoAccount],
            });

            response.cookies.set('demo_connected', 'true', {
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 1 day
            });

            return response;
        }

        // Exchange public token for access token
        const exchangeResponse = await exchangePublicToken(public_token);
        const accessToken = exchangeResponse.access_token;
        const itemId = exchangeResponse.item_id;

        // Get accounts
        const accountsResponse = await getAccounts(accessToken);
        const accounts = accountsResponse.accounts;

        // Get institution name
        let institutionName = institution?.name || 'Unknown Bank';
        if (accountsResponse.item.institution_id) {
            try {
                const inst = await getInstitution(accountsResponse.item.institution_id);
                institutionName = inst.name;
            } catch {
                // Use fallback name
            }
        }

        // Store accounts in database
        const storedAccounts = [];
        for (const account of accounts) {
            const storedAccount = await prisma.plaidAccount.create({
                data: {
                    userId: session.user.id,
                    accessToken,
                    itemId,
                    accountId: account.account_id,
                    institution: institutionName,
                    accountName: account.name,
                    accountType: account.type,
                    currentBalance: account.balances.current || 0,
                    availableBalance: account.balances.available,
                    isoCurrencyCode: account.balances.iso_currency_code || 'USD',
                },
            });
            storedAccounts.push(storedAccount);
        }

        // Fetch and store transactions (last 90 days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        try {
            const transactionsResponse = await getTransactions(accessToken, startDate, endDate);

            for (const transaction of transactionsResponse.transactions) {
                const storedAccount = storedAccounts.find(a => a.accountId === transaction.account_id);
                if (!storedAccount) continue;

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
                        accountId: storedAccount.id,
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
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            // Continue anyway - we can fetch transactions later
        }

        return NextResponse.json({
            success: true,
            accounts: storedAccounts,
        });
    } catch (error) {
        console.error('Error exchanging token:', error);
        return NextResponse.json(
            { error: 'Failed to connect bank account' },
            { status: 500 }
        );
    }
}
