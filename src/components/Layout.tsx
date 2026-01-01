import { Link, Outlet } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { UpdatePrompt } from './UpdatePrompt';
import { ThemeToggle } from './ThemeToggle';

export function Layout() {
    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="p-2">
                            <Wallet className="w-5 h-5 text-stone-900 dark:text-stone-100" />
                        </div>
                        <span className="text-xl font-serif text-stone-900 dark:text-stone-100">
                            TripSplitt
                        </span>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <Outlet />
            </main>

            <UpdatePrompt />
        </div>
    );
}
