
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckIcon } from '../components/icons/CheckIcon';
import { BillingIcon } from '../components/icons/BillingIcon';

const plans = {
    'Starter': {
        price: '₱500/cycle',
        features: ['Basic AI Assistant Access', 'Community Forum Entry', 'Access to Starter Kits'],
        color: 'border-gray-300'
    },
    'Franchise': {
        price: '₱1,500/cycle',
        features: ['Full AI Assistant Access', 'Priority Support', 'Marketplace Listing', 'Feed Discounts'],
        color: 'border-secondary'
    },
    'Cluster Leader': {
        price: 'Custom',
        features: ['All Franchise Benefits', 'Management Tools', 'Cluster Performance Analytics'],
        color: 'border-accent'
    },
    'Trainee': {
        price: 'Free',
        features: ['Onboarding Materials', 'Limited AI Assistant', 'Mentorship Matching'],
        color: 'border-blue-300'
    }
}

const mockBillingHistory = [
    { id: 'inv_12345', date: '2024-06-15', plan: 'Franchise', amount: '₱1,500.00', status: 'Paid' },
    { id: 'inv_12344', date: '2024-03-15', plan: 'Franchise', amount: '₱1,500.00', status: 'Paid' },
    { id: 'inv_12343', date: '2023-12-15', plan: 'Starter', amount: '₱500.00', status: 'Paid' },
    { id: 'inv_12342', date: '2023-09-15', plan: 'Starter', amount: '₱500.00', status: 'Paid' },
];

const BillingPage: React.FC = () => {
    const { user } = useAuth();
    const currentPlan = user ? plans[user.membershipLevel] : plans['Starter'];
    const otherPlans = Object.entries(plans).filter(([level]) => level !== user?.membershipLevel);

    if (!user) {
        return <div>Loading...</div>; // Should be protected by route
    }

    return (
        <div className="overflow-y-auto h-full">
            <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-extrabold md:text-4xl">Billing & Subscriptions</h1>
                    <p className="mt-2 text-lg text-gray-200">Manage your plan and view payment history.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Current Plan */}
                    <div className={`bg-white p-8 rounded-xl shadow-lg border-t-8 ${currentPlan.color}`}>
                        <h2 className="text-2xl font-bold text-primary mb-4">Your Current Plan</h2>
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-3xl font-extrabold text-text-dark">{user.membershipLevel}</h3>
                            <p className="text-2xl font-bold text-secondary">{currentPlan.price}</p>
                        </div>
                        <ul className="mt-6 space-y-3">
                            {currentPlan.features.map(feature => (
                                <li key={feature} className="flex items-center text-gray-600">
                                    <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                            <p className="text-sm text-gray-500 mb-4 sm:mb-0">Your plan renews on August 15, 2024.</p>
                            <button disabled className="w-full sm:w-auto bg-gray-300 text-gray-500 font-bold py-2 px-6 rounded-md cursor-not-allowed">
                                Change Plan
                            </button>
                        </div>
                    </div>
                    
                    {/* Other Plans */}
                    <div>
                        <h2 className="text-2xl font-bold text-primary mb-6">Explore Other Plans</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {otherPlans.map(([level, plan]) => (
                                <div key={level} className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
                                    <h3 className="text-xl font-bold text-primary">{level}</h3>
                                    <p className="text-lg font-semibold text-secondary mt-1">{plan.price}</p>
                                    <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-grow">
                                        {plan.features.map(feature => (
                                            <li key={feature} className="flex items-start">
                                                <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button disabled className="mt-6 w-full bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded-md cursor-not-allowed">
                                        Switch to this Plan
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8 sticky top-24">
                     <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-primary mb-4">Payment Method</h3>
                        <div className="flex items-center space-x-4">
                            <BillingIcon className="h-8 w-8 text-secondary" />
                            <div>
                                <p className="font-semibold text-text-dark">Visa ending in 1234</p>
                                <p className="text-sm text-gray-500">Expires 12/2026</p>
                            </div>
                        </div>
                        <button disabled className="mt-6 w-full bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded-md cursor-not-allowed">
                            Update Payment Method
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-primary mb-4">Billing History</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {mockBillingHistory.map(item => (
                                <div key={item.id} className="border-b border-gray-200 pb-3">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{item.plan} Plan</p>
                                        <p className="font-bold text-text-dark">{item.amount}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-1 text-sm">
                                        <p className="text-gray-500">{item.date}</p>
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {item.status}
                                        </span>
                                    </div>
                                    <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-secondary hover:underline font-semibold mt-2 inline-block cursor-not-allowed">Download Invoice</a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;