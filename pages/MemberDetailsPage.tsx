import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from '../components/icons/UserIcon';
import { MarketStockType, AuditLogEntry, User } from '../types';
import { CheckIcon } from '../components/icons/CheckIcon';

const STOCK_TYPE_LABELS: Record<MarketStockType, string> = {
  fertile_eggs: 'Fertile Eggs',
  table_eggs: 'Table Eggs',
  culled_meat: 'Culled Meat (kg)',
  live_rir: 'Live RIR',
};

const getStatusColor = (status: User['status']) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'Pending Onboarding': return 'bg-yellow-100 text-yellow-800';
        case 'Inactive': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const trainingStatusInfo: Record<User['trainingStatus'], { icon: string, color: string }> = {
    'Completed Training': { icon: '📘', color: 'text-blue-800 bg-blue-100' },
    'Pending Orientation': { icon: '⏳', color: 'text-yellow-800 bg-yellow-100' },
    'Certified': { icon: '🎓', color: 'text-green-800 bg-green-100' },
};

const membershipLevelColor: Record<User['membershipLevel'], string> = {
    'Starter': 'text-gray-800 bg-gray-100',
    'Franchise': 'text-indigo-800 bg-indigo-100',
    'Cluster Leader': 'text-purple-800 bg-purple-100',
    'Trainee': 'text-cyan-800 bg-cyan-100'
};


const MemberDetailsPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { 
    getUserByUsername, 
    getPackagesForUser, 
    getTrainingsForUser, 
    getFeedOrdersForUser, 
    getMarketStocksForUser,
    getAuditLog
  } = useAuth();
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);

  const userProfile = useMemo(() => username ? getUserByUsername?.(username) : undefined, [username, getUserByUsername]);
  const userPackages = useMemo(() => userProfile ? getPackagesForUser?.(userProfile.id) ?? [] : [], [userProfile, getPackagesForUser]);
  const userTrainings = useMemo(() => userProfile ? getTrainingsForUser?.(userProfile.id) ?? [] : [], [userProfile, getTrainingsForUser]);
  const userFeedOrders = useMemo(() => userProfile ? getFeedOrdersForUser?.(userProfile.id) ?? [] : [], [userProfile, getFeedOrdersForUser]);
  const userMarketStocks = useMemo(() => userProfile ? getMarketStocksForUser?.(userProfile.id) ?? [] : [], [userProfile, getMarketStocksForUser]);

  const handleViewAuditLog = () => {
    if (getAuditLog && userProfile) {
        const allLogs = getAuditLog();
        const userLogs = allLogs.filter(log => 
            log.details.toLowerCase().includes(userProfile.username.toLowerCase()) || 
            log.actorUsername.toLowerCase() === userProfile.username.toLowerCase()
        );
        setFilteredLogs(userLogs);
        setIsLogModalOpen(true);
    }
  };

  if (!userProfile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-primary">User Not Found</h1>
        <p className="text-gray-600 mt-2">The profile for @{username} could not be found.</p>
        <Link to="/admin" className="mt-6 inline-block bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors">
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }
  
  const Section: React.FC<{ title: string; children: React.ReactNode; count?: number; actions?: React.ReactNode }> = ({ title, children, count, actions }) => (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">{title} {typeof count !== 'undefined' && `(${count})`}</h2>
        {actions && <div>{actions}</div>}
      </div>
      {(typeof count === 'undefined' || count > 0) ? <div>{children}</div> : <p className="text-gray-500">No records found.</p>}
    </div>
  );

  const tsInfo = trainingStatusInfo[userProfile.trainingStatus];
  const mlColor = membershipLevelColor[userProfile.membershipLevel];

  return (
    <div className="overflow-y-auto h-full">
      <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img src={userProfile.profilePhotoUrl} alt={userProfile.name} className="h-24 w-24 rounded-full object-cover border-4 border-accent"/>
            <div>
              <h1 className="text-3xl font-extrabold md:text-4xl text-center sm:text-left">{userProfile.name}</h1>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-x-4">
                <p className="text-lg text-gray-200">@{userProfile.username}</p>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(userProfile.status)}`}>{userProfile.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-8 sticky top-24">
            <Section title="Member Details" actions={
                <button onClick={handleViewAuditLog} className="text-sm bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-md hover:bg-gray-300 transition-colors">Audit Log</button>
            }>
                <dl className="space-y-4">
                    <div><dt className="text-sm font-medium text-gray-500">Email Address</dt><dd className="mt-1 text-md text-gray-900 break-words">{userProfile.email}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-500">Phone Number</dt><dd className="mt-1 text-md text-gray-900">{userProfile.phone || 'N/A'}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-500">Farm Location</dt><dd className="mt-1 text-md text-gray-900">{userProfile.farmLocation}</dd></div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Membership Level</dt>
                        <dd className="mt-1"><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${mlColor}`}>🧑‍🌾 {userProfile.membershipLevel}</span></dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Training Status</dt>
                        <dd className="mt-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${tsInfo.color}`}>
                                <span className="mr-2">{tsInfo.icon}</span>
                                {userProfile.trainingStatus === 'Certified' ? 'NC II Poultry Certified' : userProfile.trainingStatus}
                            </span>
                        </dd>
                    </div>
                    <div><dt className="text-sm font-medium text-gray-500">Member Since</dt><dd className="mt-1 text-md text-gray-900">{new Date(userProfile.registrationDate).toLocaleDateString()}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-500">Last Activity</dt><dd className="mt-1 text-md text-gray-900">{new Date(userProfile.lastActivityDate).toLocaleDateString()}</dd></div>
                </dl>
            </Section>
            <Section title="Performance Overview">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-primary">Profit Cycle</span>
                            <span className="text-sm font-medium text-primary">{userProfile.profitCycleCompletion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-secondary h-2.5 rounded-full" style={{width: `${userProfile.profitCycleCompletion}%`}}></div>
                        </div>
                    </div>
                    <div className="text-center bg-light-bg p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Estimated Profit</p>
                        <p className="text-2xl font-bold text-green-600">₱{userProfile.estimatedProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                    <div className="text-center bg-light-bg p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">CDF Contribution</p>
                        <p className="text-2xl font-bold text-secondary">₱{userProfile.cdfContribution.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                </div>
            </Section>
        </div>
        
        {/* Right Column - Activity */}
        <div className="lg:col-span-2 space-y-12">
            <Section title="Membership Timeline">
                 <ol className="relative border-l border-gray-200">
                    {userProfile.milestones.map((milestone, index) => (
                        <li key={index} className="mb-6 ml-6">
                            <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${milestone.status === 'complete' ? 'bg-green-200' : 'bg-gray-200'}`}>
                                {milestone.status === 'complete' ? <CheckIcon className="w-3 h-3 text-green-800"/> : <div className="w-3 h-3 bg-gray-400 rounded-full"></div>}
                            </span>
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">{milestone.name}
                                {milestone.name === 'Certified' && userProfile.trainingStatus === 'Certified' && <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">NC II Certified</span>}
                            </h3>
                            {milestone.status === 'complete' && milestone.date && (
                                <time className="block mb-2 text-sm font-normal leading-none text-gray-400">Completed on {new Date(milestone.date).toLocaleDateString()}</time>
                            )}
                        </li>
                    ))}
                </ol>
            </Section>
            <Section title="Opportunity Packages Availed" count={userPackages.length}>
              <ul className="space-y-4">
                {userPackages.map(p => (
                  <li key={p.id} className="p-4 border rounded-lg flex justify-between items-start">
                    <div>
                      <p className="font-bold text-text-dark">{p.name} - <span className="font-semibold text-primary">₱{p.cost.toLocaleString()}</span></p>
                      <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                      <p className="text-xs font-semibold text-secondary mt-2">Availed on: {new Date(p.dateAvailed).toLocaleDateString()}</p>
                    </div>
                    <span className={`flex-shrink-0 ml-4 mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span>
                  </li>
                ))}
              </ul>
            </Section>
            
            <Section title="Training & Mentorship" count={userTrainings.length}>
                <div className="overflow-x-auto">
                    <table className="min-w-full"><thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase"><tr><th className="py-3 px-4">Topic</th><th className="py-3 px-4">Date</th><th className="py-3 px-4">Status</th></tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {userTrainings.map(t => (<tr key={t.id}><td className="py-3 px-4 font-medium">{t.topic}</td><td className="py-3 px-4">{new Date(t.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td><td className="py-3 px-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t.status}</span></td></tr>))}
                        </tbody>
                    </table>
                </div>
            </Section>
            
            <Section title="Feed Order Schedule" count={userFeedOrders.length}>
                 <div className="overflow-x-auto">
                    <table className="min-w-full"><thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase"><tr><th className="py-3 px-4">Product</th><th className="py-3 px-4">Quantity</th><th className="py-3 px-4">Delivery Date</th><th className="py-3 px-4">Status</th></tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {userFeedOrders.map(o => (<tr key={o.id}><td className="py-3 px-4 font-medium">{o.product}</td><td className="py-3 px-4">{o.quantity}</td><td className="py-3 px-4">{new Date(o.deliveryDate).toLocaleDateString()}</td><td className="py-3 px-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${o.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{o.status}</span></td></tr>))}
                        </tbody>
                    </table>
                </div>
            </Section>
    
            <Section title="Declared Stocks for Market" count={userMarketStocks.length}>
                 <div className="overflow-x-auto">
                    <table className="min-w-full"><thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase"><tr><th className="py-3 px-4">Product</th><th className="py-3 px-4">Quantity</th><th className="py-3 px-4">Price</th><th className="py-3 px-4">Date Listed</th></tr></thead>
                        <tbody className="divide-y divide-gray-200">
                            {userMarketStocks.map(s => (<tr key={s.id}><td className="py-3 px-4 font-medium">{STOCK_TYPE_LABELS[s.type]}</td><td className="py-3 px-4">{s.quantity.toLocaleString()}</td><td className="py-3 px-4">₱{s.price.toFixed(2)}</td><td className="py-3 px-4">{new Date(s.dateListed).toLocaleDateString()}</td></tr>))}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
      </div>

      {isLogModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold text-primary">Audit Log for {userProfile.name}</h3>
                     <button onClick={() => setIsLogModalOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="overflow-y-auto">
                    {filteredLogs.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th></tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">{log.actorUsername}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === 'DELETE_USER' ? 'bg-red-100 text-red-800' : log.action === 'UPDATE_USER' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{log.action.replace('_', ' ')}</span></td>
                                        <td className="px-4 py-3 text-sm text-gray-800 break-words">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No audit log entries found for this user.</p>
                    )}
                </div>
                 <div className="mt-6 text-right">
                    <button onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Close</button>
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetailsPage;