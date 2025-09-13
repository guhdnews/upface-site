import Layout from '../../../components/Layout';
import Link from 'next/link';
import { useState } from 'react';
import { 
  ChevronLeft, 
  Shield, 
  CheckSquare, 
  Settings,
  Users,
  BarChart3,
  Download,
  Printer
} from 'lucide-react';

const chapters = [
  {
    id: 1,
    title: 'Platform Administration',
    sections: ['System Overview', 'User Management', 'Configuration']
  },
  {
    id: 2,
    title: 'Analytics & Reporting',
    sections: ['Performance Metrics', 'Custom Reports', 'Data Analysis']
  },
  {
    id: 3,
    title: 'Quality Assurance',
    sections: ['Process Monitoring', 'Compliance Checks', 'Issue Resolution']
  }
];

export default function AdminManual() {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setCompletedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <Layout title="Administrator Training Manual - Upface">
      <section className="py-16 bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/training" className="text-gray-400 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Administrator Training Manual</h1>
                <p className="text-gray-400">System Management & Operations Excellence</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="btn btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button className="btn btn-secondary">
                <Printer className="w-4 h-4 mr-2" />
                Print Manual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 sticky top-8">
                <h3 className="text-xl font-semibold text-white mb-6">Table of Contents</h3>
                <div className="space-y-2">
                  {chapters.map((chap) => (
                    <button
                      key={chap.id}
                      onClick={() => setCurrentChapter(chap.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        currentChapter === chap.id
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-bold ${
                          currentChapter === chap.id ? 'text-purple-400' : 'text-gray-500'
                        }`}>
                          {chap.id}
                        </span>
                        <span className="text-sm font-medium">{chap.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
                {renderChapterContent(currentChapter)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function renderChapterContent(chapterNum: number) {
  switch (chapterNum) {
    case 1:
      return (
        <div className="space-y-8">
          <div className="border-b border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Chapter 1: Platform Administration</h2>
            <div className="bg-purple-100 border border-purple-400 rounded-lg p-4 mb-6">
              <h3 className="text-purple-800 font-semibold mb-2">🛡️ Your Role</h3>
              <p className="text-purple-700">As an Administrator, you ensure system reliability, user management, and operational excellence. You are the backbone that keeps Upface.dev running smoothly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <Settings className="w-12 h-12 text-purple-400 mb-4" />
              <h4 className="text-white font-semibold mb-3">System Management</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Platform configuration</li>
                <li>• Security protocols</li>
                <li>• Backup management</li>
                <li>• Performance monitoring</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <Users className="w-12 h-12 text-blue-400 mb-4" />
              <h4 className="text-white font-semibold mb-3">User Administration</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Account provisioning</li>
                <li>• Role management</li>
                <li>• Access control</li>
                <li>• User support</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <BarChart3 className="w-12 h-12 text-green-400 mb-4" />
              <h4 className="text-white font-semibold mb-3">Data & Analytics</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Performance reports</li>
                <li>• Usage analytics</li>
                <li>• Quality metrics</li>
                <li>• Business intelligence</li>
              </ul>
            </div>
          </div>

          <ChecklistBox 
            title="Administrator Essentials"
            items={[
              'Master CRM user management interface',
              'Understand all user roles and permissions',
              'Set up monitoring and alert systems',
              'Create backup and recovery procedures',
              'Implement security compliance protocols'
            ]}
          />
        </div>
      );

    default:
      return (
        <div className="text-center py-16">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2">Chapter {chapterNum}</h3>
          <p className="text-gray-400 mb-6">Content for this chapter is being developed.</p>
          <Link href="/training" className="btn btn-primary">
            Back to Training Center
          </Link>
        </div>
      );
  }
}

function ChecklistBox({ title, items }: { title: string, items: string[] }) {
  return (
    <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-6">
      <h4 className="text-purple-300 font-semibold mb-4 flex items-center">
        <CheckSquare className="w-5 h-5 mr-2" />
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-purple-100 text-sm flex items-center">
            <span className="mr-3 text-purple-400">□</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}