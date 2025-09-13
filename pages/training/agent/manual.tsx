import Layout from '../../../components/Layout';
import Link from 'next/link';
import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckSquare, 
  Download,
  Printer
} from 'lucide-react';

const chapters = [
  {
    id: 1,
    title: 'Foundation & Philosophy',
    sections: ['The HELP Framework', 'Target Client Profile', 'Success Metrics']
  },
  {
    id: 2,
    title: 'Prospect Identification System',
    sections: ['BANT Qualification', 'Daily Prospecting Routine', 'Research & Data Collection']
  },
  {
    id: 3,
    title: 'Cold Outreach Scripts & Templates',
    sections: ['Email Mastery', 'LinkedIn Strategies', 'Phone Scripts']
  },
  {
    id: 4,
    title: 'Objection Handling Mastery',
    sections: ['Common Objections', 'Response Scripts', 'Advanced Techniques']
  },
  {
    id: 5,
    title: 'Conversation Management',
    sections: ['Discovery Questions', 'Active Listening', 'Closing Techniques']
  },
  {
    id: 6,
    title: 'Long-Term Relationship Building',
    sections: ['Follow-up Systems', 'Value-Add Touchpoints', 'Referral Generation']
  }
];

export default function AgentManual() {
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
    <Layout title="Sales Agent Training Manual - Upface">
      <section className="py-16 bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/training" className="text-gray-400 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Sales Agent Training Manual</h1>
                <p className="text-gray-400">Relationship-Driven Sales Success</p>
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
                          ? 'border-green-500 bg-green-500/10 text-white'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-bold ${
                          currentChapter === chap.id ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {chap.id}
                        </span>
                        <span className="text-sm font-medium">{chap.title}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Progress Indicator */}
                <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Progress</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Completed Sections</span>
                      <span className="text-green-400">{completedSections.length}/18</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedSections.length / 18) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
                {renderChapterContent(currentChapter, completedSections, toggleSection)}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
                  disabled={currentChapter === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Chapter
                </button>
                <button
                  onClick={() => setCurrentChapter(Math.min(6, currentChapter + 1))}
                  disabled={currentChapter === 6}
                  className="btn btn-primary disabled:opacity-50"
                >
                  Next Chapter
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function renderChapterContent(chapterNum: number, completed: string[], toggleSection: (section: string) => void) {
  switch (chapterNum) {
    case 1:
      return (
        <div className="space-y-8">
          <div className="border-b border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Chapter 1: Foundation & Philosophy</h2>
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-800 font-semibold mb-2">🎯 Our Mission</h3>
              <p className="text-yellow-700">To empower local businesses with websites that drive real results while building lasting partnerships that benefit everyone involved.</p>
            </div>
          </div>

          {/* The HELP Framework */}
          <div className="space-y-4">
            <SectionHeader 
              title="The HELP Framework"
              completed={completed.includes('help-framework')}
              onToggle={() => toggleSection('help-framework')}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <span className="bg-blue-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">H</span>
                  Honest Communication
                </h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Always tell the truth about capabilities and timelines</li>
                  <li>• Admit when you don&apos;t know something</li>
                  <li>• Set realistic expectations</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <span className="bg-green-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">E</span>
                  Empathetic Listening
                </h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Understand their business challenges deeply</li>
                  <li>• Listen more than you speak</li>
                  <li>• Acknowledge their concerns and frustrations</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <span className="bg-purple-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">L</span>
                  Lead with Value
                </h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Provide useful insights in every interaction</li>
                  <li>• Share relevant tips and resources</li>
                  <li>• Help them whether they work with us or not</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <span className="bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">P</span>
                  Partnership Mindset
                </h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Think long-term relationship, not single transaction</li>
                  <li>• Consider what&apos;s best for their business</li>
                  <li>• Build trust through consistent follow-through</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Target Client Profile */}
          <div className="space-y-4">
            <SectionHeader 
              title="Understanding Our Target Client"
              completed={completed.includes('target-client')}
              onToggle={() => toggleSection('target-client')}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Ideal Client Profile</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li><strong>Business Type:</strong> Local service businesses (restaurants, contractors, salons, etc.)</li>
                  <li><strong>Revenue Range:</strong> $50K - $500K annually</li>
                  <li><strong>Employee Count:</strong> 3-25 employees</li>
                  <li><strong>Website Issues:</strong> Outdated, slow, or non-mobile-friendly</li>
                  <li><strong>Decision Maker:</strong> Business owner or marketing manager</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Common Pain Points</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Website doesn&apos;t generate leads</li>
                  <li>• Poor mobile experience losing customers</li>
                  <li>• Not ranking well in local search</li>
                  <li>• Outdated design hurting credibility</li>
                  <li>• Difficult to update or maintain</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success Metrics */}
          <div className="space-y-4">
            <SectionHeader 
              title="Success Metrics & Expectations"
              completed={completed.includes('success-metrics')}
              onToggle={() => toggleSection('success-metrics')}
            />
            
            <div className="bg-gray-800 rounded-lg p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-white font-semibold py-3">Metric</th>
                    <th className="text-left text-white font-semibold py-3">Week 1-2</th>
                    <th className="text-left text-white font-semibold py-3">Week 3-4</th>
                    <th className="text-left text-white font-semibold py-3">Month 2+</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Prospects Identified</td>
                    <td className="py-3">25/week</td>
                    <td className="py-3">50/week</td>
                    <td className="py-3">75+/week</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Outreach Messages</td>
                    <td className="py-3">25/week</td>
                    <td className="py-3">50/week</td>
                    <td className="py-3">75+/week</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Response Rate</td>
                    <td className="py-3">10-15%</td>
                    <td className="py-3">15-20%</td>
                    <td className="py-3">20-25%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">Discovery Calls</td>
                    <td className="py-3">2-3/week</td>
                    <td className="py-3">5-8/week</td>
                    <td className="py-3">10+/week</td>
                  </tr>
                  <tr>
                    <td className="py-3">Projects Closed</td>
                    <td className="py-3">0-1/month</td>
                    <td className="py-3">2-3/month</td>
                    <td className="py-3">5+/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <ChecklistBox 
            title="Foundation Checklist"
            items={[
              'Read and understand the HELP framework',
              'Memorize ideal client profile characteristics',
              'List 10 local businesses that fit our target profile',
              'Set up your daily schedule for prospecting activities',
              'Review success metrics and set personal goals'
            ]}
          />
        </div>
      );

    case 2:
      return (
        <div className="space-y-8">
          <div className="border-b border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Chapter 2: Prospect Identification System</h2>
            <p className="text-gray-400">Master the art of finding and qualifying high-potential prospects using our proven BANT system.</p>
          </div>

          {/* BANT System */}
          <div className="space-y-4">
            <SectionHeader 
              title="The BANT Qualification System"
              completed={completed.includes('bant-system')}
              onToggle={() => toggleSection('bant-system')}
            />
            
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 mb-6">
              <h4 className="text-blue-800 font-semibold mb-2">🎯 Prospect Prioritization</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li><strong>30+ Total Score:</strong> High priority - contact immediately</li>
                <li><strong>25-29 Total Score:</strong> Medium priority - contact within 3 days</li>
                <li><strong>20-24 Total Score:</strong> Low priority - nurture campaign</li>
                <li><strong>Under 20:</strong> Re-evaluate quarterly</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Budget (Score 1-10)</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li><strong>10 points:</strong> Recently mentioned website budget</li>
                  <li><strong>7-9 points:</strong> Revenue suggests $3K+ budget capacity</li>
                  <li><strong>4-6 points:</strong> Small but growing business</li>
                  <li><strong>1-3 points:</strong> Very small operation</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Authority (Score 1-10)</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li><strong>10 points:</strong> Business owner, CEO, or founder</li>
                  <li><strong>7-9 points:</strong> Marketing/Operations Manager</li>
                  <li><strong>4-6 points:</strong> Manager who influences decisions</li>
                  <li><strong>1-3 points:</strong> Employee with no decision authority</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Need (Score 1-10)</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li><strong>10 points:</strong> Website broken or non-existent</li>
                  <li><strong>7-9 points:</strong> Clearly outdated/poor UX</li>
                  <li><strong>4-6 points:</strong> Decent but missing optimization</li>
                  <li><strong>1-3 points:</strong> Recently updated, professional</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Timeline (Score 1-10)</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li><strong>10 points:</strong> Actively seeking website help</li>
                  <li><strong>7-9 points:</strong> Recent business changes</li>
                  <li><strong>4-6 points:</strong> Open to improvements</li>
                  <li><strong>1-3 points:</strong> No immediate need indicators</li>
                </ul>
              </div>
            </div>
          </div>

          <ChecklistBox 
            title="Chapter 2 Completion Checklist"
            items={[
              'Understand BANT scoring system',
              'Set up daily prospecting routine',
              'Configure all free tools and accounts',
              'Complete research on 10 practice prospects',
              'Fill out prospect profile templates for each',
              'Ready to begin outreach activities'
            ]}
          />
        </div>
      );

    default:
      return (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2">Chapter {chapterNum}</h3>
          <p className="text-gray-400 mb-6">Content for this chapter is being developed.</p>
          <Link href="/training" className="btn btn-primary">
            Back to Training Center
          </Link>
        </div>
      );
  }
}

function SectionHeader({ title, completed, onToggle }: { title: string, completed: boolean, onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <CheckSquare 
        className={`w-6 h-6 transition-colors ${completed ? 'text-green-400' : 'text-gray-500'}`}
        fill={completed ? 'currentColor' : 'none'}
      />
    </button>
  );
}

function ChecklistBox({ title, items }: { title: string, items: string[] }) {
  return (
    <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6">
      <h4 className="text-blue-300 font-semibold mb-4 flex items-center">
        <CheckSquare className="w-5 h-5 mr-2" />
        {title}
      </h4>
      <p className="text-blue-200 text-sm mb-4">Complete these items before proceeding to the next chapter:</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-blue-100 text-sm flex items-center">
            <span className="mr-3 text-blue-400">□</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}