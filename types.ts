// FIX: Define User and ChatMessage types to be used across the application.
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  registrationDate: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  adminUsername: string;
  action: 'REGISTER_USER' | 'UPDATE_USER' | 'DELETE_USER';
  details: string;
}

export interface Reminder {
  id: number;
  userId: number;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  isCompleted: boolean;
}
