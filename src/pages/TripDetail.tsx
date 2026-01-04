import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    Receipt,
    Pencil,
    Trash2,
    X,
    Check,
    Calculator,
    Plus,
    ChevronDown,
    Share2,
} from 'lucide-react';
import { useTrip } from '../hooks/useTrips';
import { PersonForm } from '../components/PersonForm';
import { ExpenseForm } from '../components/ExpenseForm';
import { GroupExpenseForm } from '../components/GroupExpenseForm';
import { SettlementView } from '../components/SettlementView';
import type { Expense, Person } from '../types';
import { compressTripData, arrayBufferToBase64Url } from '../lib/compression';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';

export function TripDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        trip,
        loading,
        addPerson,
        updatePerson,
        removePerson,
        addExpense,
        updateExpense,
        removeExpense,
        updateTrip,
    } = useTrip(id);

    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [showGroupExpenseForm, setShowGroupExpenseForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [editingPersonIndex, setEditingPersonIndex] = useState<number | null>(null);
    const [editingPersonData, setEditingPersonData] = useState<Person | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (trip) {
            const itemizedExpenseIds = trip.expenses
                .filter((e) => e.items && e.items.length > 0)
                .map((e) => e.id);
            setExpandedItems(new Set(itemizedExpenseIds));
        }
    }, [trip]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 border border-stone-300 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 animate-spin" />
            </div>
        );
    }

    if (!trip) {
        return (
            <Card className="py-12">
                <CardContent>
                    <div className="text-center">
                        <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                            Trip not found
                        </h2>
                        <Link to="/" className="text-stone-600 hover:underline dark:text-stone-400">
                            Go back home
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const toggleExpandedItems = (expenseId: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(expenseId)) {
                next.delete(expenseId);
            } else {
                next.add(expenseId);
            }
            return next;
        });
    };

    const isItemizedExpanded = (expenseId: string) => expandedItems.has(expenseId);

    const getAbbreviatedName = (name: string): string => {
        const parts = name.split(/[\s,+]+/).filter(Boolean);
        if (parts.length > 1) {
            return parts.map((part) => part.charAt(0).toUpperCase()).join('');
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleAddExpense = async (expense: Expense) => {
        if (editingExpense) {
            await updateExpense(editingExpense.id, expense);
            setEditingExpense(null);
        } else {
            await addExpense(expense);
        }
        setShowExpenseForm(false);
        setShowGroupExpenseForm(false);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        if (expense.items && expense.items.length > 0) {
            setShowGroupExpenseForm(true);
        } else {
            setShowExpenseForm(true);
        }
    };

    const handleDeleteExpense = async (expense: Expense) => {
        if (confirm(`Delete "${expense.description}"?`)) {
            await removeExpense(expense.id);
        }
    };

    const handleEditPerson = (index: number) => {
        setEditingPersonIndex(index);
        setEditingPersonData({ ...trip.people[index] });
    };

    const handleSavePerson = async () => {
        if (editingPersonIndex !== null && editingPersonData) {
            await updatePerson(editingPersonIndex, editingPersonData);
            setEditingPersonIndex(null);
            setEditingPersonData(null);
        }
    };

    const handleDeletePerson = async (index: number) => {
        const person = trip.people[index];
        if (confirm(`Remove "${person.name}" from this trip?`)) {
            await removePerson(index);
        }
    };

    const handleSaveName = async () => {
        if (newName.trim()) {
            await updateTrip({ name: newName.trim() });
        }
        setEditingName(false);
    };

    const startEditingName = () => {
        setNewName(trip.name);
        setEditingName(true);
    };

    const handleShare = async () => {
        const compressed = await compressTripData(trip);
        const base64Url = arrayBufferToBase64Url(compressed);
        const url = `${window.location.origin}/i?d=${base64Url}`;
        setShareUrl(url);
        setShowShareModal(true);
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        {editingName ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="text-2xl font-serif bg-transparent border-b border-stone-300 dark:border-stone-700 focus:border-stone-900 dark:focus:border-stone-100"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveName();
                                        if (e.key === 'Escape') setEditingName(false);
                                    }}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleSaveName}
                                    className="text-emerald-600"
                                >
                                    <Check className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingName(false)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        ) : (
                            <button
                                onClick={startEditingName}
                                className="text-2xl font-serif text-stone-900 dark:text-stone-100 hover:text-stone-700 dark:hover:text-stone-300 transition-colors text-left"
                            >
                                {trip.name}
                            </button>
                        )}
                        <Badge variant="secondary" className="text-sm">
                            {formatCurrency(0, trip.currency).replace('0.00', '').trim()}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleShare}
                            className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer"
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 dark:bg-black/50">
                    <div className="relative w-full max-w-md p-6 bg-white dark:bg-stone-900 rounded-none shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-serif text-stone-900 dark:text-stone-100">
                                Share Trip
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowShareModal(false)}
                                className="cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-white dark:bg-white p-4 rounded-lg">
                                <QRCodeSVG
                                    value={shareUrl}
                                    size={280}
                                    level="M"
                                    includeMargin={false}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                />
                            </div>
                            <p className="text-sm text-stone-500 dark:text-stone-400 text-center">
                                Scan to import this trip
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(shareUrl);
                                }}
                                className="w-full cursor-pointer"
                            >
                                Copy Link
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="expenses" className="w-full">
                <TabsList className="w-full grid grid-cols-3 border-b border-stone-200 dark:border-stone-800 rounded-none bg-transparent p-0 h-auto">
                    <TabsTrigger
                        value="expenses"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-900 dark:data-[state=active]:border-stone-100 data-[state=active]:bg-transparent px-0 py-3 cursor-pointer"
                    >
                        <Receipt className="w-4 h-4 mr-2" />
                        Expenses
                        <Badge variant="secondary" className="ml-2">
                            {trip.expenses.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                        value="people"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-900 dark:data-[state=active]:border-stone-100 data-[state=active]:bg-transparent px-0 py-3 cursor-pointer"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        People
                        <Badge variant="secondary" className="ml-2">
                            {trip.people.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                        value="settlement"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-900 dark:data-[state=active]:border-stone-100 data-[state=active]:bg-transparent px-0 py-3 cursor-pointer"
                    >
                        <Calculator className="w-4 h-4 mr-2" />
                        Settlement
                    </TabsTrigger>
                </TabsList>

                {/* People Tab */}
                <TabsContent value="people" className="space-y-6 mt-6">
                    {trip.people.length === 0 ? (
                        <Card className="py-12">
                            <CardContent>
                                <div className="text-center">
                                    <Users className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700 mb-4" />
                                    <p className="text-stone-500 dark:text-stone-400 mb-4">
                                        Add people to this trip
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0 divide-y divide-stone-100 dark:divide-stone-800">
                                {trip.people.map((person, index) => (
                                    <div
                                        key={person.name}
                                        className="p-4 flex items-center justify-between"
                                    >
                                        {editingPersonIndex === index && editingPersonData ? (
                                            <div className="flex-1 flex items-center gap-3">
                                                <Input
                                                    type="text"
                                                    value={editingPersonData.name}
                                                    onChange={(e) =>
                                                        setEditingPersonData({
                                                            ...editingPersonData,
                                                            name: e.target.value,
                                                        })
                                                    }
                                                    className="max-w-[180px]"
                                                />
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={editingPersonData.count}
                                                    onChange={(e) =>
                                                        setEditingPersonData({
                                                            ...editingPersonData,
                                                            count: Math.max(
                                                                1,
                                                                parseInt(e.target.value) || 1
                                                            ),
                                                        })
                                                    }
                                                    className="w-16"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleSavePerson}
                                                    className="text-emerald-600"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingPersonIndex(null);
                                                        setEditingPersonData(null);
                                                    }}
                                                >
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <span className="w-10 h-10 flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium">
                                                        {getAbbreviatedName(person.name)}
                                                    </span>
                                                    <div>
                                                        <span className="font-medium text-stone-900 dark:text-stone-100">
                                                            {person.name}
                                                        </span>
                                                        {person.count > 1 && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-2"
                                                            >
                                                                ×{person.count}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditPerson(index)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeletePerson(index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <PersonForm onAdd={addPerson} existingNames={trip.people.map((p) => p.name)} />
                </TabsContent>

                {/* Expenses Tab */}
                <TabsContent value="expenses" className="space-y-6 mt-6">
                    {trip.people.length === 0 ? (
                        <Card className="py-12">
                            <CardContent>
                                <div className="text-center">
                                    <p className="text-stone-500 dark:text-stone-400 mb-4">
                                        Add people first
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : showExpenseForm ? (
                        <ExpenseForm
                            people={trip.people}
                            onAdd={handleAddExpense}
                            onCancel={() => {
                                setShowExpenseForm(false);
                                setEditingExpense(null);
                            }}
                            initialExpense={editingExpense || undefined}
                            currency={trip.currency}
                        />
                    ) : showGroupExpenseForm ? (
                        <GroupExpenseForm
                            people={trip.people}
                            onAdd={handleAddExpense}
                            onCancel={() => {
                                setShowGroupExpenseForm(false);
                                setEditingExpense(null);
                            }}
                            initialExpense={editingExpense || undefined}
                            currency={trip.currency}
                        />
                    ) : (
                        <>
                            <div className="sticky top-[72px] z-10 bg-stone-50 dark:bg-stone-950 pt-2 pb-4 -mx-6 px-6 border-b border-stone-200 dark:border-stone-800 space-y-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowExpenseForm(true)}
                                    className="w-full h-12 border-dashed"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Expense
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowGroupExpenseForm(true)}
                                    className="w-full h-12 border-dashed"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Expense Group
                                </Button>
                            </div>

                            {trip.expenses.length === 0 ? (
                                <Card className="py-12">
                                    <CardContent>
                                        <div className="text-center">
                                            <Receipt className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700 mb-4" />
                                            <p className="text-stone-500 dark:text-stone-400">
                                                No expenses yet
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-0">
                                    {trip.expenses.map((expense) => (
                                        <article
                                            key={expense.id}
                                            onClick={() =>
                                                expense.items && toggleExpandedItems(expense.id)
                                            }
                                            className={`group border-b border-stone-200 dark:border-stone-800 py-4 -mx-6 px-6 ${
                                                expense.items
                                                    ? 'cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800/50 bg-stone-50/50 dark:bg-stone-900/30'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-stone-900 dark:text-stone-100">
                                                        {expense.description}
                                                    </h4>
                                                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                                                        Paid by {expense.paidBy}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {expense.items ? (
                                                            <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                                                Grouped
                                                            </Badge>
                                                        ) : expense.paidFor.length ===
                                                          trip.people.length ? (
                                                            <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                                                                Everyone
                                                            </Badge>
                                                        ) : (
                                                            expense.paidFor.map((person) => (
                                                                <Badge
                                                                    key={person}
                                                                    className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                                                >
                                                                    {person}
                                                                </Badge>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-lg font-medium text-stone-900 dark:text-stone-100">
                                                        {formatCurrency(
                                                            expense.amount,
                                                            trip.currency
                                                        )}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {expense.items && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleExpandedItems(expense.id);
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <ChevronDown
                                                                    className={`w-4 h-4 transition-transform ${
                                                                        isItemizedExpanded(
                                                                            expense.id
                                                                        )
                                                                            ? 'rotate-180'
                                                                            : ''
                                                                    }`}
                                                                />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditExpense(expense);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteExpense(expense);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            {expense.items && isItemizedExpanded(expense.id) && (
                                                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                                                    <div className="space-y-2">
                                                        {expense.items.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between text-sm"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-stone-600 dark:text-stone-400">
                                                                        {item.description}
                                                                    </span>
                                                                    <div className="flex gap-1">
                                                                        {item.paidFor.map(
                                                                            (person) => (
                                                                                <Badge
                                                                                    key={person}
                                                                                    variant="secondary"
                                                                                    className="text-[10px] px-1.5 py-0"
                                                                                >
                                                                                    {getAbbreviatedName(
                                                                                        person
                                                                                    )}
                                                                                </Badge>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className="font-medium text-stone-900 dark:text-stone-100">
                                                                    {formatCurrency(
                                                                        item.amount,
                                                                        trip.currency
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                {/* Settlement Tab */}
                <TabsContent value="settlement" className="mt-6">
                    <SettlementView trip={trip} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
