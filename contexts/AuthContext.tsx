

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuditLogEntry, Reminder, OpportunityPackage, TrainingSession, FeedOrder, MarketStock, MarketStockType, ChatSession, ChatMessage } from '../types';

// =================================================================================================
// IMPORTANT: MOCK DATABASE & AUTHENTICATION
// This file uses mock data stored in localStorage for demonstration purposes.
// In a real-world application, NEVER store plain-text passwords.
// This entire file should be replaced with a secure backend authentication and database service.
// =================================================================================================
// This is the initial mock database. Data will be persisted in localStorage.
const MOCK_USERS_INITIAL: (User & { password?: string })[] = [
  { 
    id: 1, 
    username: 'farmer_juan', 
    password: 'password123', 
    name: 'Juan dela Cruz', 
    email: 'juan.delacruz@example.com', 
    role: 'member', 
    registrationDate: '2023-10-26T10:00:00Z', 
    phone: '09171234567',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1597232013227-3ce9c238435a?q=80&w=800&auto=format&fit=crop',
    farmLocation: 'Tuguegarao City',
    membershipLevel: 'Franchise',
    status: 'Active',
    lastActivityDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    profitCycleCompletion: 75,
    cdfContribution: 1250.00,
    trainingStatus: 'Certified',
    estimatedProfit: 15200.50,
    milestones: [
      { name: 'Joined', date: '2023-10-26T10:00:00Z', status: 'complete' },
      { name: 'Trained', date: '2023-10-27T14:00:00Z', status: 'complete' },
      { name: 'Onboarded', date: '2023-10-28T11:00:00Z', status: 'complete' },
      { name: 'First Sale', date: '2023-12-05T10:00:00Z', status: 'complete' },
      { name: 'Certified', date: '2024-02-15T09:00:00Z', status: 'complete' },
    ]
  },
  { 
    id: 2, 
    username: 'admin', 
    password: 'adminpassword', 
    name: 'Admin User', 
    email: 'admin@lcen.com', 
    role: 'admin', 
    registrationDate: '2023-10-25T09:00:00Z', 
    phone: '09209876543',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop',
    farmLocation: 'LCEN HQ',
    membershipLevel: 'Cluster Leader',
    status: 'Active',
    lastActivityDate: new Date().toISOString(),
    profitCycleCompletion: 100,
    cdfContribution: 0,
    trainingStatus: 'Certified',
    estimatedProfit: 0,
    milestones: []
  },
  { 
    id: 3, 
    username: 'maria_santos', 
    password: 'password123', 
    name: 'Maria Santos', 
    email: 'maria.santos@example.com', 
    role: 'member', 
    registrationDate: '2024-01-15T14:30:00Z', 
    phone: '09181112233',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1620556752372-f80b938574a2?q=80&w=800&auto=format&fit=crop',
    farmLocation: 'Solana',
    membershipLevel: 'Starter',
    status: 'Pending Onboarding',
    lastActivityDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    profitCycleCompletion: 15,
    cdfContribution: 250.00,
    trainingStatus: 'Pending Orientation',
    estimatedProfit: 0,
    milestones: [
      { name: 'Joined', date: '2024-01-15T14:30:00Z', status: 'complete' },
      { name: 'Trained', date: '2024-01-18T14:00:00Z', status: 'complete' },
      { name: 'Onboarded', date: '', status: 'pending' },
      { name: 'First Sale', date: '', status: 'pending' },
      { name: 'Certified', date: '', status: 'pending' },
    ]
  },
  {
    id: 4, 
    username: 'pedro_penduko', 
    password: 'password123', 
    name: 'Pedro Penduko', 
    email: 'pedro.p@example.com', 
    role: 'member', 
    registrationDate: '2023-12-01T11:00:00Z', 
    phone: '09215556677',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1617957223223-5e3e1f5f2b3a?q=80&w=800&auto=format&fit=crop',
    farmLocation: 'Enrile',
    membershipLevel: 'Starter',
    status: 'Inactive',
    lastActivityDate: new Date(Date.now() - 86400000 * 40).toISOString(), // 40 days ago
    profitCycleCompletion: 90,
    cdfContribution: 800.00,
    trainingStatus: 'Completed Training',
    estimatedProfit: 8500.00,
    milestones: [
      { name: 'Joined', date: '2023-12-01T11:00:00Z', status: 'complete' },
      { name: 'Trained', date: '2023-12-03T14:00:00Z', status: 'complete' },
      { name: 'Onboarded', date: '2023-12-04T09:00:00Z', status: 'complete' },
      { name: 'First Sale', date: '2024-01-20T10:00:00Z', status: 'complete' },
      { name: 'Certified', date: '', status: 'pending' },
    ]
  },
];

