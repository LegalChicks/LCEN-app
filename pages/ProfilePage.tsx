import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    const { user, updateUserProfile, changePassword, adminBackupEmail, updateAdminBackupEmail } = useAuth();

    // State for profile form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    
    // State for password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    // State for admin settings form
    const [backupEmail, setBackupEmail] = useState('');
    const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [adminLoading, setAdminLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            if (user.role === 'admin') {
                setBackupEmail(adminBackupEmail);
            }
        }
    }, [user, adminBackupEmail]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage(null);
        try {
            await updateUserProfile({ name, email });
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setProfileMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setPasswordLoading(true);
        setPasswordMessage(null);
        try {
            await changePassword({ currentPassword, newPassword });
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change password.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdminLoading(true);
        setAdminMessage(null);
         try {
            await updateAdminBackupEmail(backupEmail);
            setAdminMessage({ type: 'success', text: 'Backup email updated successfully!' });
        } catch (error) {
            setAdminMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update backup email.' });
        } finally {
            setAdminLoading(false);
        }
    };

    const MessageFeedback: React.FC<{ message: { type: 'success' | 'error', text: string } | null }> = ({ message }) => {
        if (!message) return null;
        const baseClasses = 'text-sm p-3 rounded-md mt-4';
        const typeClasses = message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return <div className={`${baseClasses} ${typeClasses}`}>{message.text}</div>;
    };
    
    return (
        <div>
            <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-extrabold">My Profile</h1>
                    <p className="mt-2 text-lg text-gray-200">Manage your account details and password.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Profile Information */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-primary mb-4">Profile Information</h2>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" value={user?.username || ''} readOnly disabled className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary" />
                        </div>
                        <div className="text-right">
                            <button type="submit" disabled={profileLoading} className="bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                                {profileLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                        <MessageFeedback message={profileMessage} />
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-primary mb-4">Change Password</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary" />
                        </div>
                        <div className="text-right">
                            <button type="submit" disabled={passwordLoading} className="bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                        <MessageFeedback message={passwordMessage} />
                    </form>
                </div>

                {/* Admin Settings */}
                {user?.role === 'admin' && (
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border-t-4 border-accent">
                        <h2 className="text-2xl font-bold text-primary mb-4">Admin Settings</h2>
                        <form onSubmit={handleAdminSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Backup Recovery Email</label>
                                <input type="email" value={backupEmail} onChange={e => setBackupEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary" />
                                <p className="text-xs text-gray-500 mt-1">This email receives a notification when an admin password reset is requested.</p>
                            </div>
                            <div className="text-right">
                                <button type="submit" disabled={adminLoading} className="bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                                    {adminLoading ? 'Saving...' : 'Save Backup Email'}
                                </button>
                            </div>
                           <MessageFeedback message={adminMessage} />
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
