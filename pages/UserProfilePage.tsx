import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from '../components/icons/UserIcon';

const UserProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { user: loggedInUser, getUserByUsername, adminUpdateUser } = useAuth();
    
    // This is a snapshot, won't update automatically after an edit unless we trigger a re-fetch or state update.
    const [userProfile, setUserProfile] = useState(() => username ? getUserByUsername(username) : undefined);
    
    // State for edit form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'member'>('member');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const profile = username ? getUserByUsername(username) : undefined;
        setUserProfile(profile);
        if (profile) {
            setName(profile.name);
            setEmail(profile.email);
            setRole(profile.role);
        }
    }, [username, getUserByUsername]);

    if (!userProfile) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-primary">User Not Found</h1>
                <p className="text-gray-600 mt-2">The profile you are looking for does not exist.</p>
                <Link to="/admin" className="mt-6 inline-block bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors">
                    Return to Admin Dashboard
                </Link>
            </div>
        );
    }

    const isAdminViewer = loggedInUser?.role === 'admin';
    const isOwnProfile = loggedInUser?.username === userProfile.username;

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminUpdateUser) return;
        
        setLoading(true);
        setMessage(null);
        try {
            const updatedUser = await adminUpdateUser({ id: userProfile.id, name, email, role });
            setUserProfile(updatedUser); // Update local state to reflect changes immediately
            setMessage({ type: 'success', text: 'User profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };
    
    const MessageFeedback: React.FC<{ message: { type: 'success' | 'error', text: string } | null }> = ({ message }) => {
        if (!message) return null;
        const baseClasses = 'text-sm p-3 rounded-md mt-4 text-center';
        const typeClasses = message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return <div className={`${baseClasses} ${typeClasses}`}>{message.text}</div>;
    };

    // Admin trying to edit themselves on this public-facing profile page
    if (isAdminViewer && isOwnProfile) {
        return (
            <div className="text-center py-20 max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-primary">Viewing Your Own Profile</h1>
                <p className="text-gray-600 mt-2">To edit your own details, please use your dedicated profile page for security and clarity.</p>
                <Link to="/profile" className="mt-6 inline-block bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors">
                    Go to My Profile Page
                </Link>
            </div>
        );
    }
    
    const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm";

    // Admin view for editing other users
    if (isAdminViewer && !isOwnProfile) {
        return (
            <div>
                <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-extrabold">Edit Member Profile</h1>
                        <p className="mt-2 text-lg text-gray-200">Updating details for {userProfile.name}.</p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input type="text" value={userProfile.username} readOnly disabled className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'member')} className={inputClass}>
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="pt-2 text-right">
                                <Link to="/admin" className="text-sm text-gray-600 hover:text-primary mr-4">Cancel</Link>
                                <button type="submit" disabled={loading} className="bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            <MessageFeedback message={message} />
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Default read-only view for members
    return (
        <div>
            <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-extrabold">Member Profile</h1>
                    <p className="mt-2 text-lg text-gray-200">Viewing details for {userProfile.name}.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-secondary">
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-light-bg p-4 rounded-full mb-4">
                             <UserIcon className="h-20 w-20 text-secondary" />
                        </div>
                       
                        <h2 className="text-3xl font-bold text-primary">{userProfile.name}</h2>
                        <p className="text-gray-500 mt-1">@{userProfile.username}</p>
                        
                        <span className={`mt-4 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full capitalize ${userProfile.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {userProfile.role}
                        </span>
                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                <dd className="mt-1 text-lg text-gray-900">{userProfile.name}</dd>
                            </div>
                             <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Username</dt>
                                <dd className="mt-1 text-lg text-gray-900">{userProfile.username}</dd>
                            </div>
                             <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-lg text-gray-500 italic">(Private)</dd>
                            </div>
                             <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Role</dt>
                                <dd className="mt-1 text-lg text-gray-900 capitalize">{userProfile.role}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;