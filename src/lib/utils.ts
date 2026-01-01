import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Currency } from '../types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: Currency): string {
    const symbol = currency === 'BDT' ? '৳' : '$';
    return `${symbol}${amount.toFixed(2)}`;
}
