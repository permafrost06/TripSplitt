import { describe, it, expect } from 'vitest';
import { calculateSettlement } from './settlement';
import type { Person, Expense } from '../types';

describe('calculateSettlement', () => {
    it('should return empty settlement for empty inputs', () => {
        const result = calculateSettlement([], []);
        expect(result).toEqual({
            totalCost: 0,
            individualCosts: [],
            transactions: [],
        });
    });

    it('should handle simple equal split', () => {
        const people: Person[] = [
            { name: 'Alice', count: 1 },
            { name: 'Bob', count: 1 },
        ];
        const expenses: Expense[] = [
            {
                id: '1',
                description: 'Dinner',
                paidBy: 'Alice',
                amount: 100,
                paidFor: ['Alice', 'Bob'],
            },
        ];

        const result = calculateSettlement(people, expenses);

        expect(result.totalCost).toBe(100);
        expect(result.individualCosts).toEqual([
            { person: 'Alice', cost: 50 },
            { person: 'Bob', cost: 50 },
        ]);
        expect(result.transactions).toEqual([{ from: 'Bob', to: 'Alice', amount: 50 }]);
    });

    it('should handle weighted split with couples', () => {
        const people: Person[] = [
            { name: 'Couple', count: 2 },
            { name: 'Single', count: 1 },
        ];
        const expenses: Expense[] = [
            {
                id: '1',
                description: 'Hotel',
                paidBy: 'Single',
                amount: 300,
                paidFor: ['Couple', 'Single'],
            },
        ];

        const result = calculateSettlement(people, expenses);

        expect(result.totalCost).toBe(300);
        // Couple (count 2) should owe 200, Single (count 1) should owe 100
        expect(result.individualCosts).toEqual([
            { person: 'Couple', cost: 200 },
            { person: 'Single', cost: 100 },
        ]);
        // Couple owes Single: Couple paid 0, owes 200, so owes 200 net
        // Single paid 300, owes 100, so is owed 200 net
        expect(result.transactions).toEqual([{ from: 'Couple', to: 'Single', amount: 200 }]);
    });

    it('should handle itemized expenses', () => {
        const people: Person[] = [
            { name: 'Alice', count: 1 },
            { name: 'Bob', count: 1 },
            { name: 'Charlie', count: 1 },
        ];
        const expenses: Expense[] = [
            {
                id: '1',
                description: 'Restaurant',
                paidBy: 'Alice',
                amount: 100, // Total bill
                paidFor: ['Alice', 'Bob', 'Charlie'],
                items: [
                    { description: 'Steak', amount: 50, paidFor: ['Alice'] },
                    { description: 'Salad', amount: 20, paidFor: ['Bob'] },
                    { description: 'Pizza', amount: 30, paidFor: ['Charlie'] },
                ],
            },
        ];

        const result = calculateSettlement(people, expenses);

        expect(result.totalCost).toBe(100);
        expect(result.individualCosts).toEqual([
            { person: 'Alice', cost: 50 },
            { person: 'Bob', cost: 20 },
            { person: 'Charlie', cost: 30 },
        ]);
        // Alice paid 100, owes 50, is owed 50
        // Bob owes 20, Charlie owes 30
        expect(result.transactions).toHaveLength(2);
        expect(result.transactions).toContainEqual({ from: 'Charlie', to: 'Alice', amount: 30 });
        expect(result.transactions).toContainEqual({ from: 'Bob', to: 'Alice', amount: 20 });
    });

    it('should handle complex real trip scenario', () => {
        const people: Person[] = [
            { name: 'Zahin+Samiha', count: 2 },
            { name: 'Zerin', count: 1 },
            { name: 'Dipra', count: 1 },
        ];
        const expenses: Expense[] = [
            {
                id: '1',
                description: 'Resort Booking',
                paidBy: 'Zahin+Samiha',
                amount: 4000,
                paidFor: ['Zahin+Samiha', 'Zerin', 'Dipra'],
            },
            {
                id: '2',
                description: 'Dinner',
                paidBy: 'Zerin',
                amount: 800,
                paidFor: ['Zahin+Samiha', 'Zerin', 'Dipra'],
            },
            {
                id: '3',
                description: 'Activities',
                paidBy: 'Dipra',
                amount: 600,
                paidFor: ['Zahin+Samiha', 'Zerin', 'Dipra'],
            },
        ];

        const result = calculateSettlement(people, expenses);

        expect(result.totalCost).toBe(5400);

        // Total weight: 2 + 1 + 1 = 4
        // Zahin+Samiha: 5400 * 2/4 = 2700
        // Zerin: 5400 * 1/4 = 1350
        // Dipra: 5400 * 1/4 = 1350
        expect(result.individualCosts).toEqual([
            { person: 'Zahin+Samiha', cost: 2700 },
            { person: 'Zerin', cost: 1350 },
            { person: 'Dipra', cost: 1350 },
        ]);

        // Net balances:
        // Zahin+Samiha: paid 4000, owes 2700 = +1300 (owed money)
        // Zerin: paid 800, owes 1350 = -550 (owes money)
        // Dipra: paid 600, owes 1350 = -750 (owes money)
        expect(result.transactions).toHaveLength(2);
    });

    it('should handle expense paid for subset of people', () => {
        const people: Person[] = [
            { name: 'Alice', count: 1 },
            { name: 'Bob', count: 1 },
            { name: 'Charlie', count: 1 },
        ];
        const expenses: Expense[] = [
            {
                id: '1',
                description: 'Shared expense',
                paidBy: 'Alice',
                amount: 100,
                paidFor: ['Alice', 'Bob', 'Charlie'],
            },
            {
                id: '2',
                description: 'Just Alice and Bob',
                paidBy: 'Bob',
                amount: 60,
                paidFor: ['Alice', 'Bob'],
            },
        ];

        const result = calculateSettlement(people, expenses);

        expect(result.totalCost).toBe(160);
        // From expense 1: each owes 33.33
        // From expense 2: Alice and Bob each owe 30
        // Alice: 33.33 + 30 = 63.33
        // Bob: 33.33 + 30 = 63.33
        // Charlie: 33.33
        expect(result.individualCosts[0].cost).toBeCloseTo(63.33, 1);
        expect(result.individualCosts[1].cost).toBeCloseTo(63.33, 1);
        expect(result.individualCosts[2].cost).toBeCloseTo(33.33, 1);
    });

    it('should handle multiple payers scenario', () => {
        const people: Person[] = [
            { name: 'Alice', count: 1 },
            { name: 'Bob', count: 1 },
            { name: 'Charlie', count: 1 },
        ];
        const expenses: Expense[] = [
            {
                id: '1',
                description: 'Expense 1',
                paidBy: 'Alice',
                amount: 90,
                paidFor: ['Alice', 'Bob', 'Charlie'],
            },
            {
                id: '2',
                description: 'Expense 2',
                paidBy: 'Bob',
                amount: 60,
                paidFor: ['Alice', 'Bob', 'Charlie'],
            },
            {
                id: '3',
                description: 'Expense 3',
                paidBy: 'Charlie',
                amount: 30,
                paidFor: ['Alice', 'Bob', 'Charlie'],
            },
        ];

        const result = calculateSettlement(people, expenses);

        expect(result.totalCost).toBe(180);
        // Each person owes 60
        expect(result.individualCosts).toEqual([
            { person: 'Alice', cost: 60 },
            { person: 'Bob', cost: 60 },
            { person: 'Charlie', cost: 60 },
        ]);

        // Net balances:
        // Alice: paid 90, owes 60 = +30
        // Bob: paid 60, owes 60 = 0
        // Charlie: paid 30, owes 60 = -30
        expect(result.transactions).toEqual([{ from: 'Charlie', to: 'Alice', amount: 30 }]);
    });

    it('should minimize number of transactions', () => {
        const people: Person[] = [
            { name: 'A', count: 1 },
            { name: 'B', count: 1 },
            { name: 'C', count: 1 },
            { name: 'D', count: 1 },
        ];
        const expenses: Expense[] = [
            {
                id: '1',
                description: 'Expense',
                paidBy: 'A',
                amount: 400,
                paidFor: ['A', 'B', 'C', 'D'],
            },
        ];

        const result = calculateSettlement(people, expenses);

        expect(result.totalCost).toBe(400);
        // Each owes 100
        // A paid 400, owes 100, is owed 300
        // B, C, D each owe 100
        expect(result.transactions).toHaveLength(3);
        const totalPaidToA = result.transactions
            .filter((t) => t.to === 'A')
            .reduce((sum, t) => sum + t.amount, 0);
        expect(totalPaidToA).toBe(300);
    });

    it('should handle no transactions needed when everyone is even', () => {
        const people: Person[] = [
            { name: 'Alice', count: 1 },
            { name: 'Bob', count: 1 },
        ];
        const expenses: Expense[] = [
            {
                id: '1',
                description: 'Expense 1',
                paidBy: 'Alice',
                amount: 50,
                paidFor: ['Alice', 'Bob'],
            },
            {
                id: '2',
                description: 'Expense 2',
                paidBy: 'Bob',
                amount: 50,
                paidFor: ['Alice', 'Bob'],
            },
        ];

        const result = calculateSettlement(people, expenses);

        expect(result.totalCost).toBe(100);
        expect(result.individualCosts).toEqual([
            { person: 'Alice', cost: 50 },
            { person: 'Bob', cost: 50 },
        ]);
        expect(result.transactions).toHaveLength(0);
    });

    it('should handle Kaptai 2025 trip with itemized expenses', () => {
        const people: Person[] = [
            { name: 'Zahin+Samiha', count: 2 },
            { name: 'Zerin', count: 1 },
            { name: 'Dipra', count: 1 },
        ];

        const everyone = ['Zahin+Samiha', 'Zerin', 'Dipra'];

        const expenses: Expense[] = [
            // 1. Resort Booking Advance - Zahin+Samiha
            {
                id: '1',
                description: 'Bargee Lake Valley Resort Booking Advance',
                paidBy: 'Zahin+Samiha',
                amount: 1000,
                paidFor: everyone,
            },
            // 2. Resort Booking Advance - Zerin
            {
                id: '2',
                description: 'Bargee Lake Valley Resort Booking Advance',
                paidBy: 'Zerin',
                amount: 1500,
                paidFor: everyone,
            },
            // 3. Dhaka to Rangamati Bus
            {
                id: '3',
                description: 'Dhaka to Rangamati Bus',
                paidBy: 'Zahin+Samiha',
                amount: 1300,
                paidFor: everyone,
            },
            // 4. Rangamati to Dhaka Bus
            {
                id: '4',
                description: 'Rangamati to Dhaka Bus',
                paidBy: 'Zerin',
                amount: 2060,
                paidFor: everyone,
            },
            // 5. Breakfast at Rangamati
            {
                id: '5',
                description: 'Breakfast at Rangamati',
                paidBy: 'Zerin',
                amount: 220,
                paidFor: everyone,
            },
            // 6. Water
            {
                id: '6',
                description: 'Water',
                paidBy: 'Zahin+Samiha',
                amount: 125,
                paidFor: everyone,
            },
            // 7. Shuvolong waterfall entry ticket
            {
                id: '7',
                description: 'Shuvolong waterfall entry ticket',
                paidBy: 'Zahin+Samiha',
                amount: 50,
                paidFor: everyone,
            },
            // 8. Polwel Park entry ticket
            {
                id: '8',
                description: 'Polwel Park entry ticket',
                paidBy: 'Dipra',
                amount: 160,
                paidFor: everyone,
            },
            // 9. Boat fare - Zahin+Samiha
            {
                id: '9',
                description: 'Boat fare',
                paidBy: 'Zahin+Samiha',
                amount: 2000,
                paidFor: everyone,
            },
            // 10. Boat fare - Zerin
            {
                id: '10',
                description: 'Boat fare',
                paidBy: 'Zerin',
                amount: 500,
                paidFor: everyone,
            },
            // 11. Lunch at Bargee (itemized)
            {
                id: '11',
                description: 'Lunch at Bargee',
                paidBy: 'Dipra',
                amount: 1410,
                paidFor: everyone,
                items: [
                    { description: 'Rice', amount: 280, paidFor: everyone },
                    { description: 'Sonali Chicken', amount: 250, paidFor: ['Zahin+Samiha'] },
                    { description: 'Deshi Chicken', amount: 250, paidFor: ['Dipra'] },
                    { description: 'Dal', amount: 210, paidFor: everyone },
                    { description: 'Vegetable', amount: 80, paidFor: ['Zahin+Samiha'] },
                    { description: 'Vegetable', amount: 80, paidFor: ['Dipra'] },
                    { description: 'Chapila fry', amount: 120, paidFor: ['Zahin+Samiha'] },
                    { description: 'Vorta', amount: 100, paidFor: ['Zerin'] },
                    { description: 'Water', amount: 40, paidFor: everyone },
                ],
            },
            // 12. Snacks for night
            {
                id: '12',
                description: 'Snacks for night',
                paidBy: 'Zahin+Samiha',
                amount: 180,
                paidFor: everyone,
            },
            // 13. Dinner at Bargee (itemized)
            {
                id: '13',
                description: 'Dinner at Bargee',
                paidBy: 'Zerin',
                amount: 980,
                paidFor: everyone,
                items: [
                    { description: 'Rice', amount: 140, paidFor: everyone },
                    { description: 'Chicken', amount: 250, paidFor: ['Zahin+Samiha'] },
                    { description: 'Vegetable', amount: 80, paidFor: everyone },
                    { description: 'Dal', amount: 140, paidFor: everyone },
                    { description: 'Alu vorta', amount: 100, paidFor: ['Zerin', 'Dipra'] },
                    { description: 'Tomato vorta', amount: 50, paidFor: everyone },
                    { description: 'Chapila fry', amount: 120, paidFor: ['Zahin+Samiha'] },
                    { description: 'Water', amount: 40, paidFor: everyone },
                    { description: 'Dew', amount: 30, paidFor: ['Zahin+Samiha'] },
                    { description: 'Pepsi', amount: 30, paidFor: ['Dipra'] },
                ],
            },
        ];

        const result = calculateSettlement(people, expenses);

        // Verify total cost
        expect(result.totalCost).toBe(11485);

        // Verify individual costs
        expect(result.individualCosts).toEqual([
            { person: 'Zahin+Samiha', cost: 5887.5 },
            { person: 'Zerin', cost: 2668.75 },
            { person: 'Dipra', cost: 2928.75 },
        ]);

        // Verify transactions
        // Zahin+Samiha paid: 1000+1300+125+50+2000+180 = 4655, owes 5887.5, balance = -1232.5
        // Zerin paid: 1500+2060+220+500+980 = 5260, owes 2668.75, balance = +2591.25
        // Dipra paid: 160+1410 = 1570, owes 2928.75, balance = -1358.75
        expect(result.transactions).toHaveLength(2);
        expect(result.transactions).toContainEqual({
            from: 'Zahin+Samiha',
            to: 'Zerin',
            amount: 1232.5,
        });
        expect(result.transactions).toContainEqual({
            from: 'Dipra',
            to: 'Zerin',
            amount: 1358.75,
        });
    });
});
