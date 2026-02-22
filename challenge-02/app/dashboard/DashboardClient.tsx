'use client'

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction, transferFunds, getAccountTransactions } from '../actions';
import { Account, Transaction, User } from '@/lib/db';

interface DashboardClientProps {
    user: User;
    accounts: Account[];
}

export default function DashboardClient({ user, accounts: initialAccounts }: DashboardClientProps) {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(initialAccounts[0] || null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showTransfer, setShowTransfer] = useState(false);
    const [transferData, setTransferData] = useState({
        toAccountNumber: '',
        amount: '',
        description: ''
    });
    const [transferError, setTransferError] = useState('');
    const [transferSuccess, setTransferSuccess] = useState('');

    const router = useRouter();

    useEffect(() => {
        setAccounts(initialAccounts);
    }, [initialAccounts]);

    useEffect(() => {
        if (!selectedAccount) {
            setTransactions([]);
            return;
        }

        const loadTransactions = async () => {
            const items = await getAccountTransactions(selectedAccount.id);
            setTransactions(items);
        };

        loadTransactions();
    }, [selectedAccount]);

    const totalBalance = useMemo(
        () => accounts.reduce((sum, account) => sum + account.balance, 0),
        [accounts]
    );

    const handleLogout = async () => {
        await logoutAction();
        router.push('/');
    };

    const closeTransferModal = () => {
        setShowTransfer(false);
        setTransferError('');
        setTransferSuccess('');
    };

    const handleTransferSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedAccount) {
            setTransferError('Choose a source account first');
            return;
        }

        setTransferError('');
        setTransferSuccess('');

        const amount = Number.parseFloat(transferData.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            setTransferError('Amount must be greater than zero');
            return;
        }

        const result = await transferFunds(
            selectedAccount.id,
            transferData.toAccountNumber,
            amount,
            transferData.description
        );

        if (!result.success) {
            setTransferError(result.message || 'Transfer failed');
            return;
        }

        setTransferData({ toAccountNumber: '', amount: '', description: '' });
        setTransferSuccess('Transfer completed. Dashboard data is refreshing.');
        setTimeout(() => {
            closeTransferModal();
        }, 900);

        router.refresh();
    };

    return (
        <main className="min-h-screen p-6 md:p-10">
            <section className="mx-auto w-full max-w-6xl space-y-8">
                <header className="ledger-shell rounded-3xl p-6 shadow-[0_24px_50px_-26px_rgba(15,118,110,0.7)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.23em] text-teal-700">Operations Console</p>
                            <h1 className="text-2xl font-bold text-slate-900 mt-1">Northport Ledger</h1>
                            <p className="text-sm text-slate-600 mt-1">Welcome back, {user.fullName}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-2xl border border-teal-200 bg-teal-50/70 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-teal-700">Total balance</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </article>
                    <article className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Accounts</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{accounts.length}</p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white/90 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Training endpoint</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">/api/training/rsc-probe</p>
                        <p className="mt-1 text-xs text-slate-600">Accepts multipart probes and blocks risky payloads.</p>
                    </article>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <article className="ledger-shell rounded-3xl p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-slate-900">Account Book</h2>
                            <button
                                onClick={() => setShowTransfer(true)}
                                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                            >
                                New Transfer
                            </button>
                        </div>

                        <div className="space-y-3">
                            {accounts.map((account) => {
                                const isSelected = account.id === selectedAccount?.id;
                                return (
                                    <button
                                        key={account.id}
                                        type="button"
                                        onClick={() => setSelectedAccount(account)}
                                        className={`w-full rounded-2xl border p-4 text-left transition ${
                                            isSelected
                                                ? 'border-teal-600 bg-teal-50'
                                                : 'border-slate-200 bg-white hover:border-teal-300'
                                        }`}
                                    >
                                        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{account.accountType}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <p className="font-semibold text-slate-900">{account.accountNumber}</p>
                                            <p className="text-lg font-bold text-slate-900">
                                                ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </article>

                    <article className="ledger-shell rounded-3xl p-6">
                        <h2 className="text-xl font-bold text-slate-900">Transaction Stream</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            {selectedAccount ? `Viewing ${selectedAccount.accountNumber}` : 'Select an account'}
                        </p>

                        <div className="mt-5 space-y-3">
                            {transactions.length === 0 && (
                                <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                                    No transactions for this account yet.
                                </p>
                            )}

                            {transactions.map((transaction) => {
                                const outgoing = transaction.fromAccountId === selectedAccount?.id;
                                return (
                                    <div key={transaction.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-slate-900">{transaction.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(transaction.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            <p className={`text-lg font-bold ${outgoing ? 'text-rose-600' : 'text-teal-700'}`}>
                                                {outgoing ? '-' : '+'}${transaction.amount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </article>
                </section>
            </section>

            {showTransfer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
                    <section className="w-full max-w-md rounded-3xl border border-teal-200 bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">Create Transfer</h3>
                            <button
                                type="button"
                                onClick={closeTransferModal}
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleTransferSubmit} className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">From account</span>
                                <input
                                    type="text"
                                    value={selectedAccount?.accountNumber || ''}
                                    disabled
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">To account</span>
                                <input
                                    type="text"
                                    value={transferData.toAccountNumber}
                                    onChange={(event) =>
                                        setTransferData({ ...transferData, toAccountNumber: event.target.value })
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                    placeholder="8800113300"
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">Amount</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={transferData.amount}
                                    onChange={(event) =>
                                        setTransferData({ ...transferData, amount: event.target.value })
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                    placeholder="0.00"
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
                                <input
                                    type="text"
                                    value={transferData.description}
                                    onChange={(event) =>
                                        setTransferData({ ...transferData, description: event.target.value })
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                    placeholder="Terminal invoice"
                                    required
                                />
                            </label>

                            {transferError && (
                                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                                    {transferError}
                                </p>
                            )}

                            {transferSuccess && (
                                <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-700">
                                    {transferSuccess}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
                            >
                                Submit Transfer
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}
