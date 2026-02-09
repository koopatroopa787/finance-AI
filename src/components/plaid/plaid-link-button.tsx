'use client';

import { useState, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';

interface PlaidLinkButtonProps {
    onSuccess?: () => void;
}

export function PlaidLinkButton({ onSuccess }: PlaidLinkButtonProps) {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLinkToken = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/plaid/create-link-token', {
                method: 'POST',
            });
            const data = await res.json();

            if (data.link_token) {
                setLinkToken(data.link_token);
            } else {
                setError('Failed to initialize bank connection');
            }
        } catch {
            setError('Failed to connect. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOnSuccess = useCallback<PlaidLinkOnSuccess>(
        async (publicToken, metadata) => {
            setLoading(true);
            try {
                const res = await fetch('/api/plaid/exchange-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        public_token: publicToken,
                        institution: metadata.institution,
                    }),
                });

                if (res.ok) {
                    setConnected(true);

                    // Trigger AI analysis
                    await fetch('/api/ai/analyze', { method: 'POST' });

                    if (onSuccess) {
                        onSuccess();
                    }

                    // Force reload to update server components with new cookie
                    window.location.reload();
                } else {
                    setError('Failed to connect bank account');
                }
            } catch {
                setError('Failed to connect bank account');
            } finally {
                setLoading(false);
            }
        },
        [onSuccess]
    );

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: handleOnSuccess,
    });

    // If we have a link token
    if (linkToken) {
        // DEMO MODE BYPASS: If token is 'demo-link-token', skip Plaid Link SDK
        if (linkToken === 'demo-link-token') {
            return (
                <Button
                    onClick={() => handleOnSuccess('demo-public-token', { institution: { name: 'Demo Bank', institution_id: 'ins_demo' } } as any)}
                    disabled={loading}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting Demo Bank...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Simulate Connection (Demo)
                        </>
                    )}
                </Button>
            );
        }

        // Real Plaid Link
        if (ready && !connected) {
            open();
        }
    }

    if (connected) {
        return (
            <Button variant="outline" className="bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30" disabled>
                <CheckCircle className="w-4 h-4 mr-2" />
                Bank Connected
            </Button>
        );
    }

    return (
        <div>
            <Button
                onClick={fetchLinkToken}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Connect Bank Account
                    </>
                )}
            </Button>
            {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
        </div>
    );
}