const MOCK_AUDIT_LOG_INITIAL: AuditLogEntry[] = [
    { id: 1, timestamp: new Date().toISOString(), actorUsername: 'system', action: 'REGISTER_USER', details: 'Registered user: admin' }
];

const MOCK_REMINDERS_INITIAL: Reminder[] = [
    { id: 1, userId: 1, title: 'Check chick water levels', description: 'Ensure all drinkers are full and clean.', dueDate: new Date(Date.now() - 3600000).toISOString(), isCompleted: true }, // 1 hour ago, completed
    { id: 2, userId: 1, title: 'Administer weekly vitamins', description: 'Mix vitamins in the morning water.', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), isCompleted: false }, // In 2 days
    { id: 3, userId: 3, title: 'Clean the coop', description: '', dueDate: new Date(Date.now() + 86400000).toISOString(), isCompleted: false }, // Tomorrow
    { id: 4, userId: 1, title: 'Order new batch of feeds', description: 'Running low on grower pellets.', dueDate: new Date(Date.now() - 120000).toISOString(), isCompleted: false }, // 2 mins ago, due
];

const MOCK_PACKAGES_INITIAL: OpportunityPackage[] = [
  { id: 1, userId: 1, name: 'RIR Layer Starter Kit', description: 'Includes 50 RIR chicks, starter feeds, and basic vitamins.', dateAvailed: '2023-10-28T11:00:00Z', status: 'Active', cost: 5000 },
  { id: 2, userId: 3, name: 'Australorp Broiler Package', description: 'Includes 100 Australorp chicks and a brooding guide.', dateAvailed: '2023-11-20T09:30:00Z', status: 'Completed', cost: 8500 },
];

const MOCK_TRAININGS_INITIAL: TrainingSession[] = [
  { id: 1, userId: 1, topic: 'Poultry Raising 101', date: '2023-10-27T14:00:00Z', status: 'Completed' },
  { id: 2, userId: 1, topic: 'Advanced Disease Control', date: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'Scheduled' },
  { id: 3, userId: 3, topic: 'Poultry Raising 101', date: '2023-11-18T14:00:00Z', status: 'Completed' },
];

const MOCK_FEED_ORDERS_INITIAL: FeedOrder[] = [
  { id: 1, userId: 1, product: 'Grower Pellets', quantity: '10 bags', deliveryDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'Scheduled' },
  { id: 2, userId: 1, product: 'Starter Crumble', quantity: '5 bags', deliveryDate: '2023-11-15T10:00:00Z', status: 'Delivered' },
  { id: 3, userId: 3, product: 'Finisher Pellets', quantity: '20 bags', deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'Scheduled' },
];

const MOCK_MARKET_STOCKS_INITIAL: MarketStock[] = [
  { id: 1, userId: 1, type: 'table_eggs', quantity: 120, price: 8, dateListed: new Date().toISOString() },
  { id: 2, userId: 3, type: 'live_rir', quantity: 15, price: 350, dateListed: new Date(Date.now() - 86400000 * 2).toISOString() },
];

const MOCK_SESSIONS_INITIAL: ChatSession[] = [
    {
        id: 1,
        userId: 1,
        title: 'Troubleshooting chick illness...',
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
        messages: [
            { role: 'model', text: 'Hi Juan dela Cruz! How can I help?' },
            { role: 'user', text: 'Some of my new chicks seem lethargic and are not eating. What could be wrong?' },
            { role: 'model', text: 'Lethargy in new chicks can be serious. Let\'s check a few things. How old are they, and what is the temperature in the brooder?' },
        ]
    },
     {
        id: 2,
        userId: 1,
        title: 'Best feed for RIR layers...',
        lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString(),
        messages: [
            { role: 'model', text: 'Welcome back! What can I help you with?' },
            { role: 'user', text: 'What is the best feed for my RIR hens that are about to start laying eggs?' },
        ]
    }
];


