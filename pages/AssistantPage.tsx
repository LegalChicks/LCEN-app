
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, NavLink, Link } from 'react-router-dom';
import { getAssistantResponse } from '../services/geminiService';
import { ChatMessage, ChatSession } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon } from '../components/icons/PlusIcon';
import { MessageIcon } from '../components/icons/MessageIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { CloseIcon } from '../components/icons/CloseIcon';
import { MenuIcon } from '../components/icons/MenuIcon';

const AssistantPage: React.FC = () => {
  const { user, getChatSessions, getChatSession, saveChatSession, deleteChatSession } = useAuth();
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentSessionIdRef = useRef<number | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sessions = getChatSessions ? getChatSessions() : [];
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const parsedSessionId = sessionId ? parseInt(sessionId, 10) : null;
    currentSessionIdRef.current = parsedSessionId;

    if (parsedSessionId && getChatSession) {
      const session = getChatSession(parsedSessionId);
      if (session) {
        setMessages(session.messages);
      } else {
        navigate('/assistant', { replace: true });
      }
    } else {
      setMessages([{ role: 'model', text: `Hi ${user?.name}! I'm your LCEN AI Assistant. How can I help you with your poultry farming today?` }]);
    }
  }, [sessionId, getChatSession, user, navigate]);

  const handleSend = async () => {
    if (!input.trim() || loading || !saveChatSession) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const userInput = input; 
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const modelResponse = await getAssistantResponse(userInput);
      const modelMessage: ChatMessage = { role: 'model', text: modelResponse.text, sources: modelResponse.sources };
      const finalMessages = [...currentMessages, modelMessage];
      setMessages(finalMessages);

      let currentId = currentSessionIdRef.current;
      let sessionTitle = "New Chat";

      if (currentId) {
         const existingSession = getChatSession?.(currentId);
         sessionTitle = existingSession?.title || "Chat";
      } else {
         sessionTitle = userInput.split(' ').slice(0, 5).join(' ') + (userInput.split(' ').length > 5 ? '...' : '');
      }

      const savedSession = await saveChatSession({
          id: currentId,
          title: sessionTitle,
          messages: finalMessages,
      });

      if (!currentId && savedSession) {
          currentSessionIdRef.current = savedSession.id;
          navigate(`/assistant/${savedSession.id}`, { replace: true });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Sorry, I couldn't get a response. Error: ${errorMessage}`);
      const errorChatMessage: ChatMessage = { role: 'model', text: `I seem to be having trouble connecting. Please check your connection and try again.` };
      const messagesWithErr = [...currentMessages, errorChatMessage];
      setMessages(messagesWithErr);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (session: ChatSession, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSessionToDelete(session);
    setIsDeleteModalOpen(true);
  };
  
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSessionToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete && deleteChatSession) {
      const isDeletingCurrent = currentSessionIdRef.current === sessionToDelete.id;
      deleteChatSession(sessionToDelete.id);
      if (isDeletingCurrent) {
        navigate('/assistant');
      }
    }
    handleCloseDeleteModal();
  };


  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between w-full p-2 text-sm rounded-md group transition-colors ${
      isActive
        ? 'bg-secondary/20 text-primary font-semibold'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="flex h-full relative overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full p-2">
                 <div className="flex justify-between items-center p-2 md:hidden">
                    <span className="font-bold text-primary">Chat History</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-md hover:bg-gray-100">
                        <CloseIcon className="h-5 w-5 text-gray-600"/>
                    </button>
                </div>
                <Link to="/assistant" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-center space-x-2 w-full bg-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-accent hover:text-primary transition-colors mb-4">
                    <PlusIcon className="h-5 w-5"/>
                    <span>New Chat</span>
                </Link>
                <nav className="flex-grow overflow-y-auto space-y-1">
                    {sessions.map(session => (
                        <NavLink key={session.id} to={`/assistant/${session.id}`} onClick={() => setIsSidebarOpen(false)} className={navLinkClasses}>
                        <div className="flex items-center space-x-2 truncate">
                            <MessageIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{session.title}</span>
                        </div>
                        <button onClick={(e) => handleOpenDeleteModal(session, e)} className="p-1 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity">
                                <TrashIcon className="h-4 w-4" />
                        </button>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
        
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
            <div className="p-2 border-b bg-white md:hidden">
                <button onClick={() => setIsSidebarOpen(true)} className="flex items-center space-x-2 text-primary font-semibold p-2">
                    <MenuIcon className="h-5 w-5" />
                    <span>Chat History</span>
                </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg lg:max-w-xl px-4 py-2 rounded-xl shadow ${msg.role === 'user' ? 'bg-secondary text-white' : 'bg-white text-text-dark'}`}>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className={`mt-3 pt-3 text-sm ${msg.role === 'user' ? 'border-t border-white/30' : 'border-t border-gray-200'}`}>
                                <h4 className="font-bold mb-2">Sources:</h4>
                                <ul className="space-y-1">
                                {msg.sources.map((source, i) => (
                                    <li key={i} className="flex items-start">
                                    <span className="mr-2">&#8226;</span>
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="break-all hover:underline">
                                        {source.title}
                                    </a>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
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
                    rows={1}
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Send
                </button>
                </div>
            </div>
        </div>

      {isDeleteModalOpen && sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-700">Delete Session</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete the chat: <strong>{sessionToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={handleCloseDeleteModal} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantPage;
