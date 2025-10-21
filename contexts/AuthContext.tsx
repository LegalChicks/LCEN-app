import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

// This is a mock database. In a real application, this would be an API call.
const MOCK_USERS: (User & { password?: string })[] = [
  { id: 1, username: 'farmer_juan', password: 'password123', name: 'Juan dela Cruz', email: 'juan.delacruz@example.com', role: 'member' },
  { id: 2, username: 'admin', password: 'adminpassword', name: 'Admin User', email: 'admin@lcen.com', role: 'admin' },
  { id: 3, username: 'maria_santos', password: 'password123', name: 'Maria Santos', email: 'maria.santos@example.com', role: 'member' },
];

// In a real app, this would also be stored securely on a server.
let ADMIN_BACKUP_EMAIL = 'backup.admin@lcen.com';


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
  getAllUsers?: () => User[]; // Optional, only exposed if user is admin
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminBackupEmail, setAdminBackupEmail] = useState(ADMIN_BACKUP_EMAIL);

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
    ...(user?.role === 'admin' && { getAllUsers })
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
