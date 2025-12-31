import { Link, Outlet } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { UpdatePrompt } from './UpdatePrompt';

export function Layout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <Link to="/" className="flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-blue-500" />
                        <span className="text-xl font-bold text-gray-900">TripSplitt</span>
                    </Link>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-6">
                <Outlet />
            </main>
            <UpdatePrompt />
        </div>
    );
}
