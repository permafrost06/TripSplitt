export interface Person {
    name: string;
    count: number; // Supports couples/groups as single unit (e.g., 2 for a couple)
}

export interface ExpenseItem {
    description: string;
    amount: number;
    paidFor: string[]; // List of person names
}

export interface Expense {
    id: string;
    description: string;
    paidBy: string; // Person name
    amount: number;
    paidFor: string[]; // List of person names
    items?: ExpenseItem[]; // Optional itemized breakdown
}

export interface Trip {
    id: string;
    name: string;
    people: Person[];
    expenses: Expense[];
    createdAt: number;
    updatedAt: number;
}

export interface IndividualCost {
    person: string;
    cost: number;
}

export interface Transaction {
    from: string;
    to: string;
    amount: number;
}

export interface Settlement {
    totalCost: number;
    individualCosts: IndividualCost[];
    transactions: Transaction[];
}

export interface ShareData {
    id: string;
    trip: Trip;
    createdAt: number;
    expiresAt: number;
}
