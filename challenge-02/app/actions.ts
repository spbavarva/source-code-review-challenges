'use server'

import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { inspectSerializedPayload } from '@/lib/security';

function roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
}

function sanitizeDescription(value: string): string {
    return value.trim().slice(0, 120);
}

export async function loginAction(username: string, password: string) {
    const user = db.findUserByUsername(username.trim());

    if (!user || user.password !== password) {
        return { success: false, message: 'Invalid credentials' };
    }

    (await cookies()).set('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, userId: user.id };
}

export async function logoutAction() {
    (await cookies()).delete('userId');
    return { success: true };
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return null;
    }

    return db.findUserById(userId) ?? null;
}

export async function getUserAccounts() {
    const user = await getCurrentUser();

    if (!user) {
        return [];
    }

    return db.getAccountsByUserId(user.id);
}

export async function getAccountTransactions(accountId: string) {
    const user = await getCurrentUser();

    if (!user) {
        return [];
    }

    const account = db.getAccountById(accountId);
    if (!account || account.userId !== user.id) {
        return [];
    }

    return db.getTransactionsByAccountId(accountId);
}

export async function transferFunds(
    fromAccountId: string,
    toAccountNumber: string,
    amount: number,
    description: string
) {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: 'Not authenticated' };
    }

    const fromAccount = db.getAccountById(fromAccountId);
    if (!fromAccount || fromAccount.userId !== user.id) {
        return { success: false, message: 'Invalid source account' };
    }

    const normalizedToAccount = toAccountNumber.trim();
    if (!/^\d{10}$/.test(normalizedToAccount)) {
        return { success: false, message: 'Destination account must be a 10-digit number' };
    }

    const transferAmount = Number(amount);
    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
        return { success: false, message: 'Amount must be greater than zero' };
    }

    const roundedAmount = roundCurrency(transferAmount);
    if (roundedAmount > fromAccount.balance) {
        return { success: false, message: 'Insufficient funds' };
    }

    const toAccount = db.getAccountByNumber(normalizedToAccount);
    if (!toAccount) {
        return { success: false, message: 'Destination account not found' };
    }

    const normalizedDescription = sanitizeDescription(description);
    if (!normalizedDescription) {
        return { success: false, message: 'Description is required' };
    }

    db.updateAccountBalance(fromAccount.id, roundCurrency(fromAccount.balance - roundedAmount));
    db.updateAccountBalance(toAccount.id, roundCurrency(toAccount.balance + roundedAmount));

    const transaction = {
        id: uuidv4(),
        fromAccountId,
        toAccountId: toAccount.id,
        amount: roundedAmount,
        description: normalizedDescription,
        timestamp: new Date(),
        status: 'completed' as const
    };

    db.addTransaction(transaction);

    return { success: true, transaction };
}

export async function processUserData(data: unknown) {
    const inspection = inspectSerializedPayload(data);

    if (inspection.blocked) {
        return {
            processed: false,
            blocked: true,
            message: 'Payload blocked by training guardrails',
            reasons: inspection.reasons
        };
    }

    return {
        processed: true,
        blocked: false,
        message: 'Payload accepted in safe training mode'
    };
}

export async function updateUserPreferences(preferences: unknown) {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: 'Not authenticated' };
    }

    const inspection = inspectSerializedPayload(preferences);
    if (inspection.blocked) {
        return {
            success: false,
            message: 'Preferences blocked by guardrails',
            reasons: inspection.reasons
        };
    }

    return { success: true, preferences };
}
