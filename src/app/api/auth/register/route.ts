import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json();

        if (process.env.DEMO_MODE === 'true') {
            return NextResponse.json(
                { error: 'Registration is disabled in Offline Demo Mode. Please log in with: demo@financeai.com / demo123456' },
                { status: 400 }
            );
        }

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                name: name || email.split('@')[0],
            },
        });

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
