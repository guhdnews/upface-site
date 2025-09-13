import React from 'react';
import IntranetLayout from '../../../components/intranet/IntranetLayout';
import ProtectedRoute from '../../../components/security/ProtectedRoute';
import {
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  BarChart3,
  CheckCircle,
  Activity,
  Zap,
  Users
} from 'lucide-react';

export default function ProgressReport() {
  const monthlyProgress = [
    { month: 'Jan', hours: 12, completions: 2 },
    { month: 'Feb', hours: 18, completions: 3 },
    { month: 'Mar', hours: 24, completions: 4 },
    { month: 'Apr', hours: 15, completions: 2 },
    { month: 'May', hours: 30, completions: 5 },
    { month: 'Jun', hours: 22, completions: 3 }
  ];

  const skillAreas = [
    { name: 'Sales', progress: 85, level: 'Advanced', modules: 8 },
    { name: 'Customer Service', progress: 72, level: 'Intermediate', modules: 6 },
    { name: 'Leadership', progress: 45, level: 'Beginner', modules: 3 },
    { name: 'Communication', progress: 91, level: 'Expert', modules: 12 }
  ];

  const recentAchievements = [
    { title: 'Sales Champion', date: '2024-01-15', type: 'certification' },
    { title: 'Customer Excellence Badge', date: '2024-01-10', type: 'badge' },
    { title: 'Leadership Module Complete', date: '2024-01-05', type: 'completion' },
    { title: '30-Day Learning Streak', date: '2024-01-01', type: 'streak' }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'text-purple-700 bg-purple-100';
      case 'Advanced': return 'text-green-700 bg-green-100';
      case 'Intermediate': return 'text-blue-700 bg-blue-100';
      case 'Beginner': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'certification': return Award;
      case 'badge': return CheckCircle;
      case 'completion': return Target;
      case 'streak': return Zap;
      default: return Award;
    }
  };

  return (
    <ProtectedRoute>
      <IntranetLayout title="Progress Report">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Training Progress Report</h2>
              <p className="text-gray-600 mt-1">Detailed analytics of your learning journey</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-3xl font-bold text-gray-900">121</p>
                  <p className="text-sm text-green-600 mt-1">+12 this month</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Modules Completed</p>
                  <p className="text-3xl font-bold text-gray-900">19</p>
                  <p className="text-sm text-green-600 mt-1">+3 this month</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Certifications</p>
                  <p className="text-3xl font-bold text-gray-900">4</p>
                  <p className="text-sm text-purple-600 mt-1">2 earned</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-3xl font-bold text-gray-900">15</p>
                  <p className="text-sm text-orange-600 mt-1">Days</p>
                </div>
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Progress Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
              <div className="space-y-4">
                {monthlyProgress.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-12">{month.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(month.hours * 3, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{month.hours}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{month.completions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Areas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Development</h3>
              <div className="space-y-4">
                {skillAreas.map((skill, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{skill.modules} modules</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(skill.progress)}`}
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-10">{skill.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentAchievements.map((achievement, index) => {
                const Icon = getAchievementIcon(achievement.type);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      achievement.type === 'certification' ? 'bg-purple-100' :
                      achievement.type === 'badge' ? 'bg-green-100' :
                      achievement.type === 'completion' ? 'bg-blue-100' :
                      'bg-orange-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        achievement.type === 'certification' ? 'text-purple-600' :
                        achievement.type === 'badge' ? 'text-green-600' :
                        achievement.type === 'completion' ? 'text-blue-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{achievement.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Focus on Leadership Development</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Complete 2 more leadership modules to advance to intermediate level
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Activity className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Maintain Your Learning Streak</p>
                  <p className="text-xs text-green-700 mt-1">
                    You're on a 15-day streak! Keep it up to earn the Monthly Streak badge
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <Award className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Certification Opportunity</p>
                  <p className="text-xs text-purple-700 mt-1">
                    You're eligible for the Customer Service Excellence certification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}