import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123456', 12);
    const user = await prisma.user.upsert({
        where: { email: 'demo@financeai.com' },
        update: {},
        create: {
            email: 'demo@financeai.com',
            passwordHash,
            name: 'Demo User',
        },
    });
    console.log('✅ Created demo user:', user.email);

    // Create demo Plaid account
    const account = await prisma.plaidAccount.upsert({
        where: { itemId: 'demo-item-001' },
        update: {},
        create: {
            userId: user.id,
            accessToken: 'demo-access-token',
            itemId: 'demo-item-001',
            accountId: 'demo-account-001',
            institution: 'Chase Bank',
            accountName: 'Total Checking',
            accountType: 'depository',
            currentBalance: 5847.23,
            availableBalance: 5347.23,
        },
    });
    console.log('✅ Created demo account:', account.accountName);

    // Generate 90 days of demo transactions
    const transactions = generateDemoTransactions(account.id);

    for (const t of transactions) {
        await prisma.transaction.upsert({
            where: { plaidTransactionId: t.plaidTransactionId },
            update: {},
            create: t,
        });
    }
    console.log(`✅ Created ${transactions.length} demo transactions`);

    // Create AI insights
    const insights = [
        {
            userId: user.id,
            insightType: 'subscription',
            title: 'Unused Netflix Subscription',
            description: 'You have been charged $15.99/month for Netflix, but we detected no activity from this service in the past 60 days. Consider canceling or pausing your subscription.',
            potentialSavings: 15.99,
            relatedMerchant: 'Netflix',
        },
        {
            userId: user.id,
            insightType: 'subscription',
            title: 'Gym Membership You Never Use',
            description: 'Planet Fitness charges you $29.99/month. Based on your location data and transactions, you haven\'t visited in 3 months. Consider freezing or canceling your membership.',
            potentialSavings: 29.99,
            relatedMerchant: 'Planet Fitness',
        },
        {
            userId: user.id,
            insightType: 'subscription',
            title: 'Duplicate News App Subscription',
            description: 'You\'re paying for both NY Times Digital ($9.99) and Washington Post ($4.99). Consider keeping just one if you prefer one over the other.',
            potentialSavings: 9.99,
            relatedMerchant: 'NY Times Digital',
        },
        {
            userId: user.id,
            insightType: 'spending_pattern',
            title: 'High Coffee Shop Spending',
            description: 'You\'ve spent $156.50 at Starbucks this month (24 transactions). Making coffee at home could save you approximately $120/month.',
            potentialSavings: 120.00,
            relatedMerchant: 'Starbucks',
        },
        {
            userId: user.id,
            insightType: 'spending_pattern',
            title: 'Excessive Food Delivery',
            description: 'Food delivery apps (DoorDash, Uber Eats) account for $234.67 this month. The average markup on delivered food is 30%. Cooking or pickup could save you ~$70/month.',
            potentialSavings: 70.00,
            relatedMerchant: 'DoorDash',
        },
        {
            userId: user.id,
            insightType: 'bill_review',
            title: 'Phone Plan May Be Too Expensive',
            description: 'Your Verizon bill of $95/month is higher than average. Consider switching to a prepaid carrier like Mint Mobile ($15-30/month) for similar coverage.',
            potentialSavings: 60.00,
            relatedMerchant: 'Verizon',
        },
    ];

    for (const insight of insights) {
        await prisma.aIInsight.create({ data: insight });
    }
    console.log(`✅ Created ${insights.length} AI insights`);

    // Create alerts
    const alerts = [
        {
            userId: user.id,
            alertType: 'unusual_spending',
            title: 'Unusual Transaction Detected',
            message: 'A transaction of $299.00 at "Electronics Store" is significantly higher than your average spending.',
            severity: 'medium',
        },
        {
            userId: user.id,
            alertType: 'high_spending',
            title: 'High Food & Dining Spending',
            message: 'You\'ve spent $487.32 on Food & Dining this month, which is 40% higher than your 3-month average.',
            severity: 'low',
        },
    ];

    for (const alert of alerts) {
        await prisma.alert.create({ data: alert });
    }
    console.log(`✅ Created ${alerts.length} alerts`);

    // Calculate total potential savings
    const totalSavings = insights.reduce((sum, i) => sum + i.potentialSavings, 0);
    console.log(`\n💰 Total potential savings identified: $${totalSavings.toFixed(2)}/month`);
    console.log(`   That's $${(totalSavings * 12).toFixed(2)}/year!`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📧 Demo login credentials:');
    console.log('   Email: demo@financeai.com');
    console.log('   Password: demo123456');
}

