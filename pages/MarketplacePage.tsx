
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrashIcon } from '../components/icons/TrashIcon';
import { MarketStock, MarketStockType } from '../types';

const STOCK_TYPE_LABELS: Record<MarketStockType, string> = {
  fertile_eggs: 'Fertile Eggs',
  table_eggs: 'Table Eggs',
  culled_meat: 'Culled Meat (kg)',
  live_rir: 'Live RIR',
};


const MarketplacePage: React.FC = () => {
  const { getMyMarketStocks, addMarketStock, deleteMarketStock } = useAuth();
  
  // Form state
  const [type, setType] = useState<MarketStockType>('table_eggs');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<MarketStock | null>(null);
  
  // Search, Filter, and Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<MarketStockType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'price' | 'dateListed'; direction: 'asc' | 'desc' }>({ key: 'dateListed', direction: 'desc' });
  
  const filteredAndSortedStocks = useMemo(() => {
    let stocks = getMyMarketStocks ? getMyMarketStocks() : [];
    
    if (typeFilter !== 'all') {
        stocks = stocks.filter(s => s.type === typeFilter);
    }
    if (dateFilter) {
        stocks = stocks.filter(s => s.dateListed.split('T')[0] >= dateFilter);
    }
    if (searchTerm) {
        stocks = stocks.filter(s => STOCK_TYPE_LABELS[s.type].toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    stocks.sort((a, b) => {
        if (sortConfig.key === 'price') {
            return sortConfig.direction === 'asc' ? a.price - b.price : b.price - a.price;
        } else { // 'dateListed'
            return sortConfig.direction === 'asc' 
                ? new Date(a.dateListed).getTime() - new Date(b.dateListed).getTime() 
                : new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime();
        }
    });

    return stocks;
  }, [getMyMarketStocks, searchTerm, typeFilter, dateFilter, sortConfig]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMarketStock || !type || !quantity || !price) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await addMarketStock({
        type,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
      });
      setMessage({ type: 'success', text: 'New stock listed successfully!' });
      setType('table_eggs');
      setQuantity('');
      setPrice('');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to list stock.' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDeleteModal = (stock: MarketStock) => {
    setStockToDelete(stock);
    setIsDeleteModalOpen(true);
  };
  
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setStockToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (stockToDelete && deleteMarketStock) {
      deleteMarketStock(stockToDelete.id);
    }
    handleCloseDeleteModal();
  };
  
  const handleSort = (key: 'price' | 'dateListed') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: 'price' | 'dateListed') => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼' ;
  };

  const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm";

  return (
    <div className="overflow-y-auto h-full">
      <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold md:text-4xl">My Marketplace Listings</h1>
          <p className="mt-2 text-lg text-gray-200">Manage the products you have available for sale.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-lg sticky top-24">
            <h2 className="text-2xl font-bold text-primary mb-6">List New Stock</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Type*</label>
                <select value={type} onChange={e => setType(e.target.value as MarketStockType)} required className={inputClass}>
                  {Object.entries(STOCK_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity*</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required className={inputClass} placeholder="e.g., 100" min="1"/>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700">Price (₱)*</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className={inputClass} placeholder="e.g., 8.00" min="0" step="0.01"/>
                  </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                  {loading ? 'Listing...' : 'List on Marketplace'}
                </button>
              </div>
              {message && <p className={`text-sm mt-4 text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-primary mb-6">Current Listings ({filteredAndSortedStocks.length})</h2>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Search Product</label>
                    <input type="text" placeholder="e.g., Table Eggs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={inputClass} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Filter by Type</label>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as MarketStockType | 'all')} className={inputClass}>
                        <option value="all">All Types</option>
                        {Object.entries(STOCK_TYPE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Listed After</label>
                    <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={inputClass}/>
                </div>
                 <div>
                    <button onClick={() => { setSearchTerm(''); setTypeFilter('all'); setDateFilter(''); }} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-sm">Clear Filters</button>
                 </div>
            </div>

            {filteredAndSortedStocks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => handleSort('price')} className="flex items-center space-x-1 focus:outline-none"><span>Price</span><span className="text-gray-400">{getSortIndicator('price')}</span></button></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><button onClick={() => handleSort('dateListed')} className="flex items-center space-x-1 focus:outline-none"><span>Date Listed</span><span className="text-gray-400">{getSortIndicator('dateListed')}</span></button></th>
                      <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedStocks.map(s => (
                      <tr key={s.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{STOCK_TYPE_LABELS[s.type]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.quantity.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{s.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.dateListed).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleOpenDeleteModal(s)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" aria-label="Delete"><TrashIcon className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-gray-500 text-center py-8">No products match your criteria. Try adjusting your filters.</p>}
          </div>
        </div>
      </div>

      {isDeleteModalOpen && stockToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-700">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this listing: <strong>{stockToDelete.quantity} {STOCK_TYPE_LABELS[stockToDelete.type]}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={handleCloseDeleteModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">Delete Listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
