import Layout from '../../../components/Layout';
import LeadDashboard from '../../../components/crm/LeadDashboard';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';

export default function LeadsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="section section--black">
          <div className="section-container">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="section section--black">
          <div className="section-container text-center">
            <h1>Access Denied</h1>
            <p className="text-large mb-6">Please log in to access lead management.</p>
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Lead Management - Upface CRM">
      <div className="section section--black min-h-screen">
        <div className="section-container">
          <LeadDashboard />
        </div>
      </div>
    </Layout>
  );
}