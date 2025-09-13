import React, { useState, useEffect } from 'react';
import IntranetLayout from '../../../components/intranet/IntranetLayout';
import ProtectedRoute from '../../../components/security/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import {
  DollarSign,
  Download,
  Calendar,
  Eye,
  Shield,
  Heart,
  Activity,
  Car,
  Umbrella,
  Calculator,
  FileText,
  TrendingUp,
  PiggyBank,
  CreditCard
} from 'lucide-react';

interface PayStub {
  id: string;
  payPeriod: string;
  payDate: string;
  grossPay: number;
  netPay: number;
  taxes: number;
  deductions: number;
  hoursWorked: number;
}

interface Benefit {
  id: string;
  name: string;
  type: 'health' | 'dental' | 'vision' | 'life' | 'disability' | '401k' | 'other';
  provider: string;
  employeeContribution: number;
  employerContribution: number;
  coverage: string;
  status: 'active' | 'pending' | 'declined';
}

export default function PayrollPage() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payStubs] = useState<PayStub[]>([
    {
      id: '1',
      payPeriod: 'Dec 16 - Dec 31, 2024',
      payDate: '2025-01-05',
      grossPay: 4166.67,
      netPay: 3125.50,
      taxes: 875.12,
      deductions: 166.05,
      hoursWorked: 80
    },
    {
      id: '2',
      payPeriod: 'Dec 1 - Dec 15, 2024',
      payDate: '2024-12-20',
      grossPay: 4166.67,
      netPay: 3125.50,
      taxes: 875.12,
      deductions: 166.05,
      hoursWorked: 80
    },
    {
      id: '3',
      payPeriod: 'Nov 16 - Nov 30, 2024',
      payDate: '2024-12-05',
      grossPay: 4166.67,
      netPay: 3125.50,
      taxes: 875.12,
      deductions: 166.05,
      hoursWorked: 80
    }
  ]);

  const [benefits] = useState<Benefit[]>([
    {
      id: '1',
      name: 'Health Insurance',
      type: 'health',
      provider: 'Blue Cross Blue Shield',
      employeeContribution: 150.00,
      employerContribution: 450.00,
      coverage: 'Employee + Family',
      status: 'active'
    },
    {
      id: '2',
      name: 'Dental Insurance',
      type: 'dental',
      provider: 'Delta Dental',
      employeeContribution: 25.00,
      employerContribution: 75.00,
      coverage: 'Employee + Family',
      status: 'active'
    },
    {
      id: '3',
      name: 'Vision Insurance',
      type: 'vision',
      provider: 'VSP',
      employeeContribution: 8.00,
      employerContribution: 12.00,
      coverage: 'Employee Only',
      status: 'active'
    },
    {
      id: '4',
      name: '401(k) Plan',
      type: '401k',
      provider: 'Fidelity',
      employeeContribution: 250.00,
      employerContribution: 125.00,
      coverage: '6% match (up to 3%)',
      status: 'active'
    },
    {
      id: '5',
      name: 'Life Insurance',
      type: 'life',
      provider: 'MetLife',
      employeeContribution: 0,
      employerContribution: 15.00,
      coverage: '1x Annual Salary',
      status: 'active'
    }
  ]);

  const getBenefitIcon = (type: string) => {
    switch (type) {
      case 'health': return Heart;
      case 'dental': return Activity;
      case 'vision': return Eye;
      case 'life': return Shield;
      case '401k': return PiggyBank;
      default: return Umbrella;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalBenefitValue = benefits.reduce((sum, benefit) => 
    sum + benefit.employeeContribution + benefit.employerContribution, 0
  );

  const yearToDateStats = {
    grossPay: payStubs.reduce((sum, stub) => sum + stub.grossPay, 0) * 4, // Approximate YTD
    netPay: payStubs.reduce((sum, stub) => sum + stub.netPay, 0) * 4,
    taxes: payStubs.reduce((sum, stub) => sum + stub.taxes, 0) * 4,
    deductions: payStubs.reduce((sum, stub) => sum + stub.deductions, 0) * 4
  };

  return (
    <ProtectedRoute>
      <IntranetLayout title="Payroll & Benefits">
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Next Paycheck</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(3125.50)}</p>
                  <p className="text-sm text-green-600 mt-1">Jan 5, 2025</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">YTD Gross Pay</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(yearToDateStats.grossPay)}</p>
                  <p className="text-sm text-blue-600 mt-1">Through Dec 2024</p>
                </div>
                <Calculator className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Benefits</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBenefitValue)}</p>
                  <p className="text-sm text-purple-600 mt-1">Monthly Value</p>
                </div>
                <Heart className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">401(k) Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(15750)}</p>
                  <p className="text-sm text-orange-600 mt-1">+8.2% YTD</p>
                </div>
                <PiggyBank className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pay Stubs */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Pay Stubs</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                  </select>
                  <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md">
                    <Download className="w-4 h-4" />
                    <span>Download All</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {payStubs.map((stub) => (
                  <div key={stub.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{stub.payPeriod}</h4>
                        <p className="text-sm text-gray-500">
                          Paid on {new Date(stub.payDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Gross Pay</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(stub.grossPay)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Taxes</p>
                        <p className="font-semibold text-gray-900">-{formatCurrency(stub.taxes)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Deductions</p>
                        <p className="font-semibold text-gray-900">-{formatCurrency(stub.deductions)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Net Pay</p>
                        <p className="font-semibold text-green-600">{formatCurrency(stub.netPay)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Hours Worked: <span className="font-medium">{stub.hoursWorked}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* YTD Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-to-Date Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gross Pay</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(yearToDateStats.grossPay)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Federal Tax</span>
                  <span className="text-sm font-medium text-gray-900">
                    -{formatCurrency(yearToDateStats.taxes * 0.6)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">State Tax</span>
                  <span className="text-sm font-medium text-gray-900">
                    -{formatCurrency(yearToDateStats.taxes * 0.25)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">FICA</span>
                  <span className="text-sm font-medium text-gray-900">
                    -{formatCurrency(yearToDateStats.taxes * 0.15)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Benefits</span>
                  <span className="text-sm font-medium text-gray-900">
                    -{formatCurrency(yearToDateStats.deductions)}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Net Pay</span>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(yearToDateStats.netPay)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Tax Documents</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  2024 tax documents will be available in January.
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Get notified when ready
                </button>
              </div>
            </div>
          </div>

          {/* Benefits Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Benefits Overview</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Manage Benefits
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit) => {
                const Icon = getBenefitIcon(benefit.type);
                return (
                  <div key={benefit.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          benefit.type === 'health' ? 'bg-red-100' :
                          benefit.type === 'dental' ? 'bg-blue-100' :
                          benefit.type === 'vision' ? 'bg-green-100' :
                          benefit.type === '401k' ? 'bg-orange-100' :
                          'bg-purple-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            benefit.type === 'health' ? 'text-red-600' :
                            benefit.type === 'dental' ? 'text-blue-600' :
                            benefit.type === 'vision' ? 'text-green-600' :
                            benefit.type === '401k' ? 'text-orange-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{benefit.name}</h4>
                          <p className="text-sm text-gray-500">{benefit.provider}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        benefit.status === 'active' ? 'bg-green-100 text-green-800' :
                        benefit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {benefit.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coverage:</span>
                        <span className="text-gray-900">{benefit.coverage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employee:</span>
                        <span className="text-gray-900">
                          {benefit.employeeContribution > 0 
                            ? formatCurrency(benefit.employeeContribution) 
                            : 'Free'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employer:</span>
                        <span className="text-green-600">
                          {formatCurrency(benefit.employerContribution)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 401k Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <PiggyBank className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">401(k) Retirement Plan</h3>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Full Statement
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Account Balance</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(15750)}</p>
                <p className="text-sm text-green-600 mt-1">+{formatCurrency(1286)} YTD</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Monthly Contribution</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(250)}</p>
                <p className="text-sm text-gray-600">6% of salary</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Employer Match</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(125)}</p>
                <p className="text-sm text-gray-600">50% match up to 6%</p>
              </div>
            </div>
          </div>
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}