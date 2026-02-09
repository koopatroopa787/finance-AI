import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

export const plaidClient = new PlaidApi(configuration);

export async function createLinkToken(userId: string) {
    const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'AI Finance Analyst',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
    });
    return response.data;
}

export async function exchangePublicToken(publicToken: string) {
    const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
    });
    return response.data;
}

export async function getAccounts(accessToken: string) {
    const response = await plaidClient.accountsGet({
        access_token: accessToken,
    });
    return response.data;
}

export async function getTransactions(accessToken: string, startDate: string, endDate: string) {
    const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
            count: 500,
            offset: 0,
        },
    });
    return response.data;
}

export async function getInstitution(institutionId: string) {
    const response = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
    });
    return response.data.institution;
}

// Map Plaid categories to simplified categories
export function mapCategory(categories: string[] | null): string {
    if (!categories || categories.length === 0) return 'Other';

    const category = categories[0].toLowerCase();

    if (category.includes('food') || category.includes('restaurant')) return 'Food and Drink';
    if (category.includes('shop') || category.includes('store') || category.includes('retail')) return 'Shopping';
    if (category.includes('travel') || category.includes('transpor') || category.includes('gas') || category.includes('uber') || category.includes('lyft')) return 'Transportation';
    if (category.includes('entertainment') || category.includes('recreation')) return 'Entertainment';
    if (category.includes('payment') || category.includes('utility') || category.includes('service') || category.includes('subscription')) return 'Bills and Utilities';
    if (category.includes('health') || category.includes('medical') || category.includes('pharmacy')) return 'Healthcare';
    if (category.includes('travel') || category.includes('airline') || category.includes('hotel')) return 'Travel';
    if (category.includes('transfer') || category.includes('bank')) return 'Transfer';
    if (category.includes('income') || category.includes('payroll') || category.includes('deposit')) return 'Income';

    return 'Other';
}
