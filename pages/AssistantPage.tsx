import React, { useState, useRef, useEffect } from 'react';
import { getAssistantResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';

const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load chat history from localStorage when the component mounts for a user.
  useEffect(() => {
    if (!user) return;

    const CHAT_HISTORY_KEY = `lcen-chat-history-${user.username}`;
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Ensure the loaded history is a non-empty array before setting it
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          // FIX: Cast the parsed history to ensure the 'role' property is correctly typed as 'user' | 'model' instead of the wider 'string' type. This prevents downstream type errors when creating new message arrays.
          setMessages(parsedHistory as ChatMessage[]);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load or parse chat history from localStorage", e);
      // If parsing fails, the data is likely corrupted, so we remove it.
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
    
    // If no history is found, set the initial welcome message.
    setMessages([{ role: 'model', text: `Hi ${user.name}! I'm your LCEN AI Assistant. How can I help you with your poultry farming today?` }]);
  }, [user]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const messagesWithUser = [...messages, userMessage];
    setMessages(messagesWithUser);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const modelResponse = await getAssistantResponse(input);
      const finalMessages = [...messagesWithUser, { role: 'model', text: modelResponse }];
      setMessages(finalMessages);

      // After a successful response, save the entire chat history to localStorage.
      if (user) {
        const CHAT_HISTORY_KEY = `lcen-chat-history-${user.username}`;
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(finalMessages));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Sorry, I couldn't get a response. Please try again. Error: ${errorMessage}`);
      // Even on error, update the UI to show a helpful message.
      const messagesWithErr = [...messagesWithUser, { role: 'model', text: `I seem to be having trouble connecting. Please check your connection and try again.` }];
      setMessages(messagesWithErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="bg-primary text-white py-6 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-extrabold">AI Farming Assistant</h1>
            <p className="mt-1 text-gray-200">Your personal poultry farming expert, powered by Gemini.</p>
        </div>

        <div className="flex-grow p-4 overflow-y-auto bg-light-bg">
            <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg lg:max-w-xl px-4 py-2 rounded-xl shadow ${msg.role === 'user' ? 'bg-secondary text-white' : 'bg-white text-text-dark'}`}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    </div>
                </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-lg px-4 py-2 rounded-xl shadow bg-white text-text-dark">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                 {error && <p className="text-red-500 text-center">{error}</p>}
                <div ref={messagesEndRef} />
            </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto flex items-center space-x-2">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about feed types, disease symptoms, coop designs..."
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                rows={2}
                disabled={loading}
            />
            <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-secondary text-white font-bold py-3 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Send
            </button>
            </div>
        </div>
    </div>
  );
};

export default AssistantPage;