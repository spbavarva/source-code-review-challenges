import { getCurrentUser, getUserAccounts } from '../actions';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/');
    }

    const accounts = await getUserAccounts();

    return <DashboardClient user={user} accounts={accounts} />;
}
