import React, { useState, useEffect } from 'react';
import IntranetLayout from '../../../components/intranet/IntranetLayout';
import ProtectedRoute from '../../../components/security/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserPermissions } from '../../../lib/permissions';
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Target,
  Shield,
  TrendingUp,
  CheckCircle,
  Clock,
  Play,
  Star,
  ArrowRight,
  Activity,
  Trophy
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  requiredRoles: string[];
  completed: boolean;
  progress: number;
  href: string;
}

export default function TrainingDashboard() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('agent');
  const [trainingStats, setTrainingStats] = useState({
    completedModules: 0,
    totalModules: 0,
    hoursCompleted: 0,
    certificationsEarned: 0,
    currentStreak: 0,
    overallProgress: 0
  });

  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);

  useEffect(() => {
    if (user) {
      loadUserPermissions();
      loadTrainingData();
    }
  }, [user]);

  const loadUserPermissions = async () => {
    if (!user) return;
    try {
      const permissions = await getUserPermissions(user.uid);
      setUserRole(permissions.role);
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  };

  const loadTrainingData = async () => {
    // Mock training data based on role
    const allModules: TrainingModule[] = [
      {
        id: '1',
        title: 'Sales Fundamentals',
        description: 'Master the basics of effective selling and customer engagement',
        duration: '2 hours',
        difficulty: 'Beginner',
        category: 'Sales',
        requiredRoles: ['agent', 'manager', 'admin', 'owner'],
        completed: true,
        progress: 100,
        href: '/intranet/training/sales-fundamentals'
      },
      {
        id: '2',
        title: 'Customer Relations Excellence',
        description: 'Build lasting relationships with clients and prospects',
        duration: '1.5 hours',
        difficulty: 'Beginner',
        category: 'Customer Service',
        requiredRoles: ['agent', 'manager', 'admin', 'owner'],
        completed: false,
        progress: 65,
        href: '/intranet/training/customer-relations'
      },
      {
        id: '3',
        title: 'Advanced Sales Techniques',
        description: 'Learn advanced strategies for closing complex deals',
        duration: '3 hours',
        difficulty: 'Advanced',
        category: 'Sales',
        requiredRoles: ['agent', 'manager', 'admin', 'owner'],
        completed: false,
        progress: 0,
        href: '/intranet/training/advanced-sales'
      },
      {
        id: '4',
        title: 'Account Management Mastery',
        description: 'Manage client relationships and drive account growth',
        duration: '2.5 hours',
        difficulty: 'Intermediate',
        category: 'Account Management',
        requiredRoles: ['manager', 'admin', 'owner'],
        completed: false,
        progress: 30,
        href: '/intranet/training/account-management'
      },
      {
        id: '5',
        title: 'Leadership & Team Building',
        description: 'Develop leadership skills and build high-performing teams',
        duration: '4 hours',
        difficulty: 'Advanced',
        category: 'Leadership',
        requiredRoles: ['manager', 'admin', 'owner'],
        completed: false,
        progress: 0,
        href: '/intranet/training/leadership'
      },
      {
        id: '6',
        title: 'System Administration',
        description: 'Manage user permissions, system settings, and security',
        duration: '3.5 hours',
        difficulty: 'Advanced',
        category: 'Administration',
        requiredRoles: ['admin', 'owner'],
        completed: false,
        progress: 0,
        href: '/intranet/training/system-admin'
      }
    ];

    // Filter modules based on user role
    const roleFilteredModules = allModules.filter(module => 
      module.requiredRoles.includes(userRole)
    );

    setTrainingModules(roleFilteredModules);

    // Calculate stats
    const completed = roleFilteredModules.filter(m => m.completed).length;
    const totalProgress = roleFilteredModules.reduce((sum, m) => sum + m.progress, 0);
    const overallProgress = Math.round(totalProgress / roleFilteredModules.length);

    setTrainingStats({
      completedModules: completed,
      totalModules: roleFilteredModules.length,
      hoursCompleted: completed * 2.5, // Approximate
      certificationsEarned: Math.floor(completed / 2),
      currentStreak: 7,
      overallProgress
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sales': return Target;
      case 'Customer Service': return Users;
      case 'Account Management': return TrendingUp;
      case 'Leadership': return Shield;
      case 'Administration': return Shield;
      default: return BookOpen;
    }
  };

  const roleBasedRecommendations = {
    agent: 'Focus on Sales Fundamentals and Customer Relations to improve your conversion rates.',
    manager: 'Complete Leadership training to enhance your team management skills.',
    admin: 'System Administration training will help you manage the platform more effectively.',
    owner: 'Consider completing all modules to understand every aspect of your business operations.'
  };

  return (
    <ProtectedRoute>
      <IntranetLayout title="Training & Development">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-800 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Welcome to Training & Development! 📚
                </h2>
                <p className="text-indigo-100">
                  Enhance your skills and advance your career with our comprehensive training programs.
                </p>
              </div>
              <GraduationCap className="w-12 h-12 text-indigo-200" />
            </div>
          </div>

          {/* Training Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Modules</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {trainingStats.completedModules}/{trainingStats.totalModules}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {Math.round((trainingStats.completedModules / trainingStats.totalModules) * 100)}% Complete
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hours Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{trainingStats.hoursCompleted}</p>
                  <p className="text-sm text-blue-600 mt-1">Learning time</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Certifications</p>
                  <p className="text-3xl font-bold text-gray-900">{trainingStats.certificationsEarned}</p>
                  <p className="text-sm text-purple-600 mt-1">Earned</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Learning Streak</p>
                  <p className="text-3xl font-bold text-gray-900">{trainingStats.currentStreak}</p>
                  <p className="text-sm text-orange-600 mt-1">Days</p>
                </div>
                <Trophy className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Training Modules */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Available Training Modules</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4" />
                  <span>{trainingStats.overallProgress}% Overall Progress</span>
                </div>
              </div>

              <div className="space-y-4">
                {trainingModules.map((module) => {
                  const CategoryIcon = getCategoryIcon(module.category);
                  return (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            module.category === 'Sales' ? 'bg-blue-100' :
                            module.category === 'Customer Service' ? 'bg-green-100' :
                            module.category === 'Account Management' ? 'bg-purple-100' :
                            module.category === 'Leadership' ? 'bg-orange-100' :
                            'bg-gray-100'
                          }`}>
                            <CategoryIcon className={`w-5 h-5 ${
                              module.category === 'Sales' ? 'text-blue-600' :
                              module.category === 'Customer Service' ? 'text-green-600' :
                              module.category === 'Account Management' ? 'text-purple-600' :
                              module.category === 'Leadership' ? 'text-orange-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{module.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{module.duration}</span>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(module.difficulty)}`}>
                                {module.difficulty}
                              </span>
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                {module.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {module.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <a
                              href={module.href}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              <Play className="w-3 h-3" />
                              <span>Continue</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900 font-medium">{module.progress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              module.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Role-Based Recommendation */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-medium text-gray-900">Recommended for {userRole}s</h4>
                </div>
                <p className="text-sm text-gray-700">
                  {roleBasedRecommendations[userRole as keyof typeof roleBasedRecommendations]}
                </p>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">Recent Achievements</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Trophy className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sales Champion</p>
                      <p className="text-xs text-gray-500">Completed Sales Fundamentals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Award className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Learning Streak</p>
                      <p className="text-xs text-gray-500">7 days in a row</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">Training Resources</h4>
                <div className="space-y-2">
                  <a
                    href="/intranet/training/library"
                    className="flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Training Library</span>
                  </a>
                  <a
                    href="/intranet/training/certifications"
                    className="flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <Award className="w-4 h-4" />
                    <span>Certifications</span>
                  </a>
                  <a
                    href="/intranet/training/progress"
                    className="flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Progress Report</span>
                  </a>
                  <button className="flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md w-full text-left">
                    <Users className="w-4 h-4" />
                    <span>Study Groups</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}