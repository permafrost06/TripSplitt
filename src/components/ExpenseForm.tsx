import { useState } from 'react';
import { X } from 'lucide-react';
import type { Person, Expense } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Currency } from '@/types';

interface ExpenseFormProps {
    people: Person[];
    onAdd: (expense: Expense) => void;
    onCancel: () => void;
    initialExpense?: Expense;
    currency?: Currency;
}

export function ExpenseForm({
    people,
    onAdd,
    onCancel,
    initialExpense,
    currency = 'USD',
}: ExpenseFormProps) {
    const [description, setDescription] = useState(initialExpense?.description || '');
    const [amount, setAmount] = useState(initialExpense?.amount?.toString() || '');
    const [paidBy, setPaidBy] = useState(initialExpense?.paidBy || '');
    const [paidFor, setPaidFor] = useState<string[]>(
        initialExpense?.paidFor || people.map((p) => p.name)
    );
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            setError('Description is required');
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Amount must be positive');
            return;
        }

        if (!paidBy) {
            setError('Select who paid');
            return;
        }

        if (paidFor.length === 0) {
            setError('Select at least one person');
            return;
        }

        const expense: Expense = {
            id: initialExpense?.id || crypto.randomUUID(),
            description: description.trim(),
            amount: parsedAmount,
            paidBy,
            paidFor,
        };

        onAdd(expense);
    };

    const togglePaidFor = (personName: string) => {
        setPaidFor((prev) =>
            prev.includes(personName) ? prev.filter((p) => p !== personName) : [...prev, personName]
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{initialExpense ? 'Edit Expense' : 'Add Expense'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expenseDescription">Description</Label>
                            <Input
                                id="expenseDescription"
                                type="text"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    setError('');
                                }}
                                placeholder="Expense description"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expenseAmount">Amount</Label>
                            <div className="relative">
                                <Input
                                    id="expenseAmount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="0.00"
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500">
                                    {currency === 'BDT' ? '৳' : '$'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Paid By</Label>
                        <Select
                            value={paidBy}
                            onValueChange={(value) => {
                                setPaidBy(value);
                                setError('');
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select person" />
                            </SelectTrigger>
                            <SelectContent>
                                {people.map((person) => (
                                    <SelectItem key={person.name} value={person.name}>
                                        {person.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Paid For</Label>
                        <div className="flex flex-wrap gap-2">
                            {people.map((person) => (
                                <button
                                    key={person.name}
                                    type="button"
                                    onClick={() => togglePaidFor(person.name)}
                                    className={cn(
                                        'px-3 py-1.5 text-sm transition-colors border cursor-pointer',
                                        paidFor.includes(person.name)
                                            ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                                            : 'bg-transparent text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                                    )}
                                >
                                    {person.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                    <div className="flex gap-3">
                        <Button type="submit" className="flex-1">
                            {initialExpense ? 'Save Changes' : 'Add Expense'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
