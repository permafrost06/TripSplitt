import type { Trip, Person, Expense, ExpenseItem } from '../types';
import brotliPromise from 'brotli-wasm';

const brotli = await brotliPromise;

export interface CompressedTripData {
    n: string;
    c: string;
    p: Array<{ n: string; c?: number }>;
    e: Array<{
        d: string;
        a: number;
        pb: string;
        pf: string[];
        i?: Array<{ d: string; a: number; pf: string[] }>;
    }>;
}

export interface CompressedSizeInfo {
    originalSize: number;
    compressedSize: number;
    ratio: number;
}

export function compressTrip(trip: Trip): CompressedTripData {
    return {
        n: trip.name,
        c: trip.currency,
        p: trip.people.map((person) => ({
            n: person.name,
            c: person.count,
        })),
        e: trip.expenses.map((expense) => ({
            d: expense.description,
            a: expense.amount,
            pb: expense.paidBy,
            pf: expense.paidFor,
            i: expense.items?.map((item) => ({
                d: item.description,
                a: item.amount,
                pf: item.paidFor,
            })),
        })),
    };
}

export function decompressTrip(
    data: CompressedTripData
): Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> {
    const people: Person[] = data.p.map((p) => ({
        name: p.n,
        count: p.c || 1,
    }));

    const expenses: Expense[] = data.e.map((expense) => ({
        id: crypto.randomUUID(),
        description: expense.d,
        amount: expense.a,
        paidBy: expense.pb,
        paidFor: expense.pf,
        items: expense.i?.map(
            (item): ExpenseItem => ({
                description: item.d,
                amount: item.a,
                paidFor: item.pf,
            })
        ),
    }));

    return {
        name: data.n,
        currency: data.c as 'USD' | 'BDT',
        people,
        expenses,
    };
}

export function createTripFromSharedData(data: CompressedTripData, id?: string): Trip {
    const decompressed = decompressTrip(data);
    const now = Date.now();

    return {
        id: id || crypto.randomUUID(),
        name: `${decompressed.name} (Shared)`,
        currency: decompressed.currency,
        people: decompressed.people,
        expenses: decompressed.expenses,
        createdAt: now,
        updatedAt: now,
    };
}

export async function compressTripData(trip: Trip): Promise<Uint8Array> {
    const json = JSON.stringify(compressTrip(trip));
    return brotli.compress(new TextEncoder().encode(json));
}

export async function decompressTripData(compressed: Uint8Array): Promise<CompressedTripData> {
    const decompressedJson = new TextDecoder().decode(brotli.decompress(compressed));
    return JSON.parse(decompressedJson) as CompressedTripData;
}

export async function compressAndMeasure(
    trip: Trip
): Promise<{ data: Uint8Array; info: CompressedSizeInfo }> {
    const json = JSON.stringify(compressTrip(trip));
    const encoder = new TextEncoder();
    const originalSize = encoder.encode(json).length;

    const compressed = brotli.compress(new TextEncoder().encode(json));

    return {
        data: compressed,
        info: {
            originalSize,
            compressedSize: compressed.length,
            ratio: originalSize > 0 ? (compressed.length / originalSize) * 100 : 0,
        },
    };
}

export async function decompressAndMeasure(
    compressed: Uint8Array
): Promise<{ data: CompressedTripData; info: CompressedSizeInfo }> {
    const decompressedJson = new TextDecoder().decode(brotli.decompress(compressed));
    const encoder = new TextEncoder();
    const compressedSize = compressed.length;
    const originalSize = encoder.encode(decompressedJson).length;

    return {
        data: JSON.parse(decompressedJson) as CompressedTripData,
        info: {
            originalSize,
            compressedSize,
            ratio: compressedSize > 0 ? (originalSize / compressedSize) * 100 : 0,
        },
    };
}

export function arrayBufferToBase64Url(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export function base64UrlToArrayBuffer(base64Url: string): Uint8Array {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    const paddedBase64 = padding ? base64 + '===='.slice(0, 4 - padding) : base64;
    const binary = atob(paddedBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
