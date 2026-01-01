import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Person } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Person
            </Button>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle>Add Person</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setShowForm(false);
                            setName('');
                            setCount(1);
                            setError('');
                        }}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="personName">Name</Label>
                            <Input
                                id="personName"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError('');
                                }}
                                placeholder="Name"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="personCount">Count</Label>
                            <Input
                                id="personCount"
                                type="number"
                                min="1"
                                value={count}
                                onChange={(e) =>
                                    setCount(Math.max(1, parseInt(e.target.value) || 1))
                                }
                            />
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                Use 2+ for couples
                            </p>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                    <Button type="submit" className="w-full">
                        Add Person
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
