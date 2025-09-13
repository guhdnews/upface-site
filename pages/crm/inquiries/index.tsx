import Layout from '../../../components/Layout';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { InquiryService } from '../../../lib/crm-db';
import { Inquiry, ACQUISITION_SOURCES, AcquisitionSource } from '../../../lib/crm-types';
import Link from 'next/link';
import { ArrowLeft, Mail, UserPlus, Clock } from 'lucide-react';

export default function InquiriesPage() {
  const { user, loading } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInquiries();
    }
  }, [user]);

  const loadInquiries = async () => {
    try {
      const inquiriesData = await InquiryService.getNewInquiries();
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToClient = async (inquiry: Inquiry, acquisitionSource: string) => {
    if (!user) return;
    
    setConvertingId(inquiry.id);
    try {
      const clientId = await InquiryService.convertInquiryToClient(inquiry.id, {
        acquisitionSource: acquisitionSource as AcquisitionSource,
        assignedTo: user.uid
      });
      
      // Remove from inquiries list
      setInquiries(inquiries.filter(i => i.id !== inquiry.id));
      
      // Navigate to the new client
      window.open(`/crm/clients/${clientId}`, '_blank');
    } catch (error) {
      console.error('Error converting inquiry to client:', error);
      alert('Error converting inquiry. Please try again.');
    } finally {
      setConvertingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-600';
      case 'contacted': return 'bg-yellow-600';
      case 'converted': return 'bg-blue-600';
      case 'closed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
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
            <p className="text-large mb-6">Please log in to access inquiries.</p>
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Inquiries - CRM">
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
              <h1>Manage Inquiries</h1>
              <p className="text-large text-gray-400">{inquiries.length} new inquiries</p>
            </div>
          </div>

          {/* Inquiries List */}
          {inquiries.length === 0 ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
              <Mail className="mx-auto mb-6 text-gray-600" size={64} />
              <h2 className="mb-4">No new inquiries</h2>
              <p className="text-gray-400 mb-6">When people submit the contact form, their inquiries will appear here.</p>
              <Link href="/contact" className="btn btn-primary">
                View Contact Form
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                  {/* Inquiry Header */}
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white text-lg font-semibold">{inquiry.name}</h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(inquiry.status)}`}>
                            {inquiry.status}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                          <span>{inquiry.email}</span>
                          {inquiry.phone && <span>{inquiry.phone}</span>}
                          {inquiry.company && <span>{inquiry.company}</span>}
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {inquiry.submittedAt.toLocaleDateString()} at {inquiry.submittedAt.toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="bg-black p-4 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Message:</h4>
                          <p className="text-gray-300 whitespace-pre-wrap">{inquiry.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium mb-2">Convert to Client</h4>
                        <p className="text-gray-400 text-sm">Choose how they found you:</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {ACQUISITION_SOURCES.slice(0, 6).map((source) => (
                          <button
                            key={source.value}
                            onClick={() => convertToClient(inquiry, source.value)}
                            disabled={convertingId === inquiry.id}
                            className="btn btn-primary text-sm disabled:opacity-50"
                          >
                            {convertingId === inquiry.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Converting...
                              </>
                            ) : (
                              <>
                                <UserPlus size={14} />
                                {source.label}
                              </>
                            )}
                          </button>
                        ))}
                        
                        {/* More sources dropdown */}
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              convertToClient(inquiry, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          disabled={convertingId === inquiry.id}
                          className="px-3 py-2 bg-gray-700 text-white text-sm rounded-lg border border-gray-600"
                        >
                          <option value="">More sources...</option>
                          {ACQUISITION_SOURCES.slice(6).map((source) => (
                            <option key={source.value} value={source.value}>
                              {source.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {inquiries.length > 0 && (
            <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Inquiry Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-light text-green-400">{inquiries.filter(i => i.status === 'new').length}</p>
                  <p className="text-sm text-gray-400">New</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-yellow-400">{inquiries.filter(i => i.status === 'contacted').length}</p>
                  <p className="text-sm text-gray-400">Contacted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-blue-400">{inquiries.filter(i => i.status === 'converted').length}</p>
                  <p className="text-sm text-gray-400">Converted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-white">{inquiries.length}</p>
                  <p className="text-sm text-gray-400">Total</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 flex gap-4">
            <Link href="/crm" className="btn btn-secondary">
              Back to Dashboard
            </Link>
            <Link href="/crm/clients" className="btn btn-primary">
              View All Clients
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}