function generateDemoTransactions(accountId: string) {
    const transactions = [];
    const now = new Date();

    // Subscription transactions (recurring monthly)
    const subscriptions = [
        { merchant: 'Netflix', amount: 15.99, category: 'Entertainment' },
        { merchant: 'Spotify', amount: 9.99, category: 'Entertainment' },
        { merchant: 'Planet Fitness', amount: 29.99, category: 'Healthcare' },
        { merchant: 'NY Times Digital', amount: 9.99, category: 'Shopping' },
        { merchant: 'Verizon Wireless', amount: 95.00, category: 'Bills and Utilities' },
        { merchant: 'Comcast', amount: 79.99, category: 'Bills and Utilities' },
        { merchant: 'Adobe Creative Cloud', amount: 54.99, category: 'Shopping' },
    ];

    // Coffee transactions (frequent)
    for (let i = 0; i < 24; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const amount = 4.50 + Math.random() * 4;
        transactions.push(createTransaction(
            accountId,
            'Starbucks',
            amount,
            'Food and Drink',
            daysAgo
        ));
    }

    // Food delivery transactions
    const deliveryApps = ['DoorDash', 'Uber Eats', 'Grubhub'];
    for (let i = 0; i < 12; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const app = deliveryApps[Math.floor(Math.random() * deliveryApps.length)];
        const amount = 18 + Math.random() * 25;
        transactions.push(createTransaction(
            accountId,
            app,
            amount,
            'Food and Drink',
            daysAgo
        ));
    }

    // Restaurant transactions
    const restaurants = ['Chipotle', 'Panera Bread', 'Olive Garden', 'Local Bar & Grill'];
    for (let i = 0; i < 8; i++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
        const amount = 15 + Math.random() * 40;
        transactions.push(createTransaction(
            accountId,
            restaurant,
            amount,
            'Food and Drink',
            daysAgo
        ));
    }

    // Grocery transactions
    const groceryStores = ['Whole Foods', 'Trader Joe\'s', 'Costco', 'Walmart'];
    for (let i = 0; i < 8; i++) {
        const daysAgo = Math.floor(Math.random() * 45) + i * 5;
        const store = groceryStores[Math.floor(Math.random() * groceryStores.length)];
        const amount = 45 + Math.random() * 100;
        transactions.push(createTransaction(
            accountId,
            store,
            amount,
            'Shopping',
            daysAgo
        ));
    }

    // Gas/Transportation
    for (let i = 0; i < 6; i++) {
        const daysAgo = Math.floor(Math.random() * 45) + i * 7;
        const amount = 35 + Math.random() * 30;
        transactions.push(createTransaction(
            accountId,
            'Shell Gas Station',
            amount,
            'Transportation',
            daysAgo
        ));
    }

    // Uber/Lyft rides
    for (let i = 0; i < 5; i++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const amount = 12 + Math.random() * 25;
        transactions.push(createTransaction(
            accountId,
            Math.random() > 0.5 ? 'Uber' : 'Lyft',
            amount,
            'Transportation',
            daysAgo
        ));
    }

    // Amazon purchases
    for (let i = 0; i < 6; i++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const amount = 20 + Math.random() * 80;
        transactions.push(createTransaction(
            accountId,
            'Amazon',
            amount,
            'Shopping',
            daysAgo
        ));
    }

    // One unusual large transaction
    transactions.push(createTransaction(
        accountId,
        'Electronics Store',
        299.00,
        'Shopping',
        3
    ));

    // Subscription charges
    for (const sub of subscriptions) {
        // This month
        transactions.push(createTransaction(
            accountId,
            sub.merchant,
            sub.amount,
            sub.category,
            Math.floor(Math.random() * 10) + 1
        ));
        // Last month
        transactions.push(createTransaction(
            accountId,
            sub.merchant,
            sub.amount,
            sub.category,
            Math.floor(Math.random() * 10) + 31
        ));
        // Two months ago
        transactions.push(createTransaction(
            accountId,
            sub.merchant,
            sub.amount,
            sub.category,
            Math.floor(Math.random() * 10) + 61
        ));
    }

    // Payroll deposits (income)
    transactions.push(createTransaction(accountId, 'ACME Corp Payroll', -3250.00, 'Income', 1));
    transactions.push(createTransaction(accountId, 'ACME Corp Payroll', -3250.00, 'Income', 15));
    transactions.push(createTransaction(accountId, 'ACME Corp Payroll', -3250.00, 'Income', 31));
    transactions.push(createTransaction(accountId, 'ACME Corp Payroll', -3250.00, 'Income', 45));
    transactions.push(createTransaction(accountId, 'ACME Corp Payroll', -3250.00, 'Income', 61));
    transactions.push(createTransaction(accountId, 'ACME Corp Payroll', -3250.00, 'Income', 75));

    return transactions;
}

function createTransaction(
    accountId: string,
    merchantName: string,
    amount: number,
    category: string,
    daysAgo: number
) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
        accountId,
        plaidTransactionId: `demo-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        date,
        amount: Math.round(amount * 100) / 100,
        category: [category],
        primaryCategory: category,
        merchantName,
        description: `${merchantName} purchase`,
        pending: false,
    };
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
