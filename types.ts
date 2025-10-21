// FIX: Define User and ChatMessage types to be used across the application.
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
