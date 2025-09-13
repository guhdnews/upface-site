import Layout from '../../../components/Layout';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FollowUpService } from '../../../lib/crm-db';
import { FollowUp } from '../../../lib/crm-types';
import Link from 'next/link';
import { ArrowLeft, Calendar, AlertCircle, CheckSquare, User } from 'lucide-react';

export default function FollowUpsPage() {
  const { user, loading } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('pending');

  const loadFollowUps = useCallback(async () => {
    try {
      const followUpsData = await FollowUpService.getFollowUpsByAssignee(user?.uid || '');
      setFollowUps(followUpsData);
    } catch (error) {
      console.error('Error loading follow-ups:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user) {
      loadFollowUps();
    }
  }, [user, loadFollowUps]);

  const completeFollowUp = async (followUpId: string) => {
    try {
      await FollowUpService.completeFollowUp(followUpId);
      setFollowUps(followUps.map(followUp => 
        followUp.id === followUpId 
          ? { ...followUp, completed: true, completedDate: new Date() }
          : followUp
      ));
    } catch (error) {
      console.error('Error completing follow-up:', error);
      alert('Error completing follow-up. Please try again.');
    }
  };

  const filteredFollowUps = followUps.filter(followUp => {
    const now = new Date();
    const isOverdue = followUp.dueDate < now && !followUp.completed;
    
    switch (filter) {
      case 'pending':
        return !followUp.completed;
      case 'completed':
        return followUp.completed;
      case 'overdue':
        return isOverdue;
      case 'all':
      default:
        return true;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-600/20';
      case 'medium': return 'text-yellow-400 bg-yellow-600/20';
      case 'low': return 'text-green-400 bg-green-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const isOverdue = (dueDate: Date, completed: boolean) => {
    return dueDate < new Date() && !completed;
  };

  if (loading || isLoading) {
    return <Layout><div className="section section--black"><div className="section-container"><p>Loading...</p></div></div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <div className="section section--black">
          <div className="section-container text-center">
            <h1>Access Denied</h1>
            <p className="text-large mb-6">Please log in to access follow-ups.</p>
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Follow-ups - CRM">
      <div className="section section--black min-h-screen">
        <div className="section-container">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/crm" 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1>Follow-ups</h1>
              <p className="text-large text-gray-400">{followUps.length} total follow-ups</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-900 p-6 border border-gray-700 rounded-lg mb-8">
            <div className="flex flex-wrap gap-4">
              {[
                { key: 'pending', label: 'Pending', count: followUps.filter(f => !f.completed).length },
                { key: 'completed', label: 'Completed', count: followUps.filter(f => f.completed).length },
                { key: 'overdue', label: 'Overdue', count: followUps.filter(f => isOverdue(f.dueDate, f.completed)).length },
                { key: 'all', label: 'All', count: followUps.length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as 'all' | 'pending' | 'completed' | 'overdue')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Follow-ups List */}
          {filteredFollowUps.length === 0 ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
              <Calendar className="mx-auto mb-6 text-gray-600" size={64} />
              <h2 className="mb-4">No follow-ups found</h2>
              <p className="text-gray-400 mb-6">
                {filter === 'pending' && "No pending follow-ups. Great job staying on top of things!"}
                {filter === 'completed' && "No completed follow-ups yet."}
                {filter === 'overdue' && "No overdue follow-ups. You're all caught up!"}
                {filter === 'all' && "No follow-ups have been created yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFollowUps.map((followUp) => (
                <div 
                  key={followUp.id} 
                  className={`bg-gray-900 border rounded-lg p-6 ${
                    isOverdue(followUp.dueDate, followUp.completed) 
                      ? 'border-red-600/50 bg-red-600/10' 
                      : followUp.completed
                      ? 'border-green-600/50 bg-green-600/10'
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Follow-up header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white text-lg font-semibold">{followUp.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(followUp.priority)}`}>
                              {followUp.priority} priority
                            </span>
                            {followUp.completed && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-600/20 text-green-400">
                                Completed
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-300 mb-3">{followUp.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Due: {followUp.dueDate.toLocaleDateString()}</span>
                              {isOverdue(followUp.dueDate, followUp.completed) && (
                                <AlertCircle size={14} className="text-red-400 ml-1" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <Link 
                                href={`/crm/clients/${followUp.clientId}`}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                View Client
                              </Link>
                            </div>
                            {followUp.completedDate && (
                              <div className="flex items-center gap-1">
                                <CheckSquare size={14} />
                                <span>Completed: {followUp.completedDate.toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!followUp.completed && (
                        <button
                          onClick={() => completeFollowUp(followUp.id)}
                          className="btn btn-primary text-sm"
                        >
                          <CheckSquare size={16} />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          {followUps.length > 0 && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg text-center">
                <p className="text-2xl font-light text-white">{followUps.filter(f => !f.completed).length}</p>
                <p className="text-sm text-yellow-400">Pending</p>
              </div>
              <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg text-center">
                <p className="text-2xl font-light text-white">{followUps.filter(f => f.completed).length}</p>
                <p className="text-sm text-green-400">Completed</p>
              </div>
              <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg text-center">
                <p className="text-2xl font-light text-white">{followUps.filter(f => isOverdue(f.dueDate, f.completed)).length}</p>
                <p className="text-sm text-red-400">Overdue</p>
              </div>
              <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg text-center">
                <p className="text-2xl font-light text-white">{followUps.filter(f => f.priority === 'high' && !f.completed).length}</p>
                <p className="text-sm text-red-400">High Priority</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}