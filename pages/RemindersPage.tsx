
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckIcon } from '../components/icons/CheckIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { UndoIcon } from '../components/icons/UndoIcon';
import { Reminder } from '../types';

const RemindersPage: React.FC = () => {
  const { getReminders, addReminder, updateReminderStatus, deleteReminder } = useAuth();
  const allReminders = getReminders ? getReminders() : [];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  const { upcoming, completed } = useMemo(() => {
    const upcoming = allReminders.filter(r => !r.isCompleted);
    const completed = allReminders.filter(r => r.isCompleted).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    return { upcoming, completed };
  }, [allReminders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addReminder || !date || !time) {
        setMessage({ type: 'error', text: 'Please fill in all required fields.' });
        return;
    }
    setLoading(true);
    setMessage(null);
    try {
        const dueDate = new Date(`${date}T${time}`).toISOString();
        await addReminder({ title, description, dueDate });
        setMessage({ type: 'success', text: 'Reminder added successfully!' });
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
    } catch (error) {
        setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to add reminder.' });
    } finally {
        setLoading(false);
    }
  };
  
  const handleToggleStatus = (id: number, isCompleted: boolean) => {
    updateReminderStatus && updateReminderStatus(id, isCompleted);
  };
  
  const handleOpenDeleteModal = (reminder: Reminder) => {
    setReminderToDelete(reminder);
    setIsDeleteModalOpen(true);
  };
  
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setReminderToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (reminderToDelete && deleteReminder) {
      deleteReminder(reminderToDelete.id);
    }
    handleCloseDeleteModal();
  };

  const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm";

  return (
    <div className="overflow-y-auto h-full">
      <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold md:text-4xl">Task Reminders</h1>
          <p className="mt-2 text-lg text-gray-200">Stay organized and on top of your farming schedule.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-lg sticky top-24">
            <h2 className="text-2xl font-bold text-primary mb-6">Add a New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Title*</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className={inputClass} placeholder="e.g., Vaccinate new chicks" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClass} rows={3} placeholder="Add extra details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date*</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={inputClass} />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700">Time*</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} required className={inputClass} />
                  </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-accent hover:text-primary transition-colors disabled:bg-gray-400">
                  {loading ? 'Adding...' : 'Add Reminder'}
                </button>
              </div>
              {message && <p className={`text-sm mt-4 text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
            </form>
          </div>

          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-primary mb-6">Upcoming Tasks ({upcoming.length})</h2>
              {upcoming.length > 0 ? (
                <ul className="space-y-4">
                  {upcoming.map(r => (
                    <li key={r.id} className="p-4 border rounded-lg flex items-center justify-between transition-all hover:border-secondary">
                      <div className="flex-grow">
                        <p className="font-bold text-text-dark">{r.title}</p>
                        {r.description && <p className="text-sm text-gray-500 mt-1">{r.description}</p>}
                        <p className="text-xs font-semibold text-secondary mt-2">
                            Due: {new Date(r.dueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-2 ml-4">
                        <button onClick={() => handleToggleStatus(r.id, true)} className="p-2 text-green-600 hover:bg-green-100 rounded-full" aria-label="Mark as complete"><CheckIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleOpenDeleteModal(r)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" aria-label="Delete"><TrashIcon className="h-5 w-5" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500">No upcoming tasks. Add one to get started!</p>}
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-primary mb-6">Completed Tasks ({completed.length})</h2>
                 {completed.length > 0 ? (
                <ul className="space-y-4">
                  {completed.map(r => (
                    <li key={r.id} className="p-4 border bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex-grow">
                        <p className="font-bold text-gray-500 line-through">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Completed on: {new Date(r.dueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-2 ml-4">
                        <button onClick={() => handleToggleStatus(r.id, false)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" aria-label="Mark as incomplete"><UndoIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleOpenDeleteModal(r)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" aria-label="Delete"><TrashIcon className="h-5 w-5" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500">No tasks completed yet.</p>}
            </div>
          </div>

        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && reminderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-700">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete the task: <strong>{reminderToDelete.title}</strong>? This action cannot be undone.
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
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
