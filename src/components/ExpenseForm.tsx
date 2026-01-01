import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import type { Person, Expense, ExpenseItem } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn, formatCurrency } from '@/lib/utils';
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
    const [showItems, setShowItems] = useState(
        initialExpense?.items ? initialExpense.items.length > 0 : false
    );
    const [items, setItems] = useState<ExpenseItem[]>(initialExpense?.items || []);
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

        if (showItems) {
            const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
            if (Math.abs(itemsTotal - parsedAmount) > 0.01) {
                setError(
                    `Items total (${itemsTotal.toFixed(2)}) doesn't match (${parsedAmount.toFixed(2)})`
                );
                return;
            }

            for (const item of items) {
                if (!item.description.trim() || item.amount <= 0 || item.paidFor.length === 0) {
                    setError('All items need description, amount, and person');
                    return;
                }
            }
        }

        const expense: Expense = {
            id: initialExpense?.id || crypto.randomUUID(),
            description: description.trim(),
            amount: parsedAmount,
            paidBy,
            paidFor,
            items: showItems && items.length > 0 ? items : undefined,
        };

        onAdd(expense);
    };

    const addItem = () => {
        setItems([...items, { description: '', amount: 0, paidFor: people.map((p) => p.name) }]);
    };

    const updateItem = (index: number, updates: Partial<ExpenseItem>) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const togglePaidFor = (personName: string) => {
        setPaidFor((prev) =>
            prev.includes(personName) ? prev.filter((p) => p !== personName) : [...prev, personName]
        );
    };

    const toggleItemPaidFor = (itemIndex: number, personName: string) => {
        const item = items[itemIndex];
        const newPaidFor = item.paidFor.includes(personName)
            ? item.paidFor.filter((p) => p !== personName)
            : [...item.paidFor, personName];
        updateItem(itemIndex, { paidFor: newPaidFor });
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
                                        'px-3 py-1.5 text-sm transition-colors border',
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

                    <div className="border-t border-stone-200 dark:border-stone-800 pt-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="itemize"
                                    checked={showItems}
                                    onCheckedChange={(checked) => setShowItems(checked === true)}
                                />
                                <Label htmlFor="itemize" className="cursor-pointer">
                                    Itemize expense
                                </Label>
                            </div>
                            {showItems && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={addItem}
                                    className="gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Item
                                </Button>
                            )}
                        </div>

                        {showItems && (
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-stone-200 dark:border-stone-800 space-y-3"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                <Input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateItem(index, {
                                                            description: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Item description"
                                                    className="h-9 text-sm"
                                                />
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.amount || ''}
                                                    onChange={(e) =>
                                                        updateItem(index, {
                                                            amount: parseFloat(e.target.value) || 0,
                                                        })
                                                    }
                                                    placeholder="0.00"
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(index)}
                                                className="h-9 w-9"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {people.map((person) => (
                                                <button
                                                    key={person.name}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleItemPaidFor(index, person.name)
                                                    }
                                                    className={cn(
                                                        'px-2.5 py-1 text-xs transition-colors border',
                                                        item.paidFor.includes(person.name)
                                                            ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                                                            : 'bg-transparent text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                                                    )}
                                                >
                                                    {person.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {items.length > 0 && (
                                    <div className="text-sm text-right">
                                        <span className="text-stone-500">Items: </span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                items.reduce((sum, item) => sum + item.amount, 0),
                                                currency
                                            )}
                                        </span>
                                        {amount && (
                                            <span
                                                className={cn(
                                                    'ml-2',
                                                    Math.abs(
                                                        items.reduce(
                                                            (sum, item) => sum + item.amount,
                                                            0
                                                        ) - parseFloat(amount)
                                                    ) > 0.01
                                                        ? 'text-red-600'
                                                        : 'text-emerald-600'
                                                )}
                                            >
                                                / {formatCurrency(parseFloat(amount), currency)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
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
