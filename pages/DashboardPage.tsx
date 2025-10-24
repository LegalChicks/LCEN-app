import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const quickLinks = [
    { title: 'Our Services', description: 'Explore training, starter packs, and supplies.', path: '/services', icon: '🐣' },
    { title: 'Community Network', description: 'Connect with partners and view our reach.', path: '/community', icon: '🤝' },
    { title: 'AI Farming Assistant', description: 'Get expert advice on your poultry questions.', path: '/assistant', icon: '🤖' },
    { title: 'Task Reminders', description: 'Set and manage your farming schedule.', path: '/reminders', icon: '🔔' },
  ];

  const impactGoals = [
    { value: '300+', label: 'Farmers Trained' },
    { value: '10+', label: 'Local Clusters' },
    { value: '500+', label: 'Livelihoods Created' },
    { value: '20,000+', label: 'Healthy Layers Supplied' },
  ];

  return (
    <div className="bg-light-bg min-h-full">
      <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold">Welcome, {user?.name}!</h1>
          <p className="mt-2 text-lg text-gray-200">This is your portal to the Legal Chicks Empowerment Network.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Quick Links Section */}
        <h2 className="text-2xl font-bold text-text-dark mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.path} className="block group">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 border-t-4 border-secondary">
                <div className="text-4xl mb-3">{link.icon}</div>
                <h3 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors">{link.title}</h3>
                <p className="text-gray-600 mt-2">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Impact Goals Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-text-dark mb-6">Our Collective Impact</h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {impactGoals.map((goal) => (
                <div key={goal.label}>
                  <p className="text-4xl font-extrabold text-secondary">{goal.value}</p>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-2">{goal.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Promise Section */}
        <div className="mt-16 bg-gradient-to-r from-secondary to-accent text-white rounded-xl shadow-xl p-8 text-center">
          <h3 className="text-3xl font-bold mb-3">Our Promise To You</h3>
          <p className="text-xl font-light leading-relaxed italic">
            You will not start alone. You will not grow alone. You will never stand alone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;