import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from '../components/icons/UserIcon';

const UserProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { getUserByUsername } = useAuth();
    const userProfile = username ? getUserByUsername(username) : undefined;

    if (!userProfile) {
        return (
             <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-primary">User Not Found</h1>
                <p className="text-gray-600 mt-2">The profile you are looking for does not exist.</p>
                <Link to="/" className="mt-6 inline-block bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        )
    }

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
