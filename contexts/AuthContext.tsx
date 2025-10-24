import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuditLogEntry, Reminder } from '../types';

// This is a mock database. In a real application, this would be an API call.
const MOCK_USERS: (User & { password?: string })[] = [
  { id: 1, username: 'farmer_juan', password: 'password123', name: 'Juan dela Cruz', email: 'juan.delacruz@example.com', role: 'member', registrationDate: '2023-10-26T10:00:00Z' },
  { id: 2, username: 'admin', password: 'adminpassword', name: 'Admin User', email: 'admin@lcen.com', role: 'admin', registrationDate: '2023-10-25T09:00:00Z' },
  { id: 3, username: 'maria_santos', password: 'password123', name: 'Maria Santos', email: 'maria.santos@example.com', role: 'member', registrationDate: '2023-11-15T14:30:00Z' },
];

const MOCK_AUDIT_LOG: AuditLogEntry[] = [
    { id: 1, timestamp: new Date().toISOString(), adminUsername: 'system', action: 'REGISTER_USER', details: 'Registered user: admin' }
];

const MOCK_REMINDERS: Reminder[] = [
    { id: 1, userId: 1, title: 'Check chick water levels', description: 'Ensure all drinkers are full and clean.', dueDate: new Date(Date.now() - 3600000).toISOString(), isCompleted: true }, // 1 hour ago, completed
    { id: 2, userId: 1, title: 'Administer weekly vitamins', description: 'Mix vitamins in the morning water.', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), isCompleted: false }, // In 2 days
    { id: 3, userId: 3, title: 'Clean the coop', description: '', dueDate: new Date(Date.now() + 86400000).toISOString(), isCompleted: false }, // Tomorrow
    { id: 4, userId: 1, title: 'Order new batch of feeds', description: 'Running low on grower pellets.', dueDate: new Date(Date.now() - 120000).toISOString(), isCompleted: false }, // 2 mins ago, due
];


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
  // Member features
  getReminders?: () => Reminder[];
  addReminder?: (data: { title: string; description?: string; dueDate: string; }) => Promise<Reminder>;
  updateReminderStatus?: (reminderId: number, isCompleted: boolean) => Promise<void>;
  deleteReminder?: (reminderId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminBackupEmail, setAdminBackupEmail] = useState(ADMIN_BACKUP_EMAIL);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOG);
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);


  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('lcen-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // In a real app, you'd validate this token/user with a server
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => { // Simulate network delay
        const foundUser = MOCK_USERS.find(u => u.username === username && u.password === password);
        if (foundUser) {
          const { password: _password, ...userToStore } = foundUser;
          setUser(userToStore);
          localStorage.setItem('lcen-user', JSON.stringify(userToStore));
          resolve(userToStore);
        } else {
          resolve(null);
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lcen-user');
  };

  const forgotPassword = async (email: string): Promise<void> => {
     // In a real app, this would trigger a backend service to send an email.
    console.log(`Password reset requested for email: ${email}`);
    // If it's the admin's email, "notify" the backup.
    const adminUser = MOCK_USERS.find(u => u.role === 'admin');
    if(adminUser?.email === email) {
        console.log(`Admin password reset requested. Notifying backup email: ${adminBackupEmail}`);
    }
    return Promise.resolve();
  };
  
  const updateUserProfile = async (data: { name: string, email: string }): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      const userIndex = MOCK_USERS.findIndex(u => u.id === user.id);
      if (userIndex > -1) {
          MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...data };
          const updatedUser = { ...user, ...data };
          setUser(updatedUser);
          localStorage.setItem('lcen-user', JSON.stringify(updatedUser));
      } else {
          throw new Error("User not found in mock database.");
      }
  };
  
  const changePassword = async (data: { currentPassword: string, newPassword: string }): Promise<void> => {
      if (!user) throw new Error("Not authenticated");
      const userIndex = MOCK_USERS.findIndex(u => u.id === user.id);
      if (userIndex > -1) {
          if (MOCK_USERS[userIndex].password === data.currentPassword) {
              MOCK_USERS[userIndex].password = data.newPassword;
          } else {
              throw new Error("Current password does not match.");
          }
      } else {
          throw new Error("User not found in mock database.");
      }
  };
  
  const updateAdminBackupEmail = async (email: string): Promise<void> => {
      if (user?.role !== 'admin') throw new Error("Only admins can perform this action.");
      ADMIN_BACKUP_EMAIL = email;
      setAdminBackupEmail(email);
  };
  
  const logAdminAction = (action: AuditLogEntry['action'], details: string) => {
    if (!user || user.role !== 'admin') return;

    const newLogEntry: AuditLogEntry = {
        id: auditLog.length > 0 ? Math.max(...auditLog.map(log => log.id)) + 1 : 1,
        timestamp: new Date().toISOString(),
        adminUsername: user.username,
        action,
        details,
    };
    setAuditLog(prevLog => [newLogEntry, ...prevLog]);
  };
  
  const registerUser = async (data: RegisterData): Promise<void> => {
      if (user?.role !== 'admin') {
          throw new Error("Only admins can register new users.");
      }
      return new Promise((resolve, reject) => {
          setTimeout(() => { // Simulate network delay
              const usernameExists = MOCK_USERS.some(u => u.username.toLowerCase() === data.username.toLowerCase());
              if (usernameExists) {
                  return reject(new Error("Username already exists."));
              }
              const emailExists = MOCK_USERS.some(u => u.email.toLowerCase() === data.email.toLowerCase());
              if (emailExists) {
                  return reject(new Error("Email is already in use."));
              }

              const newId = MOCK_USERS.length > 0 ? Math.max(...MOCK_USERS.map(u => u.id)) + 1 : 1;
              const newUser: User & { password?: string } = {
                  id: newId,
                  name: data.name,
                  username: data.username,
                  email: data.email,
                  password: data.password,
                  role: 'member',
                  registrationDate: new Date().toISOString(),
              };

              MOCK_USERS.push(newUser);
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
            const userIndex = MOCK_USERS.findIndex(u => u.id === data.id);
            if (userIndex === -1) {
                return reject(new Error("User not found."));
            }
            
            const emailExists = MOCK_USERS.some(u => u.email.toLowerCase() === data.email.toLowerCase() && u.id !== data.id);
            if (emailExists) {
                return reject(new Error("Email is already in use by another account."));
            }

            const originalUser = MOCK_USERS[userIndex];
            const adminCount = MOCK_USERS.filter(u => u.role === 'admin').length;
            if (originalUser.role === 'admin' && data.role === 'member' && adminCount <= 1) {
                return reject(new Error("Cannot remove the last administrator."));
            }
            
            let changes: string[] = [];
            if (originalUser.name !== data.name) changes.push(`name to "${data.name}"`);
            if (originalUser.email !== data.email) changes.push(`email to "${data.email}"`);
            if (originalUser.role !== data.role) changes.push(`role to "${data.role}"`);

            MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...data };
            if (changes.length > 0) {
              logAdminAction('UPDATE_USER', `Updated user ${originalUser.username}: changed ${changes.join(', ')}.`);
            }
            const { password: _p, ...updatedUser } = MOCK_USERS[userIndex];
            
            resolve(updatedUser);
        }, 500);
    });
  };

  const deleteUser = async (userId: number): Promise<void> => {
    if (user?.role !== 'admin') {
        throw new Error("Only admins can perform this action.");
    }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
            if (userIndex === -1) return reject(new Error("User not found."));

            const userToDelete = MOCK_USERS[userIndex];
            if (userToDelete.id === user.id) return reject(new Error("You cannot delete your own account."));

            const adminCount = MOCK_USERS.filter(u => u.role === 'admin').length;
            if (userToDelete.role === 'admin' && adminCount <= 1) {
                return reject(new Error("Cannot delete the last administrator account."));
            }
            
            MOCK_USERS.splice(userIndex, 1);
            logAdminAction('DELETE_USER', `Deleted user: ${userToDelete.username} (ID: ${userToDelete.id})`);
            resolve();
        }, 500);
    });
  };

  const getUserByUsername = (username: string): User | undefined => {
    const foundUser = MOCK_USERS.find(u => u.username === username);
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
      return MOCK_USERS.map(u => {
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
  
  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    forgotPassword,
    updateUserProfile,
    changePassword,
    adminBackupEmail,
    updateAdminBackupEmail,
    getUserByUsername,
    ...(user?.role === 'admin' && { getAllUsers, registerUser, adminUpdateUser, deleteUser, getAuditLog }),
    ...(user && { getReminders, addReminder, updateReminderStatus, deleteReminder })
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