// Helper function to get data from localStorage or initialize it
const getStoredData = <T,>(key: string, initialData: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
    }
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
};

// In a real app, this would also be stored securely on a server.
let ADMIN_BACKUP_EMAIL = 'backup.admin@lcen.com';

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface AdminUpdateData {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { name: string; email: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  adminBackupEmail: string;
  updateAdminBackupEmail: (email: string) => Promise<void>;
  getUserByUsername: (username: string) => User | undefined;
  // Admin-specific functions
  getAllUsers?: () => User[];
  registerUser?: (data: RegisterData) => Promise<void>;
  adminUpdateUser?: (data: AdminUpdateData) => Promise<User>;
  deleteUser?: (userId: number) => Promise<void>;
  getAuditLog?: () => AuditLogEntry[];
  getPackagesForUser?: (userId: number) => OpportunityPackage[];
  getTrainingsForUser?: (userId: number) => TrainingSession[];
  getFeedOrdersForUser?: (userId: number) => FeedOrder[];
  getMarketStocksForUser?: (userId: number) => MarketStock[];
  // Member features
  getReminders?: () => Reminder[];
  addReminder?: (data: { title: string; description?: string; dueDate: string; }) => Promise<Reminder>;
  updateReminderStatus?: (reminderId: number, isCompleted: boolean) => Promise<void>;
  deleteReminder?: (reminderId: number) => Promise<void>;
  getMyMarketStocks?: () => MarketStock[];
  addMarketStock?: (data: { type: MarketStockType; quantity: number; price: number; }) => Promise<MarketStock>;
  deleteMarketStock?: (stockId: number) => Promise<void>;
  // Chat session features
  getChatSessions?: () => ChatSession[];
  getChatSession?: (id: number) => ChatSession | undefined;
  saveChatSession?: (sessionData: { id: number | null, title: string, messages: ChatMessage[] }) => Promise<ChatSession>;
  deleteChatSession?: (id: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // All data is now stateful and persisted
  const [users, setUsers] = useState<(User & { password?: string })[]>(() => getStoredData('lcen-users', MOCK_USERS_INITIAL));
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => getStoredData('lcen-audit-log', MOCK_AUDIT_LOG_INITIAL));
  const [reminders, setReminders] = useState<Reminder[]>(() => getStoredData('lcen-reminders', MOCK_REMINDERS_INITIAL));
  const [marketStocks, setMarketStocks] = useState<MarketStock[]>(() => getStoredData('lcen-market-stocks', MOCK_MARKET_STOCKS_INITIAL));
  const [sessions, setSessions] = useState<ChatSession[]>(() => getStoredData('lcen-sessions', MOCK_SESSIONS_INITIAL));
  
  // Static data can remain as is unless it needs to be modified.
  const MOCK_PACKAGES = MOCK_PACKAGES_INITIAL;
  const MOCK_TRAININGS = MOCK_TRAININGS_INITIAL;
  const MOCK_FEED_ORDERS = MOCK_FEED_ORDERS_INITIAL;

  // Persist state changes to localStorage
  useEffect(() => { localStorage.setItem('lcen-users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('lcen-audit-log', JSON.stringify(auditLog)); }, [auditLog]);
  useEffect(() => { localStorage.setItem('lcen-reminders', JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { localStorage.setItem('lcen-market-stocks', JSON.stringify(marketStocks)); }, [marketStocks]);
  useEffect(() => { localStorage.setItem('lcen-sessions', JSON.stringify(sessions)); }, [sessions]);


  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('lcen-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const logActivity = (actorUsername: string, action: AuditLogEntry['action'], details: string) => {
    const newLogEntry: AuditLogEntry = {
        id: auditLog.length > 0 ? Math.max(...auditLog.map(log => log.id)) + 1 : 1,
        timestamp: new Date().toISOString(),
        actorUsername,
        action,
        details,
    };
    setAuditLog(prevLog => [newLogEntry, ...prevLog]);
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => { // Simulate network delay
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
          const { password: _password, ...userToStore } = foundUser;
          setUser(userToStore);
          localStorage.setItem('lcen-user', JSON.stringify(userToStore));
          logActivity(userToStore.username, 'LOGIN', 'User signed in successfully.');
          resolve(userToStore);
        } else {
          resolve(null);
        }
      }, 500);
    });
  };

  const logout = () => {
    if (user) {
        logActivity(user.username, 'LOGOUT', 'User signed out successfully.');
    }
    setUser(null);
    localStorage.removeItem('lcen-user');
  };

  const forgotPassword = async (email: string): Promise<void> => {
     // In a real app, this would trigger a backend service to send an email.
    return Promise.resolve();
  };
  
  const updateUserProfile = async (data: { name: string, email: string }): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      
      setUsers(prevUsers => {
          const userIndex = prevUsers.findIndex(u => u.id === user.id);
          if (userIndex > -1) {
              const originalUser = prevUsers[userIndex];
              const actingAdmin = users.find(u => u.id === user.id && u.role === 'admin');
              
              let changes: string[] = [];
              if (originalUser.name !== data.name) {
                changes.push(`name from "${originalUser.name}" to "${data.name}"`);
              }
              if (originalUser.email !== data.email) {
                changes.push(`email from "${originalUser.email}" to "${data.email}"`);
              }

              if (changes.length > 0) {
                const logMessage = `Updated their profile: ${changes.join(', ')}.`;
                logActivity(user.username, 'UPDATE_USER', logMessage);
                
                if (actingAdmin) {
                    // This case is handled in adminUpdateUser, but added for completeness if an admin uses their own profile page.
                     const adminUser = users.find(u => u.role === 'admin');
                }

              }
              
              const newUsers = [...prevUsers];
              newUsers[userIndex] = { ...newUsers[userIndex], ...data };
              const updatedUser = { ...user, ...data };
              setUser(updatedUser);
              localStorage.setItem('lcen-user', JSON.stringify(updatedUser));
              return newUsers;
          }
          throw new Error("User not found in mock database.");
      });
  };
  
  const changePassword = async (data: { currentPassword: string, newPassword: string }): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      setUsers(prevUsers => {
          const userIndex = prevUsers.findIndex(u => u.id === user.id);
          if (userIndex > -1) {
              if (prevUsers[userIndex].password === data.currentPassword) {
                  const newUsers = [...prevUsers];
                  newUsers[userIndex].password = data.newPassword;
                  logActivity(user.username, 'CHANGE_PASSWORD', 'User changed their password.');
                  return newUsers;
              } else {
                  throw new Error("Current password does not match.");
              }
          } else {
              throw new Error("User not found in mock database.");
          }
      });
  };
  
  const updateAdminBackupEmail = async (email: string): Promise<void> => {
      if (user?.role !== 'admin') throw new Error("Only admins can perform this action.");
      ADMIN_BACKUP_EMAIL = email;
  };
  
  const logAdminAction = (action: AuditLogEntry['action'], details: string) => {
    if (!user || user.role !== 'admin') return;
    logActivity(user.username, action, details);
  };
  
  const registerUser = async (data: RegisterData): Promise<void> => {
      if (user?.role !== 'admin') {
          throw new Error("Only admins can register new users.");
      }
      return new Promise((resolve, reject) => {
          setTimeout(() => { // Simulate network delay
              const usernameExists = users.some(u => u.username.toLowerCase() === data.username.toLowerCase());
              if (usernameExists) {
                  return reject(new Error("Username already exists."));
              }
              const emailExists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
              if (emailExists) {
                  return reject(new Error("Email is already in use."));
              }

              const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
              const newUser: User & { password?: string } = {
                  id: newId,
                  name: data.name,
                  username: data.username,
                  email: data.email,
                  password: data.password,
                  role: 'member',
                  registrationDate: new Date().toISOString(),
                  farmLocation: 'Not Set',
                  membershipLevel: 'Trainee',
                  status: 'Pending Onboarding',
                  lastActivityDate: new Date().toISOString(),
                  profitCycleCompletion: 0,
                  cdfContribution: 0,
                  trainingStatus: 'Pending Orientation',
                  estimatedProfit: 0,
                  milestones: [
                    { name: 'Joined', date: new Date().toISOString(), status: 'complete' },
                    { name: 'Trained', date: '', status: 'pending' },
                    { name: 'Onboarded', date: '', status: 'pending' },
                    { name: 'First Sale', date: '', status: 'pending' },
                    { name: 'Certified', date: '', status: 'pending' },
                  ]
              };

              setUsers(prev => [...prev, newUser]);
              logAdminAction('REGISTER_USER', `Registered new member: ${data.username}`);
              resolve();
          }, 500);
      });
  };

  const adminUpdateUser = async (data: AdminUpdateData): Promise<User> => {
    if (user?.role !== 'admin') {
        throw new Error("Only admins can perform this action.");
    }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let updatedUserForReturn: User;
            setUsers(prevUsers => {
                const userIndex = prevUsers.findIndex(u => u.id === data.id);
                if (userIndex === -1) {
                    reject(new Error("User not found."));
                    return prevUsers;
                }
                
                const emailExists = prevUsers.some(u => u.email.toLowerCase() === data.email.toLowerCase() && u.id !== data.id);
                if (emailExists) {
                    reject(new Error("Email is already in use by another account."));
                    return prevUsers;
                }

                const originalUser = prevUsers[userIndex];
                const adminCount = prevUsers.filter(u => u.role === 'admin').length;
                if (originalUser.role === 'admin' && data.role === 'member' && adminCount <= 1) {
                    reject(new Error("Cannot remove the last administrator."));
                    return prevUsers;
                }
                
                let changes: string[] = [];
                if (originalUser.name !== data.name) {
                    changes.push(`name from "${originalUser.name}" to "${data.name}"`);
                }
                if (originalUser.email !== data.email) {
                    changes.push(`email from "${originalUser.email}" to "${data.email}"`);
                }
                if (originalUser.role !== data.role) {
                    changes.push(`role from "${originalUser.role}" to "${data.role}"`);
                }

                const newUsers = [...prevUsers];
                newUsers[userIndex] = { ...newUsers[userIndex], ...data };
                const logMessage = `Updated user ${originalUser.username}: ${changes.join(', ')}.`;

                if (changes.length > 0) {
                  logAdminAction('UPDATE_USER', logMessage);
                  
                }
                const { password: _p, ...updatedUser } = newUsers[userIndex];
                updatedUserForReturn = updatedUser;
                resolve(updatedUser);
                return newUsers;
            });
        }, 500);
    });
  };

  const deleteUser = async (userId: number): Promise<void> => {
    if (user?.role !== 'admin') {
        throw new Error("Only admins can perform this action.");
    }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            setUsers(prevUsers => {
                const userIndex = prevUsers.findIndex(u => u.id === userId);
                if (userIndex === -1) {
                    reject(new Error("User not found."));
                    return prevUsers;
                }

                const userToDelete = prevUsers[userIndex];
                if (userToDelete.id === user.id) {
                    reject(new Error("You cannot delete your own account."));
                    return prevUsers;
                }

                const adminCount = prevUsers.filter(u => u.role === 'admin').length;
                if (userToDelete.role === 'admin' && adminCount <= 1) {
                    reject(new Error("Cannot delete the last administrator account."));
                    return prevUsers;
                }
                
                logAdminAction('DELETE_USER', `Deleted user: ${userToDelete.username} (ID: ${userToDelete.id})`);
                resolve();
                return prevUsers.filter(u => u.id !== userId);
            });
        }, 500);
    });
  };

  const getUserByUsername = (username: string): User | undefined => {
    const foundUser = users.find(u => u.username === username);
    if (foundUser) {
        const { password: _password, ...publicProfile } = foundUser;
        return publicProfile;
    }
    return undefined;
  };
  
  const getAllUsers = (): User[] => {
      if (user?.role !== 'admin') {
          console.warn("Attempted to get all users without admin privileges.");
          return [];
      }
      return users.map(u => {
          const { password: _password, ...publicProfile } = u;
          return publicProfile;
      });
  };

  const getAuditLog = (): AuditLogEntry[] => {
    if (user?.role !== 'admin') {
        return [];
    }
    return [...auditLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getReminders = (): Reminder[] => {
      if (!user) return [];
      return reminders.filter(r => r.userId === user.id);
  };

  const addReminder = async (data: { title: string; description?: string; dueDate: string; }): Promise<Reminder> => {
      if (!user) throw new Error("Not authenticated");
      return new Promise(resolve => {
          setTimeout(() => {
              const newReminder: Reminder = {
                  ...data,
                  id: reminders.length > 0 ? Math.max(...reminders.map(r => r.id)) + 1 : 1,
                  userId: user.id,
                  isCompleted: false,
              };
              setReminders(prev => [...prev, newReminder].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
              resolve(newReminder);
          }, 300);
      });
  };

  const updateReminderStatus = async (reminderId: number, isCompleted: boolean): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      setReminders(prev => prev.map(r => r.id === reminderId && r.userId === user.id ? { ...r, isCompleted } : r));
  };
  
  const deleteReminder = async (reminderId: number): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      setReminders(prev => prev.filter(r => !(r.id === reminderId && r.userId === user.id)));
  };
  
  // Admin-only data getters
  const getPackagesForUser = (userId: number) => MOCK_PACKAGES.filter(p => p.userId === userId);
  const getTrainingsForUser = (userId: number) => MOCK_TRAININGS.filter(t => t.userId === userId);
  const getFeedOrdersForUser = (userId: number) => MOCK_FEED_ORDERS.filter(o => o.userId === userId);
  const getMarketStocksForUser = (userId: number) => marketStocks.filter(s => s.userId === userId);

  // Member-specific marketplace functions
  const getMyMarketStocks = () => user ? marketStocks.filter(s => s.userId === user.id) : [];

  const addMarketStock = async (data: { type: MarketStockType; quantity: number; price: number; }): Promise<MarketStock> => {
      if (!user) throw new Error("Not authenticated");
      return new Promise(resolve => {
          setTimeout(() => {
              const newStock: MarketStock = {
                  ...data,
                  id: marketStocks.length > 0 ? Math.max(...marketStocks.map(s => s.id)) + 1 : 1,
                  userId: user.id,
                  dateListed: new Date().toISOString(),
              };
              setMarketStocks(prev => [...prev, newStock].sort((a,b) => new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime()));
              resolve(newStock);
          }, 300);
      });
  };

  const deleteMarketStock = async (stockId: number): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      setMarketStocks(prev => prev.filter(s => !(s.id === stockId && s.userId === user.id)));
  };

  // Chat Session Functions
  const getChatSessions = (): ChatSession[] => {
      if (!user) return [];
      return sessions
        .filter(s => s.userId === user.id)
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  };

  const getChatSession = (id: number): ChatSession | undefined => {
      if (!user) return undefined;
      return sessions.find(s => s.id === id && s.userId === user.id);
  };

  const saveChatSession = async (sessionData: { id: number | null, title: string, messages: ChatMessage[] }): Promise<ChatSession> => {
      if (!user) throw new Error("Not authenticated");

      return new Promise(resolve => {
          setTimeout(() => {
              let updatedSession: ChatSession;
              if (sessionData.id === null) { // Create new session
                  updatedSession = {
                      ...sessionData,
                      id: sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1,
                      userId: user.id,
                      lastUpdated: new Date().toISOString(),
                  };
                  setSessions(prev => [updatedSession, ...prev]);
              } else { // Update existing session
                  updatedSession = {
                      id: sessionData.id,
                      userId: user.id,
                      title: sessionData.title,
                      messages: sessionData.messages,
                      lastUpdated: new Date().toISOString(),
                  };
                  setSessions(prev => prev.map(s => s.id === sessionData.id ? updatedSession : s));
              }
              resolve(updatedSession);
          }, 300);
      });
  };
  
  const deleteChatSession = async (id: number): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      setSessions(prev => prev.filter(s => !(s.id === id && s.userId === user.id)));
  };

  // Role-Based Access Control (RBAC) is implemented here.
  // The context value conditionally includes administrative functions
  // only when the logged-in user has the 'admin' role. This prevents
  // members from accessing sensitive data or performing restricted actions.
  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    forgotPassword,
    updateUserProfile,
    changePassword,
    adminBackupEmail: ADMIN_BACKUP_EMAIL,
    updateAdminBackupEmail,
    getUserByUsername,
    ...(user?.role === 'admin' && { 
        getAllUsers, 
        registerUser, 
        adminUpdateUser, 
        deleteUser, 
        getAuditLog,
        getPackagesForUser,
        getTrainingsForUser,
        getFeedOrdersForUser,
        getMarketStocksForUser,
    }),
    ...(user && { 
        getReminders, 
        addReminder, 
        updateReminderStatus, 
        deleteReminder,
        getMyMarketStocks,
        addMarketStock,
        deleteMarketStock,
        getChatSessions,
        getChatSession,
        saveChatSession,
        deleteChatSession,
    })
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};