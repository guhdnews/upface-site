import Layout from '../../../components/Layout';
import Link from 'next/link';
import { useState } from 'react';
import { 
  ChevronLeft, 
  Crown, 
  CheckSquare, 
  TrendingUp,
  Target,
  DollarSign,
  Download,
  Printer
} from 'lucide-react';

const chapters = [
  {
    id: 1,
    title: 'Strategic Planning',
    sections: ['Vision & Mission', 'Market Analysis', 'Growth Strategy']
  },
  {
    id: 2,
    title: 'Financial Management',
    sections: ['Revenue Tracking', 'Cost Management', 'Profitability Analysis']
  },
  {
    id: 3,
    title: 'Team Leadership',
    sections: ['Performance Management', 'Culture Development', 'Scaling Operations']
  }
];

export default function OwnerManual() {
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
    <Layout title="Business Owner Manual - Upface">
      <section className="py-16 bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/training" className="text-gray-400 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Business Owner Manual</h1>
                <p className="text-gray-400">Strategic Leadership & Growth Direction</p>
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
                          ? 'border-red-500 bg-red-500/10 text-white'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-bold ${
                          currentChapter === chap.id ? 'text-red-400' : 'text-gray-500'
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
            <h2 className="text-2xl font-bold text-white mb-4">Chapter 1: Strategic Planning</h2>
            <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">👑 Your Vision</h3>
              <p className="text-red-700">As the Business Owner, you set the strategic direction for Upface.dev. Your decisions shape the company culture, market position, and long-term success.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <Target className="w-12 h-12 text-red-400 mb-4" />
              <h4 className="text-white font-semibold mb-3">Strategic Vision</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Market positioning</li>
                <li>• Competitive advantage</li>
                <li>• Long-term goals</li>
                <li>• Growth opportunities</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <DollarSign className="w-12 h-12 text-green-400 mb-4" />
              <h4 className="text-white font-semibold mb-3">Financial Control</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Revenue optimization</li>
                <li>• Cost management</li>
                <li>• Investment decisions</li>
                <li>• Profitability analysis</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <TrendingUp className="w-12 h-12 text-blue-400 mb-4" />
              <h4 className="text-white font-semibold mb-3">Growth Management</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Team scaling</li>
                <li>• Process optimization</li>
                <li>• Market expansion</li>
                <li>• Innovation strategy</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-4">Current Business Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">$2.5M</div>
                <div className="text-gray-400 text-sm">Annual Revenue Target</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">25%</div>
                <div className="text-gray-400 text-sm">Growth Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">15</div>
                <div className="text-gray-400 text-sm">Team Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">95%</div>
                <div className="text-gray-400 text-sm">Client Satisfaction</div>
              </div>
            </div>
          </div>

          <ChecklistBox 
            title="Strategic Leadership Essentials"
            items={[
              'Review and update company vision quarterly',
              'Monitor key performance indicators daily',
              'Conduct monthly team performance reviews',
              'Analyze market trends and competitive landscape',
              'Plan resource allocation and growth investments'
            ]}
          />
        </div>
      );

    default:
      return (
        <div className="text-center py-16">
          <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
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
    <div className="bg-red-900/30 border border-red-500 rounded-lg p-6">
      <h4 className="text-red-300 font-semibold mb-4 flex items-center">
        <CheckSquare className="w-5 h-5 mr-2" />
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-red-100 text-sm flex items-center">
            <span className="mr-3 text-red-400">□</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}