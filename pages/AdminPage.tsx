import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import MemberCard from '../components/MemberCard';
import { ExportIcon } from '../components/icons/ExportIcon';
import { SendIcon } from '../components/icons/SendIcon';

type SortKey = 'name' | 'registrationDate' | 'lastActivityDate' | 'estimatedProfit';

const AdminPage: React.FC = () => {
  const { getAllUsers, user: currentUser } = useAuth();
  
  const [userList, setUserList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Batch actions
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (getAllUsers) {
        setUserList(getAllUsers());
    }
  }, [getAllUsers, currentUser]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(userList.map(u => u.farmLocation).filter(loc => loc !== 'LCEN HQ'));
    return Array.from(locations).sort();
  }, [userList]);

  const filteredAndSortedUsers = useMemo(() => {
    let filteredUsers = userList.filter(user => user.id !== currentUser?.id); // Exclude current admin

    if (statusFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }
    if (levelFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.membershipLevel === levelFilter);
    }
    if (locationFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.farmLocation === locationFilter);
    }
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.farmLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filteredUsers.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue > bValue ? 1 : -1;
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return filteredUsers;
  }, [userList, searchTerm, sortConfig, statusFilter, levelFilter, locationFilter, currentUser]);
  
  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectUser = (userId: number, isSelected: boolean) => {
    setSelectedUserIds(prev => {
        const newSet = new Set(prev);
        if (isSelected) {
            newSet.add(userId);
        } else {
            newSet.delete(userId);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        const allIds = new Set(filteredAndSortedUsers.map(u => u.id));
        setSelectedUserIds(allIds);
    } else {
        setSelectedUserIds(new Set());
    }
  };
  
  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleSendMessage = () => {
    // In a real app, this would call an API.
    showFeedback('success', `Message sent to ${selectedUserIds.size} members.`);
    setIsMessageModalOpen(false);
    setMessageContent('');
    setSelectedUserIds(new Set());
  };

  const exportToCSV = (usersToExport: User[]) => {
    if(usersToExport.length === 0) {
        showFeedback('error', 'No members to export.');
        return;
    }
    const headers = ['ID', 'Username', 'Name', 'Email', 'Location', 'Membership Level', 'Status', 'Joined Date', 'Last Activity', 'Est. Profit'];
    const rows = usersToExport.map(user => 
      [
        user.id,
        user.username,
        `"${user.name.replace(/"/g, '""')}"`,
        user.email,
        user.farmLocation,
        user.membershipLevel,
        user.status,
        new Date(user.registrationDate).toLocaleDateString(),
        new Date(user.lastActivityDate).toLocaleDateString(),
        user.estimatedProfit.toFixed(2)
      ].join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lcen_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('success', 'Member data exported successfully.');
  };

  const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm bg-white";
  const selectClass = `${inputClass} appearance-none`;

  return (
    <div className="overflow-y-auto h-full">
      <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold md:text-4xl">Member Management Dashboard</h1>
          <p className="mt-2 text-lg text-gray-200">Oversee, manage, and engage with all LCEN members.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Search by Name, Username, or Location</label>
                    <input type="text" placeholder="Start typing to search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Filter by Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
                        <option value="all">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Pending Onboarding">Pending Onboarding</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Filter by Membership</label>
                    <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className={selectClass}>
                        <option value="all">All Levels</option>
                        <option value="Starter">Starter</option>
                        <option value="Franchise">Franchise</option>
                        <option value="Cluster Leader">Cluster Leader</option>
                        <option value="Trainee">Trainee</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Filter by Location</label>
                    <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className={selectClass}>
                        <option value="all">All Locations</option>
                        {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                     <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setLevelFilter('all'); setLocationFilter('all'); }} className="text-sm text-gray-600 hover:text-primary font-medium">Clear All Filters</button>
                </div>
            </div>
        </div>

        {/* Batch Actions & Totals */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
                <input type="checkbox" onChange={handleSelectAll} checked={selectedUserIds.size > 0 && selectedUserIds.size === filteredAndSortedUsers.length} className="h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary" title="Select/Deselect All"/>
                {selectedUserIds.size > 0 ? (
                     <div className="flex items-center space-x-2 bg-secondary/10 p-2 rounded-lg">
                        <span className="text-sm font-semibold text-secondary">{selectedUserIds.size} selected</span>
                        <button onClick={() => setIsMessageModalOpen(true)} className="flex items-center space-x-1 text-sm bg-secondary text-white font-bold py-1 px-3 rounded-md hover:bg-accent hover:text-primary transition-colors"><SendIcon className="h-4 w-4"/><span>Message</span></button>
                        <button onClick={() => exportToCSV(userList.filter(u => selectedUserIds.has(u.id)))} className="flex items-center space-x-1 text-sm bg-gray-600 text-white font-bold py-1 px-3 rounded-md hover:bg-gray-800 transition-colors"><ExportIcon className="h-4 w-4"/><span>Export</span></button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600 font-semibold">{filteredAndSortedUsers.length} members found</p>
                )}
            </div>
             <button onClick={() => exportToCSV(filteredAndSortedUsers)} className="flex items-center space-x-2 text-sm bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-secondary transition-colors"><ExportIcon className="h-5 w-5"/><span>Export All Filtered</span></button>
        </div>

        {filteredAndSortedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedUsers.map(user => (
                    <MemberCard 
                        key={user.id} 
                        user={user}
                        isSelected={selectedUserIds.has(user.id)}
                        onSelect={handleSelectUser}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-md">
                <p className="text-xl font-semibold text-gray-700">No members match your criteria.</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
            </div>
        )}
      </div>

      {isMessageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-lg font-bold text-primary">Send Bulk Message</h3>
            <p className="mt-2 text-sm text-gray-600">This message will be sent to the <strong>{selectedUserIds.size} selected members</strong>. In a real app, this would integrate with an SMS or email service.</p>
            <textarea value={messageContent} onChange={e => setMessageContent(e.target.value)} rows={5} placeholder="Type your announcement or reminder here..." className="mt-4 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"/>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsMessageModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
              <button onClick={handleSendMessage} disabled={!messageContent.trim()} className="px-4 py-2 text-sm font-medium text-white bg-secondary border border-transparent rounded-md hover:bg-accent hover:text-primary disabled:bg-gray-400">Send Message</button>
            </div>
          </div>
        </div>
      )}
      
      {feedbackMessage && (
        <div className={`fixed bottom-5 right-5 text-white px-6 py-3 rounded-lg shadow-lg z-50 ${feedbackMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {feedbackMessage.text}
        </div>
      )}
    </div>
  );
};

export default AdminPage;