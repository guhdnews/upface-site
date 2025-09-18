import React, { useState } from 'react';
import IntranetLayout from '../../../components/intranet/IntranetLayout';
import ProtectedRoute from '../../../components/security/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  User,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  avatar?: string;
  location?: string;
  startDate: string;
  isActive: boolean;
}

export default function DirectoryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [employees] = useState<Employee[]>([
    // Empty array - no fake data
  ]);

  const departments = ['Sales', 'Account Management', 'Operations', 'Executive'];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment && employee.isActive;
  });

  return (
    <ProtectedRoute requiredRoles={['manager', 'admin', 'owner']}>
      <IntranetLayout title="Employee Directory">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
              <p className="text-gray-600 mt-1">Find and connect with team members</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Employee Count */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
              {departmentFilter !== 'all' && ` in ${departmentFilter}`}
            </span>
          </div>

          {/* Employees Grid */}
          {filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500">
                {employees.length === 0 
                  ? "No employees have been added to the directory yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      {employee.avatar ? (
                        <img 
                          src={employee.avatar} 
                          alt={employee.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{employee.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{employee.role}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Building className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{employee.department}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <a 
                            href={`mailto:${employee.email}`}
                            className="text-blue-600 hover:text-blue-800 truncate"
                          >
                            {employee.email}
                          </a>
                        </div>
                        
                        {employee.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <a 
                              href={`tel:${employee.phone}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {employee.phone}
                            </a>
                          </div>
                        )}
                        
                        {employee.location && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{employee.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>Started {new Date(employee.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}