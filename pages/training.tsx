import Layout from '../components/Layout';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Users, 
  Download, 
  BookOpen, 
  Target, 
  TrendingUp,
  Shield,
  Settings,
  Crown,
  ChevronRight,
  Play,
  CheckCircle
} from 'lucide-react';

const roleData = {
  agent: {
    title: 'Sales Agent Training',
    description: 'Master relationship-driven sales and prospect management',
    icon: <Users className="w-8 h-8" />,
    color: 'green',
    modules: [
      'Foundation & Philosophy',
      'Prospect Identification System',
      'Cold Outreach Scripts & Templates',
      'Objection Handling Mastery',
      'Conversation Management',
      'Client-Agent Simulation'
    ]
  },
  manager: {
    title: 'Account Manager Training',
    description: 'Lead client relationships and project delivery excellence',
    icon: <Target className="w-8 h-8" />,
    color: 'blue',
    modules: [
      'Client Handover Process',
      'Project Management Systems',
      'Advanced Objection Handling',
      'Upselling & Cross-selling',
      'Client Retention Strategies',
      'Team Coordination'
    ]
  },
  admin: {
    title: 'Administrator Training',
    description: 'System administration and team oversight',
    icon: <Shield className="w-8 h-8" />,
    color: 'purple',
    modules: [
      'Platform Administration',
      'User Management',
      'Analytics & Reporting',
      'Quality Assurance',
      'Process Optimization',
      'Compliance & Security'
    ]
  },
  owner: {
    title: 'Business Owner Manual',
    description: 'Strategic oversight and business growth guidance',
    icon: <Crown className="w-8 h-8" />,
    color: 'red',
    modules: [
      'Strategic Planning',
      'Financial Management',
      'Team Leadership',
      'Market Analysis',
      'Growth Strategies',
      'Vision & Direction'
    ]
  }
};

