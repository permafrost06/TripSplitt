import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Person } from '../types';

interface PersonFormProps {
    onAdd: (person: Person) => void;
    existingNames: string[];
}

export function PersonForm({ onAdd, existingNames }: PersonFormProps) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [count, setCount] = useState(1);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError('Name is required');
            return;
        }

        if (existingNames.includes(trimmedName)) {
            setError('This name already exists');
            return;
        }

        onAdd({ name: trimmedName, count });
        setName('');
        setCount(1);
        setError('');
        setShowForm(false);
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
                <Plus className="w-5 h-5" />
                Add Person
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Add Person</h4>
                <button
                    type="button"
                    onClick={() => {
                        setShowForm(false);
                        setName('');
                        setCount(1);
                        setError('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="personName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Name
                    </label>
                    <input
                        id="personName"
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        placeholder="e.g., John or John+Jane"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                    />
                </div>
                <div>
                    <label
                        htmlFor="personCount"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Count
                    </label>
                    <input
                        id="personCount"
                        type="number"
                        min="1"
                        value={count}
                        onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use 2+ for couples</p>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Add Person
            </button>
        </form>
    );
}
