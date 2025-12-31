import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Receipt, Pencil, Trash2, X, Check } from 'lucide-react';
import { useTrip } from '../hooks/useTrips';
import { PersonForm } from '../components/PersonForm';
import { ExpenseForm } from '../components/ExpenseForm';
import { SettlementView } from '../components/SettlementView';
import type { Expense, Person } from '../types';

type Tab = 'expenses' | 'people' | 'settlement';

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

    const [activeTab, setActiveTab] = useState<Tab>('expenses');
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [editingPersonIndex, setEditingPersonIndex] = useState<number | null>(null);
    const [editingPersonData, setEditingPersonData] = useState<Person | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="text-center py-12">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Trip not found</h2>
                <Link to="/" className="text-blue-600 hover:underline">
                    Go back home
                </Link>
            </div>
        );
    }

    const handleAddExpense = async (expense: Expense) => {
        if (editingExpense) {
            await updateExpense(editingExpense.id, expense);
            setEditingExpense(null);
        } else {
            await addExpense(expense);
        }
        setShowExpenseForm(false);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setShowExpenseForm(true);
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

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'expenses', label: 'Expenses', icon: <Receipt className="w-4 h-4" /> },
        { key: 'people', label: 'People', icon: <Users className="w-4 h-4" /> },
        { key: 'settlement', label: 'Settlement', icon: <Receipt className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    {editingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveName();
                                    if (e.key === 'Escape') setEditingName(false);
                                }}
                            />
                            <button
                                onClick={handleSaveName}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                                <Check className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setEditingName(false)}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={startEditingName}
                            className="text-2xl font-bold text-gray-900 hover:text-blue-600 text-left"
                        >
                            {trip.name}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.key
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.key === 'people' && (
                            <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                                {trip.people.length}
                            </span>
                        )}
                        {tab.key === 'expenses' && (
                            <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                                {trip.expenses.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'people' && (
                <div className="space-y-4">
                    {trip.people.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Add people to this trip to get started</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                            {trip.people.map((person, index) => (
                                <div
                                    key={person.name}
                                    className="p-4 flex items-center justify-between"
                                >
                                    {editingPersonIndex === index && editingPersonData ? (
                                        <div className="flex-1 flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={editingPersonData.name}
                                                onChange={(e) =>
                                                    setEditingPersonData({
                                                        ...editingPersonData,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="px-2 py-1 border border-gray-300 rounded"
                                            />
                                            <input
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
                                                className="w-16 px-2 py-1 border border-gray-300 rounded"
                                            />
                                            <button
                                                onClick={handleSavePerson}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingPersonIndex(null);
                                                    setEditingPersonData(null);
                                                }}
                                                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <span className="font-medium text-gray-900">
                                                    {person.name}
                                                </span>
                                                {person.count > 1 && (
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        (count: {person.count})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditPerson(index)}
                                                    className="p-2 text-gray-400 hover:text-blue-500"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePerson(index)}
                                                    className="p-2 text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <PersonForm onAdd={addPerson} existingNames={trip.people.map((p) => p.name)} />
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="space-y-4">
                    {trip.people.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500">
                                Add people to this trip before adding expenses
                            </p>
                            <button
                                onClick={() => setActiveTab('people')}
                                className="mt-2 text-blue-600 hover:underline"
                            >
                                Go to People tab
                            </button>
                        </div>
                    ) : showExpenseForm ? (
                        <ExpenseForm
                            people={trip.people}
                            onAdd={handleAddExpense}
                            onCancel={() => {
                                setShowExpenseForm(false);
                                setEditingExpense(null);
                            }}
                            initialExpense={editingExpense || undefined}
                        />
                    ) : (
                        <>
                            <button
                                onClick={() => setShowExpenseForm(true)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                            >
                                + Add Expense
                            </button>

                            {trip.expenses.length === 0 ? (
                                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No expenses yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {trip.expenses.map((expense) => (
                                        <div
                                            key={expense.id}
                                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {expense.description}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Paid by{' '}
                                                        <span className="font-medium">
                                                            {expense.paidBy}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        For: {expense.paidFor.join(', ')}
                                                    </p>
                                                    {expense.items && expense.items.length > 0 && (
                                                        <div className="mt-2 text-xs text-gray-400">
                                                            {expense.items.length} itemized item(s)
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">
                                                        ${expense.amount.toFixed(2)}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <button
                                                            onClick={() =>
                                                                handleEditExpense(expense)
                                                            }
                                                            className="p-1.5 text-gray-400 hover:text-blue-500"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteExpense(expense)
                                                            }
                                                            className="p-1.5 text-gray-400 hover:text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'settlement' && <SettlementView trip={trip} />}
        </div>
    );
}
