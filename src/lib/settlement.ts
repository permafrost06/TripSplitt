import type { Person, Expense, Settlement, IndividualCost, Transaction } from '../types';

/**
 * Calculate how costs should be split among people based on their count weights.
 * This is a pure function with no side effects.
 */
export function calculateSettlement(people: Person[], expenses: Expense[]): Settlement {
    if (people.length === 0) {
        return {
            totalCost: 0,
            individualCosts: [],
            transactions: [],
        };
    }

    // Create a map of person name to their count for quick lookup
    const personCountMap = new Map<string, number>();
    for (const person of people) {
        personCountMap.set(person.name, person.count);
    }

    // Track what each person owes (consumed) and what they paid
    const owes = new Map<string, number>();
    const paid = new Map<string, number>();

    // Initialize maps
    for (const person of people) {
        owes.set(person.name, 0);
        paid.set(person.name, 0);
    }

    let totalCost = 0;

    for (const expense of expenses) {
        totalCost += expense.amount;

        // Track what the payer paid
        const currentPaid = paid.get(expense.paidBy) || 0;
        paid.set(expense.paidBy, currentPaid + expense.amount);

        if (expense.items && expense.items.length > 0) {
            // Handle itemized expenses
            for (const item of expense.items) {
                distributeAmount(item.amount, item.paidFor, personCountMap, owes);
            }
        } else {
            // Handle non-itemized expenses - split among paidFor people
            distributeAmount(expense.amount, expense.paidFor, personCountMap, owes);
        }
    }

    // Calculate individual costs (what each person owes)
    const individualCosts: IndividualCost[] = people.map((person) => ({
        person: person.name,
        cost: roundToTwoDecimals(owes.get(person.name) || 0),
    }));

    // Calculate net balance for each person (positive = they are owed money, negative = they owe money)
    const balances = new Map<string, number>();
    for (const person of people) {
        const personPaid = paid.get(person.name) || 0;
        const personOwes = owes.get(person.name) || 0;
        balances.set(person.name, personPaid - personOwes);
    }

    // Generate optimized settlement transactions
    const transactions = generateOptimizedTransactions(balances);

    return {
        totalCost: roundToTwoDecimals(totalCost),
        individualCosts,
        transactions,
    };
}

/**
 * Distribute an amount among people based on their count weights.
 */
function distributeAmount(
    amount: number,
    paidFor: string[],
    personCountMap: Map<string, number>,
    owes: Map<string, number>
): void {
    // Calculate total weight of people the expense is for
    let totalWeight = 0;
    for (const personName of paidFor) {
        totalWeight += personCountMap.get(personName) || 1;
    }

    if (totalWeight === 0) return;

    // Distribute the amount based on weight
    for (const personName of paidFor) {
        const personWeight = personCountMap.get(personName) || 1;
        const share = (amount * personWeight) / totalWeight;
        const currentOwes = owes.get(personName) || 0;
        owes.set(personName, currentOwes + share);
    }
}

/**
 * Generate optimized settlement transactions to minimize the number of payments.
 * Uses a greedy algorithm to settle debts.
 */
function generateOptimizedTransactions(balances: Map<string, number>): Transaction[] {
    const transactions: Transaction[] = [];

    // Separate into creditors (positive balance, owed money) and debtors (negative balance, owe money)
    const creditors: { name: string; amount: number }[] = [];
    const debtors: { name: string; amount: number }[] = [];

    for (const [name, balance] of balances) {
        const roundedBalance = roundToTwoDecimals(balance);
        if (roundedBalance > 0.01) {
            creditors.push({ name, amount: roundedBalance });
        } else if (roundedBalance < -0.01) {
            debtors.push({ name, amount: -roundedBalance }); // Store as positive
        }
    }

    // Sort by amount descending for greedy optimization
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Greedy algorithm: match largest creditor with largest debtor
    let creditorIdx = 0;
    let debtorIdx = 0;

    while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
        const creditor = creditors[creditorIdx];
        const debtor = debtors[debtorIdx];

        const amount = Math.min(creditor.amount, debtor.amount);

        if (amount > 0.01) {
            transactions.push({
                from: debtor.name,
                to: creditor.name,
                amount: roundToTwoDecimals(amount),
            });
        }

        creditor.amount -= amount;
        debtor.amount -= amount;

        if (creditor.amount < 0.01) creditorIdx++;
        if (debtor.amount < 0.01) debtorIdx++;
    }

    return transactions;
}

/**
 * Round a number to two decimal places.
 */
function roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100;
}
