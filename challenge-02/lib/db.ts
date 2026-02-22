export interface User {
    id: string;
    username: string;
    password: string;
    fullName: string;
    email: string;
}

export interface Account {
    id: string;
    userId: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
    balance: number;
}

export interface Transaction {
    id: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description: string;
    timestamp: Date;
    status: 'completed' | 'pending' | 'failed';
}

const users: User[] = [
    {
        id: 'u1',
        username: 'ops_admin',
        password: 'vault2026',
        fullName: 'Rhea Marshall',
        email: 'rhea.marshall@northport.local'
    },
    {
        id: 'u2',
        username: 'nina',
        password: 'nina123',
        fullName: 'Nina Patel',
        email: 'nina.patel@northport.local'
    },
    {
        id: 'u3',
        username: 'omar',
        password: 'omar123',
        fullName: 'Omar Briggs',
        email: 'omar.briggs@northport.local'
    }
];

const accounts: Account[] = [
    {
        id: 'a1',
        userId: 'u1',
        accountNumber: '8800112200',
        accountType: 'checking',
        balance: 92000.0
    },
    {
        id: 'a2',
        userId: 'u1',
        accountNumber: '8800112201',
        accountType: 'savings',
        balance: 140000.35
    },
    {
        id: 'a3',
        userId: 'u2',
        accountNumber: '8800113300',
        accountType: 'checking',
        balance: 21200.8
    },
    {
        id: 'a4',
        userId: 'u3',
        accountNumber: '8800114400',
        accountType: 'checking',
        balance: 9780.4
    }
];

const transactions: Transaction[] = [
    {
        id: 't1',
        fromAccountId: 'a1',
        toAccountId: 'a3',
        amount: 350,
        description: 'Terminal maintenance payment',
        timestamp: new Date('2026-01-04T09:30:00Z'),
        status: 'completed'
    },
    {
        id: 't2',
        fromAccountId: 'a2',
        toAccountId: 'a4',
        amount: 1200,
        description: 'Fuel surcharge settlement',
        timestamp: new Date('2026-01-14T15:45:00Z'),
        status: 'completed'
    }
];

export const db = {
    users,
    accounts,
    transactions,

    findUserByUsername(username: string): User | undefined {
        return this.users.find((user) => user.username === username);
    },

    findUserById(id: string): User | undefined {
        return this.users.find((user) => user.id === id);
    },

    getAccountsByUserId(userId: string): Account[] {
        return this.accounts.filter((account) => account.userId === userId);
    },

    getAccountById(accountId: string): Account | undefined {
        return this.accounts.find((account) => account.id === accountId);
    },

    getAccountByNumber(accountNumber: string): Account | undefined {
        return this.accounts.find((account) => account.accountNumber === accountNumber);
    },

    getTransactionsByAccountId(accountId: string): Transaction[] {
        return this.transactions
            .filter(
                (transaction) =>
                    transaction.fromAccountId === accountId || transaction.toAccountId === accountId
            )
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },

    addTransaction(transaction: Transaction): void {
        this.transactions.push(transaction);
    },

    updateAccountBalance(accountId: string, newBalance: number): boolean {
        const account = this.accounts.find((item) => item.id === accountId);
        if (!account) {
            return false;
        }

        account.balance = newBalance;
        return true;
    }
};
