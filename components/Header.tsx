
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogoIcon } from './icons/LogoIcon';
import { UserIcon } from './icons/UserIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { BellIcon } from './icons/BellIcon';
import { Reminder } from '../types';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';


const Header: React.FC = () => {
  const { logout, user, getReminders } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  useEffect(() => {
    if (!user || !getReminders) return;

    const checkReminders = () => {
        const now = new Date();
        const allReminders = getReminders();
        const due = allReminders.filter(r => !r.isCompleted && new Date(r.dueDate) <= now);
        setDueReminders(due);
    };

    checkReminders();
    const intervalId = setInterval(checkReminders, 60000); 

    return () => clearInterval(intervalId);
  }, [user, getReminders]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, notificationRef]);


  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent text-primary'
        : 'text-text-light hover:bg-primary/50'
    }`;
    
  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg py-2 px-3 text-base font-semibold leading-7 transition-colors ${
      isActive
        ? 'bg-accent text-primary'
        : 'text-text-light hover:bg-primary/50'
    }`;

  return (
    <header className="bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <LogoIcon className="h-10 w-10 text-accent" />
                </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={navLinkClasses}>Dashboard</NavLink>
                <NavLink to="/services" className={navLinkClasses}>Services</NavLink>
                <NavLink to="/community" className={navLinkClasses}>Community</NavLink>
                <NavLink to="/assistant" className={navLinkClasses}>AI Assistant</NavLink>
                <NavLink to="/marketplace" className={navLinkClasses}>Marketplace</NavLink>
                <NavLink to="/reminders" className={navLinkClasses}>Reminders</NavLink>
                <NavLink to="/billing" className={navLinkClasses}>Billing</NavLink>
                {user?.role === 'admin' && (
                    <NavLink to="/admin" className={navLinkClasses}>Admin</NavLink>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
             <div className="relative mr-4" ref={notificationRef}>
                <button
                    onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                    className="text-text-light hover:bg-primary/50 p-2 rounded-full transition-colors relative"
                    aria-label="Notifications"
                >
                    <BellIcon className="h-6 w-6" />
                    {dueReminders.length > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-primary bg-red-500" aria-hidden="true"></span>
                    )}
                </button>
                {notificationDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                        <div className="px-4 py-2 font-bold text-gray-700 border-b">
                            {dueReminders.length > 0 ? `Due Reminders (${dueReminders.length})` : 'No Due Reminders'}
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                        {dueReminders.length > 0 ? (
                            dueReminders.map(r => (
                               <Link to="/reminders" key={r.id} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setNotificationDropdownOpen(false)}>
                                    <p className="font-semibold">{r.title}</p>
                                    <p className="text-xs text-gray-500">Due: {new Date(r.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                               </Link>
                            ))
                        ) : (
                             <p className="px-4 py-3 text-sm text-gray-500">You're all caught up!</p>
                        )}
                        </div>
                        <Link to="/reminders" className="block text-center w-full px-4 py-2 text-sm text-secondary font-semibold hover:bg-gray-100 border-t" onClick={() => setNotificationDropdownOpen(false)}>
                            View All Reminders
                        </Link>
                    </div>
                )}
            </div>
             <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-text-light hover:bg-primary/50 px-3 py-2 rounded-md transition-colors"
                >
                    <UserIcon className="h-5 w-5"/>
                    <span className="hidden sm:block font-medium">{user?.name}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                            My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                    </div>
                )}
             </div>
              <div className="ml-2 md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-text-light hover:bg-primary/50 focus:outline-none"
                  aria-controls="mobile-menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                </button>
              </div>
          </div>
        </div>
      </div>

       {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50" aria-hidden="true" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-primary px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <LogoIcon className="h-10 w-10 text-accent" />
                </Link>
                <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-text-light"
                onClick={() => setMobileMenuOpen(false)}
                >
                <span className="sr-only">Close menu</span>
                <CloseIcon className="h-6 w-6" aria-hidden="true" />
                </button>
            </div>
            <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-primary/20">
                    <div className="space-y-2 py-6">
                        <NavLink to="/" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
                        <NavLink to="/services" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Services</NavLink>
                        <NavLink to="/community" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Community</NavLink>
                        <NavLink to="/assistant" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>AI Assistant</NavLink>
                        <NavLink to="/marketplace" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Marketplace</NavLink>
                        <NavLink to="/reminders" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Reminders</NavLink>
                        <NavLink to="/billing" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Billing</NavLink>
                        {user?.role === 'admin' && (
                            <NavLink to="/admin" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>Admin</NavLink>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;