import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import type { Person, Expense, ExpenseItem } from '../types';

interface ExpenseFormProps {
    people: Person[];
    onAdd: (expense: Expense) => void;
    onCancel: () => void;
    initialExpense?: Expense;
}

export function ExpenseForm({ people, onAdd, onCancel, initialExpense }: ExpenseFormProps) {
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
            setError('Amount must be a positive number');
            return;
        }

        if (!paidBy) {
            setError('Please select who paid');
            return;
        }

        if (paidFor.length === 0) {
            setError('Please select at least one person');
            return;
        }

        if (showItems) {
            const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
            if (Math.abs(itemsTotal - parsedAmount) > 0.01) {
                setError(
                    `Items total ($${itemsTotal.toFixed(2)}) doesn't match expense amount ($${parsedAmount.toFixed(2)})`
                );
                return;
            }

            for (const item of items) {
                if (!item.description.trim() || item.amount <= 0 || item.paidFor.length === 0) {
                    setError('All items must have description, amount, and at least one person');
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
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    {initialExpense ? 'Edit Expense' : 'Add Expense'}
                </h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="expenseDescription"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Description
                    </label>
                    <input
                        id="expenseDescription"
                        type="text"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            setError('');
                        }}
                        placeholder="e.g., Dinner, Hotel, Taxi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                    />
                </div>
                <div>
                    <label
                        htmlFor="expenseAmount"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Amount
                    </label>
                    <input
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
                    Paid By
                </label>
                <select
                    id="paidBy"
                    value={paidBy}
                    onChange={(e) => {
                        setPaidBy(e.target.value);
                        setError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Select person</option>
                    {people.map((person) => (
                        <option key={person.name} value={person.name}>
                            {person.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid For</label>
                <div className="flex flex-wrap gap-2">
                    {people.map((person) => (
                        <button
                            key={person.name}
                            type="button"
                            onClick={() => togglePaidFor(person.name)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                paidFor.includes(person.name)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {person.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showItems}
                            onChange={(e) => setShowItems(e.target.checked)}
                            className="w-4 h-4 text-blue-500 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Itemize expense</span>
                    </label>
                    {showItems && (
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    )}
                </div>

                {showItems && (
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-3">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) =>
                                                updateItem(index, { description: e.target.value })
                                            }
                                            placeholder="Item description"
                                            className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <input
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
                                            className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-1 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {people.map((person) => (
                                        <button
                                            key={person.name}
                                            type="button"
                                            onClick={() => toggleItemPaidFor(index, person.name)}
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                item.paidFor.includes(person.name)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                        >
                                            {person.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {items.length > 0 && (
                            <div className="text-sm text-gray-500 text-right">
                                Items total: $
                                {items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                                {amount && (
                                    <span
                                        className={
                                            Math.abs(
                                                items.reduce((sum, item) => sum + item.amount, 0) -
                                                    parseFloat(amount)
                                            ) > 0.01
                                                ? ' text-red-500'
                                                : ' text-green-500'
                                        }
                                    >
                                        {' '}
                                        / ${parseFloat(amount).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    {initialExpense ? 'Save Changes' : 'Add Expense'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
