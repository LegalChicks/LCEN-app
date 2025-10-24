import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, AuditLogEntry } from '../types';
import { Link } from 'react-router-dom';

type SortKey = keyof User;
const ITEMS_PER_PAGE = 5;

const AdminPage: React.FC = () => {
  const { getAllUsers, registerUser, deleteUser, getAuditLog, user: currentUser } = useAuth();
  
  const [userList, setUserList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // State for registration form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // State for deletion modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for audit log
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  
  useEffect(() => {
    if (getAllUsers && getAuditLog) {
        setUserList(getAllUsers());
        setAuditLog(getAuditLog());
    }
  }, [getAllUsers, getAuditLog]);

  const filteredAndSortedUsers = useMemo(() => {
    let filteredUsers = [...userList];

    if (roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    if (dateFilter) {
      filteredUsers = filteredUsers.filter(user => new Date(user.registrationDate) >= new Date(dateFilter));
    }
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      filteredUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filteredUsers;
  }, [userList, searchTerm, sortConfig, roleFilter, dateFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, dateFilter]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredAndSortedUsers]);
  
  const auditTotalPages = Math.ceil(auditLog.length / ITEMS_PER_PAGE);
  const paginatedAuditLog = useMemo(() => {
      const startIndex = (auditCurrentPage - 1) * ITEMS_PER_PAGE;
      return auditLog.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [auditCurrentPage, auditLog]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setRegistrationMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
    }
    if (!registerUser) return;

    setIsRegistering(true);
    setRegistrationMessage(null);
    try {
        await registerUser({ name, username, email, password });
        setRegistrationMessage({ type: 'success', text: `Member "${name}" registered successfully!` });
        setName(''); setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
        if (getAllUsers && getAuditLog) {
          setUserList(getAllUsers());
          setAuditLog(getAuditLog());
        }
    } catch (error) {
        setRegistrationMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to register member.' });
    } finally {
        setIsRegistering(false);
    }
  };
  
  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    setFeedbackMessage(null);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!userToDelete || !deleteUser) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      setFeedbackMessage({ type: 'success', text: `User "${userToDelete.name}" deleted successfully.` });
      if (getAllUsers && getAuditLog) {
        setUserList(getAllUsers());
        setAuditLog(getAuditLog());
      }
    } catch (error) {
       setFeedbackMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete user.' });
    } finally {
      setIsDeleting(false);
      handleCloseDeleteModal();
    }
  };

  const MessageFeedback: React.FC<{ message: { type: 'success' | 'error', text: string } | null }> = ({ message }) => {
      if (!message) return null;
      const baseClasses = 'text-sm p-3 rounded-md mt-4 text-center';
      const typeClasses = message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      return <div className={`${baseClasses} ${typeClasses}`}>{message.text}</div>;
  };
  
  const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm";
  const filterInputClass = "px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm";
  
  return (
    <div>
      <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-200">Manage users and platform settings.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-primary self-start">User Management</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={filterInputClass}>
                            <option value="all">All Roles</option><option value="admin">Admin</option><option value="member">Member</option>
                        </select>
                        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={filterInputClass} />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={filterInputClass} />
                    </div>
                </div>
                <MessageFeedback message={feedbackMessage} />
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => requestSort('name')} className="flex items-center space-x-1 focus:outline-none"><span>Name</span><span className="text-gray-400">{getSortIndicator('name')}</span></button></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => requestSort('username')} className="flex items-center space-x-1 focus:outline-none"><span>Username</span><span className="text-gray-400">{getSortIndicator('username')}</span></button></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => requestSort('role')} className="flex items-center space-x-1 focus:outline-none"><span>Role</span><span className="text-gray-400">{getSortIndicator('role')}</span></button></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => requestSort('email')} className="flex items-center space-x-1 focus:outline-none"><span>Email</span><span className="text-gray-400">{getSortIndicator('email')}</span></button></th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                  <Link to={`/users/${user.username}`} className="text-secondary hover:text-accent">View</Link>
                                  {currentUser?.id !== user.id && (<button onClick={() => handleOpenDeleteModal(user)} className="text-red-600 hover:text-red-900">Delete</button>)}
                                </td>
                            </tr>))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && <div className="flex items-center justify-between mt-6"><button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Previous</button><span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Next</button></div>}
            </div>
            
            <div className="lg:col-span-1"><div className="bg-white p-8 rounded-xl shadow-lg sticky top-24"><h2 className="text-2xl font-bold text-primary mb-6">Register New Member</h2><form onSubmit={handleRegisterSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClass} /></div><div><label className="block text-sm font-medium text-gray-700">Username</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} required className={inputClass} /></div><div><label className="block text-sm font-medium text-gray-700">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} /></div><div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} /></div><div><label className="block text-sm font-medium text-gray-700">Confirm Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputClass} /></div><div className="pt-2"><button type="submit" disabled={isRegistering} className="w-full bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">{isRegistering ? 'Registering...' : 'Register Member'}</button></div><MessageFeedback message={registrationMessage} /></form></div></div>
        </div>
        
        <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-primary mb-6">Administrator Audit Log</h2>
            <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{paginatedAuditLog.map((log) => (<tr key={log.id}><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.adminUsername}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === 'DELETE_USER' ? 'bg-red-100 text-red-800' : log.action === 'UPDATE_USER' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{log.action.replace('_', ' ')}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.details}</td></tr>))}</tbody></table></div>
            {auditTotalPages > 1 && <div className="flex items-center justify-between mt-6"><button onClick={() => setAuditCurrentPage(p => Math.max(p - 1, 1))} disabled={auditCurrentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Previous</button><span className="text-sm text-gray-700">Page {auditCurrentPage} of {auditTotalPages}</span><button onClick={() => setAuditCurrentPage(p => Math.min(p + 1, auditTotalPages))} disabled={auditCurrentPage === auditTotalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Next</button></div>}
        </div>
      </div>
      
      {isDeleteModalOpen && userToDelete && (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"><div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full"><h3 className="text-lg font-bold text-red-700">Confirm Deletion</h3><p className="mt-2 text-sm text-gray-600">Are you sure you want to delete the user <strong>{userToDelete.name}</strong> (@{userToDelete.username})? This action cannot be undone.</p><div className="mt-6 flex justify-end space-x-3"><button onClick={handleCloseDeleteModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button><button onClick={handleConfirmDelete} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:bg-red-300">{isDeleting ? 'Deleting...' : 'Delete User'}</button></div></div></div>)}
    </div>
  );
};

export default AdminPage;
