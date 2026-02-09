'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { MessageSquare, Send, Loader2, Sparkles, User } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const suggestedQuestions = [
    "Why did I spend so much last month?",
    "What subscriptions am I paying for?",
    "How much did I spend on food this month?",
    "Where can I cut back to save money?",
    "What's my biggest expense category?",
];

export default function ChatPage() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || loading) return;

        const userMessage: Message = { role: 'user', content };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    history: messages.slice(-10), // Keep last 10 messages for context
                }),
            });

            const data = await res.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response || 'Sorry, I could not process your request.',
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-blue-400" />
                    AI Financial Assistant
                </h1>
                <p className="text-slate-400 mt-1">
                    Ask anything about your finances and spending patterns
                </p>
            </div>

            <Card className="flex-1 bg-slate-800/50 border-slate-700 flex flex-col overflow-hidden">
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">How can I help you today?</h3>
                            <p className="text-slate-400 text-center max-w-md mb-6">
                                I can analyze your spending, find savings opportunities, and answer questions about your finances.
                            </p>

                            {/* Suggested questions */}
                            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                                {suggestedQuestions.map((question, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                        onClick={() => sendMessage(question)}
                                    >
                                        {question}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.role === 'assistant' && (
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="bg-blue-500 text-white">
                                                <Sparkles className="w-4 h-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`max-w-[70%] rounded-2xl p-4 ${message.role === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-700 text-slate-100'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="bg-slate-600 text-white">
                                                {session?.user?.name?.[0] || <User className="w-4 h-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="bg-blue-500 text-white">
                                            <Sparkles className="w-4 h-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-slate-700 rounded-2xl p-4">
                                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t border-slate-700">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your spending..."
                            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
