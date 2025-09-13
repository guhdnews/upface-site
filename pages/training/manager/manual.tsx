import Layout from '../../../components/Layout';
import Link from 'next/link';
import { useState } from 'react';
import ProtectedRoute from '../../../components/security/ProtectedRoute';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  CheckSquare, 
  Download,
  Printer
} from 'lucide-react';

const chapters = [
  {
    id: 1,
    title: 'Client Handover Process',
    sections: ['Transition Protocol', 'Initial Client Meeting', 'Project Kickoff']
  },
  {
    id: 2,
    title: 'Project Management Systems',
    sections: ['Timeline Management', 'Resource Allocation', 'Quality Control']
  },
  {
    id: 3,
    title: 'Advanced Objection Handling',
    sections: ['Complex Negotiations', 'Stakeholder Management', 'Conflict Resolution']
  },
  {
    id: 4,
    title: 'Upselling & Cross-selling',
    sections: ['Opportunity Identification', 'Value Communication', 'Contract Expansion']
  },
  {
    id: 5,
    title: 'Client Retention Strategies',
    sections: ['Satisfaction Monitoring', 'Proactive Support', 'Renewal Management']
  },
  {
    id: 6,
    title: 'Team Coordination',
    sections: ['Leadership Skills', 'Developer Relations', 'Performance Management']
  }
];

export default function ManagerManual() {
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
    <ProtectedRoute requiredPermissions={['training.manager']}>
      <Layout title="Account Manager Training Manual - Upface">
        <section className="py-16 bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/training" className="text-gray-400 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Account Manager Training Manual</h1>
                <p className="text-gray-400">Client Success & Project Excellence</p>
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
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-bold ${
                          currentChapter === chap.id ? 'text-blue-400' : 'text-gray-500'
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
                      <span className="text-blue-400">{completedSections.length}/18</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
    </ProtectedRoute>
  );
}

function renderChapterContent(chapterNum: number, completed: string[], toggleSection: (section: string) => void) {
  switch (chapterNum) {
    case 1:
      return (
        <div className="space-y-8">
          <div className="border-b border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Chapter 1: Client Handover Process</h2>
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 mb-6">
              <h3 className="text-blue-800 font-semibold mb-2">🎯 Your Role</h3>
              <p className="text-blue-700">As an Account Manager, you bridge the gap between sales and delivery. You ensure smooth transitions, manage client expectations, and drive project success from start to finish.</p>
            </div>
          </div>

          {/* Transition Protocol */}
          <div className="space-y-4">
            <SectionHeader 
              title="Transition Protocol"
              completed={completed.includes('transition-protocol')}
              onToggle={() => toggleSection('transition-protocol')}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Pre-Handover Preparation</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Review complete sales conversation history</li>
                  <li>• Understand client goals and expectations</li>
                  <li>• Identify potential challenges or concerns</li>
                  <li>• Prepare project timeline and milestones</li>
                  <li>• Set up project management systems</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Handover Meeting Agenda</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Introduction and role transition</li>
                  <li>• Project scope and timeline review</li>
                  <li>• Communication preferences</li>
                  <li>• Next steps and immediate actions</li>
                  <li>• Q&A and expectation alignment</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Initial Client Meeting */}
          <div className="space-y-4">
            <SectionHeader 
              title="Initial Client Meeting"
              completed={completed.includes('initial-meeting')}
              onToggle={() => toggleSection('initial-meeting')}
            />
            
            <div className="bg-green-900/30 border border-green-500 rounded-lg p-6">
              <h4 className="text-green-300 font-semibold mb-3">Meeting Script Template</h4>
              <div className="text-green-100 text-sm space-y-3">
                <p><strong>&quot;Hi [Client Name], I&apos;m excited to be working with you on this project. I&apos;ve reviewed everything with [Sales Agent] and I&apos;m here to ensure we exceed your expectations.&quot;</strong></p>
                <p><strong>&quot;Let me walk you through our process and timeline, and please feel free to ask any questions along the way.&quot;</strong></p>
                <p><strong>&quot;My goal is to be your dedicated partner throughout this journey, ensuring clear communication and exceptional results.&quot;</strong></p>
              </div>
            </div>
          </div>

          {/* Project Kickoff */}
          <div className="space-y-4">
            <SectionHeader 
              title="Project Kickoff"
              completed={completed.includes('project-kickoff')}
              onToggle={() => toggleSection('project-kickoff')}
            />
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-4">Kickoff Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-blue-400 font-medium mb-2">Technical Setup</h5>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Project management tool access</li>
                    <li>• Communication channels established</li>
                    <li>• Development environment setup</li>
                    <li>• Asset collection and organization</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-blue-400 font-medium mb-2">Stakeholder Alignment</h5>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Decision maker identification</li>
                    <li>• Approval process clarification</li>
                    <li>• Regular meeting schedule</li>
                    <li>• Emergency contact procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <ChecklistBox 
            title="Chapter 1 Completion Checklist"
            items={[
              'Understand the complete handover protocol',
              'Practice initial client meeting script',
              'Set up project management templates',
              'Create stakeholder contact lists',
              'Prepare kickoff meeting agenda template'
            ]}
          />
        </div>
      );

    case 2:
      return (
        <div className="space-y-8">
          <div className="border-b border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Chapter 2: Project Management Systems</h2>
            <p className="text-gray-400">Master the tools and processes that ensure on-time, on-budget project delivery while maintaining client satisfaction.</p>
          </div>

          {/* Timeline Management */}
          <div className="space-y-4">
            <SectionHeader 
              title="Timeline Management"
              completed={completed.includes('timeline-management')}
              onToggle={() => toggleSection('timeline-management')}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">Week 1</div>
                <div className="text-white font-medium mb-2">Discovery & Planning</div>
                <div className="text-gray-400 text-sm">Requirements gathering, wireframes, content strategy</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">Week 2-3</div>
                <div className="text-white font-medium mb-2">Design & Development</div>
                <div className="text-gray-400 text-sm">Visual design, development, content integration</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">Week 4</div>
                <div className="text-white font-medium mb-2">Testing & Launch</div>
                <div className="text-gray-400 text-sm">Quality assurance, client review, deployment</div>
              </div>
            </div>
          </div>

          <ChecklistBox 
            title="Chapter 2 Completion Checklist"
            items={[
              'Master project timeline templates',
              'Set up resource allocation systems',
              'Implement quality control processes',
              'Practice stakeholder communication',
              'Create project tracking dashboards'
            ]}
          />
        </div>
      );

    default:
      return (
        <div className="text-center py-16">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
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
        className={`w-6 h-6 transition-colors ${completed ? 'text-blue-400' : 'text-gray-500'}`}
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