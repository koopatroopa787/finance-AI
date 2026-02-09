import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    TrendingDown,
    Brain,
    CreditCard,
    Bell,
    CheckCircle,
    MessageSquare,
    ArrowRight,
    DollarSign,
    PieChart,
    Shield
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">FinanceAI</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost" className="text-white hover:text-blue-300">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 rounded-full px-4 py-2 mb-6">
                        <span className="text-blue-300 text-sm font-medium">AI-Powered Financial Insights</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Stop Wasting Money on<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            Forgotten Subscriptions
                        </span>
                    </h1>

                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        Connect your bank account and let AI analyze your spending. Find unused subscriptions,
                        identify wasteful patterns, and discover how to save <span className="text-green-400 font-semibold">$200+ per month</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="xl" className="bg-blue-500 hover:bg-blue-600 text-white gap-2 text-lg px-8 py-6">
                                <CreditCard className="w-5 h-5" />
                                Connect Your Bank Free
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>

                    <p className="text-slate-400 text-sm mt-4 flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        Bank-level security • Read-only access • Never stores credentials
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 border-y border-white/10 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-400 mb-2">$200+</div>
                            <div className="text-slate-300">Average Monthly Savings Found</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-400 mb-2">93%</div>
                            <div className="text-slate-300">Users Find Unused Subscriptions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-cyan-400 mb-2">2 min</div>
                            <div className="text-slate-300">To Get Your First Insights</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            How AI Finds Your Hidden Expenses
                        </h2>
                        <p className="text-slate-300 max-w-2xl mx-auto">
                            Our AI analyzes your transaction history to surface insights you'd never find manually
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                                    <TrendingDown className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Find Unused Subscriptions</h3>
                                <p className="text-slate-400">
                                    Detect recurring charges you forgot about. Netflix you never watch?
                                    Gym membership you haven't used? We'll spot them.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                                    <Brain className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Spending Pattern Analysis</h3>
                                <p className="text-slate-400">
                                    Understand where your money goes. See if your coffee habit is costing
                                    you $150/month or if food delivery is your hidden budget killer.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                                    <PieChart className="w-6 h-6 text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Personalized Savings Tips</h3>
                                <p className="text-slate-400">
                                    Get specific, actionable advice. Not generic tips—actual opportunities
                                    based on YOUR spending with estimated monthly savings.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* AI Chat Section */}
            <section className="py-20 px-4 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Ask AI Anything About Your Money
                            </h2>
                            <p className="text-slate-300 mb-8">
                                Have a conversation with your finances. Ask questions like "Why did I spend so much last month?"
                                or "What are my biggest expenses?" and get instant, personalized answers.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300">"What subscriptions am I paying for?"</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300">"How much did I spend on dining out this month?"</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300">"Where can I cut back to save $500?"</span>
                                </div>
                            </div>
                        </div>

                        <Card className="bg-slate-800/80 border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageSquare className="w-5 h-5 text-blue-400" />
                                    <span className="text-white font-medium">AI Chat</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-700 rounded-lg p-3">
                                        <p className="text-slate-300 text-sm">Why is my spending so high this month?</p>
                                    </div>
                                    <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-500/30">
                                        <p className="text-slate-200 text-sm">
                                            Based on your transactions, you spent <span className="text-green-400 font-medium">$847</span> more
                                            than last month. The main contributors are:
                                        </p>
                                        <ul className="text-slate-300 text-sm mt-2 space-y-1">
                                            <li>• 12 Uber Eats orders ($234)</li>
                                            <li>• New gym equipment ($189)</li>
                                            <li>• Starbucks visits up 40% ($95)</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Alerts Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/20 rounded-full px-4 py-2 mb-6">
                        <Bell className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 text-sm font-medium">Proactive Alerts</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Never Get Blindsided by Unexpected Charges
                    </h2>
                    <p className="text-slate-300 max-w-2xl mx-auto mb-12">
                        Get notified about unusual spending, upcoming bills, and potential issues before they become problems.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-left">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                                <span className="text-red-400 font-bold">!</span>
                            </div>
                            <div className="text-white font-medium text-sm">Low Balance Alert</div>
                            <div className="text-slate-400 text-xs">Balance below $500</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-left">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3">
                                <span className="text-yellow-400 font-bold">$</span>
                            </div>
                            <div className="text-white font-medium text-sm">Unusual Transaction</div>
                            <div className="text-slate-400 text-xs">$299 at Unknown Merchant</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-left">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                                <span className="text-blue-400 font-bold">↑</span>
                            </div>
                            <div className="text-white font-medium text-sm">Spending Spike</div>
                            <div className="text-slate-400 text-xs">Food +45% vs last month</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-left">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                                <span className="text-green-400 font-bold">✓</span>
                            </div>
                            <div className="text-white font-medium text-sm">Bill Paid</div>
                            <div className="text-slate-400 text-xs">Netflix charged $15.99</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0">
                        <CardContent className="p-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Start Saving in 2 Minutes
                            </h2>
                            <p className="text-blue-100 mb-8 text-lg">
                                Connect your bank account securely and let AI find money you're wasting every month.
                            </p>
                            <Link href="/register">
                                <Button size="xl" className="bg-white text-blue-600 hover:bg-blue-50 gap-2 text-lg px-8 py-6">
                                    <CreditCard className="w-5 h-5" />
                                    Connect Your Bank Free
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <p className="text-blue-200 text-sm mt-4">No credit card required • Cancel anytime</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">FinanceAI</span>
                        </div>
                        <div className="text-slate-400 text-sm">
                            © 2024 FinanceAI. All rights reserved.
                            <span className="mx-2">•</span>
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <span className="mx-2">•</span>
                            <a href="#" className="hover:text-white">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