export default function Training() {
  const [selectedRole, setSelectedRole] = useState<string>('agent');
  const [activeModule, setActiveModule] = useState<number | null>(null);

  const currentRole = roleData[selectedRole as keyof typeof roleData];

  return (
    <Layout title="Sales Training - Upface">
      <section className="py-32 bg-black min-h-screen">
        <div className="section-container">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-light text-white mb-8">
              Sales Training Center
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Comprehensive training materials and resources for every role at Upface.dev
            </p>
          </div>

          {/* Role Selection */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-light text-white text-center mb-8">Select Your Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(roleData).map(([role, data]) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-6 border-2 rounded-xl transition-all duration-300 text-left ${
                    selectedRole === role
                      ? `border-${data.color}-500 bg-${data.color}-500/10`
                      : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                  }`}
                >
                  <div className={`text-${data.color}-400 mb-4`}>
                    {data.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{data.title}</h3>
                  <p className="text-gray-400 text-sm">{data.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Training Content */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Module List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 sticky top-8">
                <h3 className="text-xl font-semibold text-white mb-6">Training Modules</h3>
                <div className="space-y-3">
                  {currentRole.modules.map((module, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveModule(activeModule === index ? null : index)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        activeModule === index
                          ? `border-${currentRole.color}-500 bg-${currentRole.color}-500/10`
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">{module}</span>
                        <ChevronRight 
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            activeModule === index ? 'rotate-90' : ''
                          }`} 
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <Link 
                    href={`/training/${selectedRole}/manual`} 
                    className={`btn bg-${currentRole.color}-600 hover:bg-${currentRole.color}-700 text-white border-${currentRole.color}-600`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Full Manual
                  </Link>
                  <button className="btn btn-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button className="btn btn-secondary">
                    <Play className="w-4 h-4 mr-2" />
                    Start Training
                  </button>
                </div>

                {/* Role-Specific Content */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      {currentRole.title} Overview
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6">
                      {getRoleDescription(selectedRole)}
                    </p>
                  </div>

                  {/* Key Skills */}
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-4">Key Skills & Competencies</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getRoleSkills(selectedRole).map((skill, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className={`w-5 h-5 text-${currentRole.color}-400 flex-shrink-0`} />
                          <span className="text-gray-300">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Training Path */}
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-4">Training Timeline</h4>
                    <div className="space-y-4">
                      {getTrainingPath(selectedRole).map((phase, index) => (
                        <div key={index} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-white font-medium">{phase.title}</h5>
                            <span className={`px-2 py-1 text-xs rounded-full bg-${currentRole.color}-600/20 text-${currentRole.color}-300`}>
                              {phase.duration}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{phase.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-4">Additional Resources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link 
                        href="/training/technical-guide" 
                        className="p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                      >
                        <Settings className="w-6 h-6 text-blue-400 mb-2" />
                        <h5 className="text-white font-medium mb-1">Technical Guide</h5>
                        <p className="text-gray-400 text-sm">Platform setup and technical knowledge</p>
                      </Link>
                      <Link 
                        href="/training/metrics" 
                        className="p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                      >
                        <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                        <h5 className="text-white font-medium mb-1">Performance Metrics</h5>
                        <p className="text-gray-400 text-sm">KPIs and success measurements</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 p-8 border border-gray-700 rounded-xl bg-gray-900/50">
            <h3 className="text-2xl font-light text-white mb-4">Ready to Begin Your Training?</h3>
            <p className="text-gray-400 mb-6">
              Access your personalized training manual and start your journey to sales success.
            </p>
            <Link 
              href={`/training/${selectedRole}/manual`} 
              className={`btn bg-${currentRole.color}-600 hover:bg-${currentRole.color}-700 text-white`}
            >
              Start Training Program
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function getRoleDescription(role: string): string {
  const descriptions = {
    agent: "As a Sales Agent, you are the first point of contact with potential clients. Your role focuses on relationship building, lead qualification, and initial sales conversations. You'll master our value-first approach to create meaningful connections that drive business growth.",
    manager: "Account Managers bridge the gap between sales and delivery. You'll take qualified leads and guide them through the entire client journey, from initial consultation to project completion and ongoing relationship management. Your expertise in project management and client communication is crucial to our success.",
    admin: "Administrators ensure our systems run smoothly and our team operates efficiently. You'll manage user accounts, oversee quality assurance, monitor performance metrics, and maintain the technical infrastructure that supports our sales and delivery processes.",
    owner: "As the Business Owner, you provide strategic direction and vision for the entire organization. This manual covers high-level strategy, financial management, team leadership, and the business intelligence needed to guide Upface.dev toward continued growth and market leadership."
  };
  return descriptions[role as keyof typeof descriptions] || "";
}

function getRoleSkills(role: string): string[] {
  const skills = {
    agent: [
      "Prospect identification and qualification",
      "Cold outreach and engagement",
      "Objection handling and persuasion",
      "CRM management and data tracking",
      "Relationship building and trust development",
      "Sales funnel optimization"
    ],
    manager: [
      "Project management and coordination",
      "Client onboarding and consultation",
      "Advanced sales techniques",
      "Contract negotiation and closure",
      "Team leadership and mentoring",
      "Performance analysis and optimization"
    ],
    admin: [
      "System administration and maintenance",
      "User account management",
      "Data analysis and reporting",
      "Quality assurance and compliance",
      "Process documentation and improvement",
      "Technical troubleshooting"
    ],
    owner: [
      "Strategic planning and vision setting",
      "Financial analysis and budgeting",
      "Market research and competitive analysis",
      "Team building and culture development",
      "Business development and partnerships",
      "Risk management and decision making"
    ]
  };
  return skills[role as keyof typeof skills] || [];
}

function getTrainingPath(role: string): Array<{title: string, duration: string, description: string}> {
  const paths = {
    agent: [
      { title: "Foundation Training", duration: "Week 1-2", description: "Master the HELP framework, understand our sales philosophy, and learn prospect identification" },
      { title: "Outreach Mastery", duration: "Week 3-4", description: "Develop cold outreach skills, practice conversation management, and handle common objections" },
      { title: "Advanced Techniques", duration: "Week 5-6", description: "Refine closing techniques, perfect handover processes, and build long-term relationship skills" },
      { title: "Performance Optimization", duration: "Ongoing", description: "Continuous improvement through metrics analysis, peer learning, and advanced training modules" }
    ],
    manager: [
      { title: "Leadership Fundamentals", duration: "Week 1-2", description: "Learn client management systems, project coordination, and team leadership principles" },
      { title: "Advanced Sales Skills", duration: "Week 3-4", description: "Master complex negotiations, upselling strategies, and client retention techniques" },
      { title: "Operational Excellence", duration: "Week 5-6", description: "Optimize processes, manage team performance, and ensure quality delivery" },
      { title: "Strategic Growth", duration: "Ongoing", description: "Drive business expansion, mentor team members, and contribute to strategic planning" }
    ],
    admin: [
      { title: "System Mastery", duration: "Week 1-2", description: "Learn all platform features, user management, and basic troubleshooting" },
      { title: "Process Management", duration: "Week 3-4", description: "Understand workflows, quality assurance procedures, and performance monitoring" },
      { title: "Advanced Administration", duration: "Week 5-6", description: "Master reporting, analytics, security protocols, and system optimization" },
      { title: "Continuous Improvement", duration: "Ongoing", description: "Identify optimization opportunities, implement improvements, and support business growth" }
    ],
    owner: [
      { title: "Strategic Assessment", duration: "Month 1", description: "Analyze current state, market position, competitive landscape, and growth opportunities" },
      { title: "Vision Development", duration: "Month 2", description: "Define long-term vision, set strategic goals, and develop implementation roadmaps" },
      { title: "Team Optimization", duration: "Month 3", description: "Assess team performance, implement improvements, and establish leadership development" },
      { title: "Growth Execution", duration: "Ongoing", description: "Execute strategic initiatives, monitor performance, and adapt to market changes" }
    ]
  };
  return paths[role as keyof typeof paths] || [];
}