// FIX: Define User and ChatMessage types to be used across the application.
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  registrationDate: string;
  phone?: string;
  // New fields for enhanced member management
  profilePhotoUrl?: string;
  farmLocation: string;
  membershipLevel: 'Starter' | 'Franchise' | 'Cluster Leader' | 'Trainee';
  status: 'Active' | 'Pending Onboarding' | 'Inactive';
  lastActivityDate: string; // ISO String
  profitCycleCompletion: number; // Percentage 0-100
  cdfContribution: number;
  trainingStatus: 'Completed Training' | 'Pending Orientation' | 'Certified';
  estimatedProfit: number;
  milestones: {
    name: 'Joined' | 'Trained' | 'Onboarded' | 'First Sale' | 'Certified';
    date: string; // ISO String
    status: 'complete' | 'pending';
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string; }[];
}

export interface ChatSession {
  id: number;
  userId: number;
  title: string;
  lastUpdated: string; // ISO String
  messages: ChatMessage[];
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  actorUsername: string;
  action: 'REGISTER_USER' | 'UPDATE_USER' | 'DELETE_USER' | 'LOGIN' | 'LOGOUT' | 'CHANGE_PASSWORD';
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

export interface OpportunityPackage {
  id: number;
  userId: number;
  name: string;
  description: string;
  dateAvailed: string; // ISO String
  status: 'Active' | 'Completed';
  cost: number;
}

export interface TrainingSession {
  id: number;
  userId: number;
  topic: string;
  date: string; // ISO String
  status: 'Scheduled' | 'Completed';
}

export interface FeedOrder {
  id: number;
  userId: number;
  product: string;
  quantity: string; // e.g., '5 bags'
  deliveryDate: string; // ISO String
  status: 'Scheduled' | 'Delivered';
}

export type MarketStockType = 'fertile_eggs' | 'table_eggs' | 'culled_meat' | 'live_rir';

export interface MarketStock {
  id: number;
  userId: number;
  type: MarketStockType;
  quantity: number;
  price: number; // per unit
  dateListed: string; // ISO String
}