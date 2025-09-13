import React from 'react';
import IntranetLayout from '../../../components/intranet/IntranetLayout';
import ProtectedRoute from '../../../components/security/ProtectedRoute';
import {
  Award,
  Calendar,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Star,
  Trophy
} from 'lucide-react';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  earnedDate?: string;
  expiryDate?: string;
  status: 'earned' | 'in-progress' | 'available';
  progress?: number;
  description: string;
  credentialId?: string;
}

export default function Certifications() {
  const certifications: Certification[] = [
    {
      id: '1',
      title: 'Sales Professional Certificate',
      issuer: 'Upface Academy',
      earnedDate: '2024-01-15',
      expiryDate: '2026-01-15',
      status: 'earned',
      description: 'Advanced sales techniques and customer relationship management',
      credentialId: 'UF-SP-2024-001'
    },
    {
      id: '2',
      title: 'Customer Service Excellence',
      issuer: 'Upface Academy',
      status: 'in-progress',
      progress: 75,
      description: 'Comprehensive customer service and support training'
    },
    {
      id: '3',
      title: 'Leadership Fundamentals',
      issuer: 'Upface Academy',
      status: 'available',
      description: 'Core leadership skills and team management principles'
    },
    {
      id: '4',
      title: 'Digital Marketing Certified',
      issuer: 'Marketing Institute',
      earnedDate: '2023-11-20',
      expiryDate: '2025-11-20',
      status: 'earned',
      description: 'Digital marketing strategies and campaign management',
      credentialId: 'MI-DM-2023-156'
    }
  ];

  const earnedCerts = certifications.filter(cert => cert.status === 'earned');
  const inProgressCerts = certifications.filter(cert => cert.status === 'in-progress');
  const availableCerts = certifications.filter(cert => cert.status === 'available');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'earned': return CheckCircle;
      case 'in-progress': return Clock;
      case 'available': return Award;
      default: return Award;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'earned': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'available': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <ProtectedRoute>
      <IntranetLayout title="Certifications">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
              <p className="text-gray-600 mt-1">Track your professional certifications and achievements</p>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{earnedCerts.length}</p>
                <p className="text-sm text-gray-600">Earned</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{earnedCerts.length}</p>
                  <p className="text-sm text-gray-600">Earned Certifications</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{inProgressCerts.length}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Award className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{availableCerts.length}</p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earned Certifications */}
          {earnedCerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Earned Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {earnedCerts.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{cert.title}</h4>
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                          {cert.credentialId && (
                            <p className="text-xs text-gray-500 mt-1">ID: {cert.credentialId}</p>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Certified
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Earned: {cert.earnedDate}</span>
                        </div>
                        {cert.expiryDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Expires: {cert.expiryDate}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Certifications */}
          {inProgressCerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">In Progress</h3>
              <div className="space-y-4">
                {inProgressCerts.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{cert.title}</h4>
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {cert.progress}% Complete
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                    
                    {cert.progress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900 font-medium">{cert.progress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${cert.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Continue Training
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Certifications */}
          {availableCerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCerts.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Award className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{cert.title}</h4>
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Available
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{cert.description}</p>
                    
                    <div className="flex justify-end">
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
                        Start Training
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}