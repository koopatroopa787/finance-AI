
export const DEMO_ACCOUNTS = [
    {
        id: 'acc_1',
        institution: 'Chase',
        accountName: 'Total Checking',
        currentBalance: 5847.23,
        availableBalance: 5347.23,
        accountType: 'depository',
        mask: '1234'
    },
    {
        id: 'acc_2',
        institution: 'Chase',
        accountName: 'Sapphire Preferred',
        currentBalance: 2450.00,
        availableBalance: 9000.00,
        accountType: 'credit',
        mask: '5678'
    },
];

export const DEMO_TRANSACTIONS = [
    {
        id: 'tx_1',
        date: new Date().toISOString().split('T')[0],
        amount: 15.99,
        category: 'Entertainment',
        merchantName: 'Netflix',
        description: 'NETFLIX.COM',
        accountName: 'Total Checking'
    },
    {
        id: 'tx_2',
        date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
        amount: 4.50,
        category: 'Food and Drink',
        merchantName: 'Starbucks',
        description: 'STARBUCKS STORE 12345',
        accountName: 'Total Checking'
    },
    {
        id: 'tx_3',
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        amount: 95.00,
        category: 'Service',
        merchantName: 'Verizon',
        description: 'VERIZON WIRELESS',
        accountName: 'Sapphire Preferred'
    },
    {
        id: 'tx_4',
        date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        amount: 29.99,
        category: 'Health and Fitness',
        merchantName: 'Planet Fitness',
        description: 'PLANET FITNESS 582',
        accountName: 'Sapphire Preferred'
    },
    {
        id: 'tx_5',
        date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
        amount: 65.43,
        category: 'Shops',
        merchantName: 'Whole Foods',
        description: 'WHOLE FOODS MARKET',
        accountName: 'Total Checking'
    },
    {
        id: 'tx_6',
        date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
        amount: 15.99,
        category: 'Entertainment',
        merchantName: 'Netflix',
        description: 'NETFLIX.COM',
        accountName: 'Total Checking'
    },
    {
        id: 'tx_7',
        date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        amount: 15.99,
        category: 'Entertainment',
        merchantName: 'Netflix',
        description: 'NETFLIX.COM',
        accountName: 'Total Checking'
    },
    {
        id: 'tx_8',
        date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
        amount: 4.50,
        category: 'Food and Drink',
        merchantName: 'Starbucks',
        description: 'STARBUCKS STORE 12345',
        accountName: 'Total Checking'
    },
    {
        id: 'tx_9',
        date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        amount: 320.00,
        category: 'Travel',
        merchantName: 'United Airlines',
        description: 'UNITED AIRLINES',
        accountName: 'Sapphire Preferred'
    },
    {
        id: 'tx_10',
        date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
        amount: 12.50,
        category: 'Food and Drink',
        merchantName: 'McDonalds',
        description: 'MCDONALDS 789',
        accountName: 'Total Checking'
    },
];

export const DEMO_INSIGHTS = [
    { id: 'ins_1', insightType: 'subscription', title: 'Unused Netflix Subscription', description: 'You have been charged $15.99/month for Netflix, but we detected no activity from this service in the past 60 days.', potentialSavings: 15.99, isActioned: false },
    { id: 'ins_2', insightType: 'spending_pattern', title: 'High Coffee Shop Spending', description: 'You\'ve spent $156.50 at Starbucks this month. Making coffee at home could save you ~$120/month.', potentialSavings: 120.00, isActioned: false },
];

export const DEMO_ALERTS = [
    { id: 'alt_1', alertType: 'unusual_spending', title: 'Unusual Transaction Detected', message: 'A transaction of $299.00 at "Electronics Store" is significantly higher than average.', severity: 'medium', isRead: false, createdAt: new Date().toISOString() },
];
