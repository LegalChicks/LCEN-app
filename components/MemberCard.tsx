import React from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface MemberCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: number, isSelected: boolean) => void;
}

const getStatusStyles = (status: User['status']) => {
    switch (status) {
        case 'Active': return { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-800' };
        case 'Pending Onboarding': return { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-800' };
        case 'Inactive': return { border: 'border-red-500', bg: 'bg-red-100', text: 'text-red-800' };
        default: return { border: 'border-gray-300', bg: 'bg-gray-100', text: 'text-gray-800' };
    }
};

const trainingStatusInfo: Record<User['trainingStatus'], { icon: string; color: string; }> = {
    'Completed Training': { icon: '📘', color: 'text-blue-800 bg-blue-100' },
    'Pending Orientation': { icon: '⏳', color: 'text-yellow-800 bg-yellow-100' },
    'Certified': { icon: '🎓', color: 'text-green-800 bg-green-100' },
};

const membershipLevelColor: Record<User['membershipLevel'], string> = {
    'Starter': 'text-gray-800 bg-gray-100',
    'Franchise': 'text-indigo-800 bg-indigo-100',
    'Cluster Leader': 'text-purple-800 bg-purple-100',
    'Trainee': 'text-cyan-800 bg-cyan-100'
};

const MemberCard: React.FC<MemberCardProps> = ({ user, isSelected, onSelect }) => {
    const navigate = useNavigate();
    const statusStyles = getStatusStyles(user.status);
    const tsInfo = trainingStatusInfo[user.trainingStatus];
    const mlColor = membershipLevelColor[user.membershipLevel];

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Navigate only if the click is not on the checkbox or its label
        const target = e.target as HTMLElement;
        if (target.closest('.selection-area')) {
            return;
        }
        navigate(`/admin/members/${user.username}`);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelect(user.id, e.target.checked);
    };

    return (
        <div 
            className={`bg-white rounded-xl shadow-lg border-l-4 ${statusStyles.border} overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
            onClick={handleCardClick}
        >
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <img className="h-16 w-16 rounded-full object-cover" src={user.profilePhotoUrl} alt={user.name} />
                        <div>
                            <h3 className="text-xl font-bold text-primary">{user.name}</h3>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                            <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                                {user.status}
                            </span>
                        </div>
                    </div>
                     <div className="selection-area p-1">
                        <input
                            type="checkbox"
                            className="h-5 w-5 text-secondary border-gray-300 rounded focus:ring-secondary"
                            checked={isSelected}
                            onChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
                        />
                    </div>
                </div>

                {/* Badges Section */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mlColor}`}>
                        🧑‍🌾 {user.membershipLevel}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tsInfo.color}`}>
                        {tsInfo.icon}
                        <span className="ml-1.5">{user.trainingStatus === 'Certified' ? 'NC II Certified' : user.trainingStatus}</span>
                    </span>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                         <div className="flex items-center space-x-2">
                           <span title="Farm Location">📍</span>
                           <span className="text-gray-600 truncate">{user.farmLocation}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span title="Last Active">🔄</span>
                            <span className="text-gray-600">{new Date(user.lastActivityDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span title="CDF Contribution">💰</span>
                            <span className="text-gray-600 font-semibold">₱{user.cdfContribution.toLocaleString()}</span>
                        </div>
                         <div className="flex items-center space-x-2">
                            <span title="Est. Profit">📈</span>
                            <span className="text-green-700 font-bold">₱{user.estimatedProfit.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-primary">Profit Cycle</span>
                        <span className="text-xs font-medium text-primary">{user.profitCycleCompletion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: `${user.profitCycleCompletion}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberCard;