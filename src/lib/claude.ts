import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: 'https://api.anthropic.com', // SDK appends /v1
});

export interface Transaction {
    date: string;
    amount: number;
    category: string;
    merchantName: string | null;
    description: string;
}

export interface AIInsight {
    type: 'subscription' | 'spending_pattern' | 'savings_opportunity' | 'bill_review';
    title: string;
    description: string;
    potentialSavings: number;
    relatedMerchant?: string;
}

export async function analyzeTransactions(transactions: Transaction[]): Promise<AIInsight[]> {
    if (transactions.length === 0) {
        return [];
    }

    // Group transactions by merchant for subscription detection
    const merchantGroups = transactions.reduce((acc, t) => {
        const name = t.merchantName || 'Unknown';
        if (!acc[name]) acc[name] = [];
        acc[name].push(t);
        return acc;
    }, {} as Record<string, Transaction[]>);

    // Group by category for spending analysis
    const categoryTotals = transactions.reduce((acc, t) => {
        if (t.amount > 0) { // Only expenses
            acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    const transactionSummary = {
        totalTransactions: transactions.length,
        totalSpending: totalSpending.toFixed(2),
        categoryBreakdown: categoryTotals,
        recurringMerchants: Object.entries(merchantGroups)
            .filter(([_, txns]) => txns.length >= 2)
            .map(([name, txns]) => ({
                name,
                count: txns.length,
                avgAmount: (txns.reduce((a, t) => a + t.amount, 0) / txns.length).toFixed(2),
                totalAmount: txns.reduce((a, t) => a + t.amount, 0).toFixed(2),
            })),
        recentTransactions: transactions.slice(0, 50).map(t => ({
            date: t.date,
            amount: t.amount,
            merchant: t.merchantName,
            category: t.category,
        })),
    };

    const prompt = `You are a personal finance analyst AI. Analyze the following financial transaction data and identify actionable insights to help the user save money.

TRANSACTION SUMMARY:
${JSON.stringify(transactionSummary, null, 2)}

Identify and return insights in the following categories:
1. **Subscriptions**: Recurring charges that might be unused, forgotten, or duplicative
2. **Spending Patterns**: Unusual spending habits or trends (e.g., too many coffee purchases, high food delivery spending)
3. **Savings Opportunities**: Specific ways to reduce spending (e.g., switch services, negotiate bills)
4. **Bill Reviews**: Bills that seem higher than typical market rates

For each insight, provide:
- A specific, actionable title
- A detailed but concise description explaining WHY this is worth addressing
- An estimated monthly savings amount (be realistic, not inflated)
- The merchant name if applicable

Return ONLY a valid JSON array with 3-5 most impactful insights. Focus on the highest potential savings first.

Format:
[
  {
    "type": "subscription" | "spending_pattern" | "savings_opportunity" | "bill_review",
    "title": "string",
    "description": "string",
    "potentialSavings": number,
    "relatedMerchant": "string or null"
  }
]`;

    try {
        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            messages: [
                { role: 'user', content: prompt }
            ],
        });

        const content = message.content[0];
        if (content.type !== 'text') {
            return [];
        }

        // Extract JSON from response
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error('No JSON found in response:', content.text);
            return [];
        }

        const insights: AIInsight[] = JSON.parse(jsonMatch[0]);
        return insights;
    } catch (error) {
        console.error('Error analyzing transactions:', error);
        return [];
    }
}

export async function chatWithContext(
    question: string,
    transactions: Transaction[],
    previousMessages: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
    // Create a summary of the user's financial situation
    const categoryTotals = transactions.reduce((acc, t) => {
        if (t.amount > 0) {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const topMerchants = Object.entries(
        transactions.reduce((acc, t) => {
            const name = t.merchantName || 'Unknown';
            if (t.amount > 0) {
                acc[name] = (acc[name] || 0) + t.amount;
            }
            return acc;
        }, {} as Record<string, number>)
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const systemPrompt = `You are a helpful personal finance assistant. You have access to the user's transaction history and can answer questions about their spending patterns, help them understand where their money goes, and provide actionable advice.

USER'S FINANCIAL SUMMARY (Last 90 days):
- Total Spending: $${totalSpending.toFixed(2)}
- Spending by Category: ${JSON.stringify(categoryTotals)}
- Top Merchants by Spending: ${JSON.stringify(Object.fromEntries(topMerchants))}
- Number of Transactions: ${transactions.length}

Guidelines:
- Be specific and reference actual numbers from their data
- Provide actionable, practical advice
- Be encouraging but honest about spending habits
- If asked about something not in the data, acknowledge the limitation
- Keep responses concise but helpful (2-3 paragraphs max)
- Use dollar amounts when discussing spending`;

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 800,
            system: systemPrompt,
            messages: [
                ...previousMessages.map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })),
                { role: 'user', content: question },
            ],
        });

        const content = message.content[0];
        if (content.type !== 'text') {
            return 'I apologize, but I was unable to generate a response. Please try again.';
        }

        return content.text;
    } catch (error) {
        console.error('Error in chat:', error);
        return 'I apologize, but I encountered an error processing your question. Please try again.';
    }
}

export async function detectAlerts(transactions: Transaction[]): Promise<{
    type: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}[]> {
    if (transactions.length === 0) {
        return [];
    }

    // Simple alert detection logic (can be enhanced with AI)
    const alerts: {
        type: string;
        title: string;
        message: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }[] = [];

    // Check for unusual spending (transactions much higher than average)
    const amounts = transactions.filter(t => t.amount > 0).map(t => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const unusualTransactions = transactions.filter(t => t.amount > avgAmount * 3 && t.amount > 100);

    if (unusualTransactions.length > 0) {
        const largest = unusualTransactions.sort((a, b) => b.amount - a.amount)[0];
        alerts.push({
            type: 'unusual_spending',
            title: 'Unusual Transaction Detected',
            message: `A transaction of $${largest.amount.toFixed(2)} at ${largest.merchantName || 'Unknown'} is significantly higher than your average spending.`,
            severity: 'medium',
        });
    }

    // Check for high monthly spending in any category
    const categoryTotals = transactions.reduce((acc, t) => {
        if (t.amount > 0) {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    const highSpendingCategories = Object.entries(categoryTotals)
        .filter(([_, amount]) => amount > 500)
        .sort((a, b) => b[1] - a[1]);

    if (highSpendingCategories.length > 0) {
        const [category, amount] = highSpendingCategories[0];
        alerts.push({
            type: 'high_spending',
            title: `High ${category} Spending`,
            message: `You've spent $${amount.toFixed(2)} on ${category} this period. Consider reviewing these expenses.`,
            severity: 'low',
        });
    }

    return alerts;
}
