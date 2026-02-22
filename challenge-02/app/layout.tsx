import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Northport Ledger - Safe RSC Training Lab',
    description: 'Server Actions training app with defensive deserialization checks',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
