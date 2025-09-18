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
  CreditCard,
  Building
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
  const [payStubs] = useState<PayStub[]>([]);
  const [userType, setUserType] = useState<'employee' | 'contractor'>('employee');
  const [contractorCountry, setContractorCountry] = useState<string>('US');

  const [benefits] = useState<Benefit[]>([]);
  
  // PTO Balance (moved from dashboard)
  const [ptoBalance] = useState({
    vacation: 15,
    sick: 10,
    personal: 3
  });

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
    grossPay: payStubs.reduce((sum, stub) => sum + stub.grossPay, 0),
    netPay: payStubs.reduce((sum, stub) => sum + stub.netPay, 0),
    taxes: payStubs.reduce((sum, stub) => sum + stub.taxes, 0),
    deductions: payStubs.reduce((sum, stub) => sum + stub.deductions, 0)
  };

  const internationalCountries = [
    'US', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Netherlands', 'Singapore', 'Japan', 'Other'
  ];

  const getContractorComplianceInfo = () => {
    const complianceInfo = {
      'US': 'W-9 form required. 1099-MISC will be issued for payments over $600.',
      'Canada': 'Business number or SIN required. T4A slip issued for tax reporting.',
      'United Kingdom': 'UTR number required. IR35 compliance assessment may apply.',
      'Germany': 'Tax ID required. VAT registration may be needed for EU services.',
      'Australia': 'ABN required. PAYG withholding may apply for non-residents.',
      'Other': 'Country-specific tax documentation required. Consult local tax advisor.'
    };
    return complianceInfo[contractorCountry as keyof typeof complianceInfo] || complianceInfo['Other'];
  };

  return (
    <ProtectedRoute>
      <IntranetLayout title="Payroll & Benefits">
        <div className="space-y-6">
          {/* User Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="userType"
                  value="employee"
                  checked={userType === 'employee'}
                  onChange={(e) => setUserType(e.target.value as 'employee' | 'contractor')}
                  className="form-radio"
                />
                <span>Employee</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="userType"
                  value="contractor"
                  checked={userType === 'contractor'}
                  onChange={(e) => setUserType(e.target.value as 'employee' | 'contractor')}
                  className="form-radio"
                />
                <span>Independent Contractor</span>
              </label>
              {userType === 'contractor' && (
                <select
                  value={contractorCountry}
                  onChange={(e) => setContractorCountry(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  {internationalCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {userType === 'employee' ? 'Next Paycheck' : 'Next Payment'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {payStubs.length > 0 ? formatCurrency(0) : '$0.00'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {payStubs.length > 0 ? 'Calculated from recent activity' : 'No payment data'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">YTD {userType === 'employee' ? 'Gross Pay' : 'Payments'}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(yearToDateStats.grossPay)}</p>
                  <p className="text-sm text-blue-600 mt-1">Through {new Date().getFullYear()}</p>
                </div>
                <Calculator className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {userType === 'employee' ? (
              <>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">PTO Balance</p>
                      <p className="text-2xl font-bold text-gray-900">{ptoBalance.vacation + ptoBalance.sick + ptoBalance.personal}</p>
                      <p className="text-sm text-purple-600 mt-1">
                        {ptoBalance.vacation}V • {ptoBalance.sick}S • {ptoBalance.personal}P days
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Benefits Value</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBenefitValue)}</p>
                      <p className="text-sm text-gray-500 mt-1">Monthly Value</p>
                    </div>
                    <Heart className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="text-lg font-bold text-gray-900">{contractorCountry}</p>
                      <p className="text-sm text-blue-600 mt-1">Tax Jurisdiction</p>
                    </div>
                    <Building className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className="text-lg font-bold text-gray-900">Active</p>
                      <p className="text-sm text-green-600 mt-1">Compliant Setup</p>
                    </div>
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </>
            )}
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

              {payStubs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {userType === 'employee' ? 'pay stubs' : 'payment records'} available
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {userType === 'employee' 
                      ? 'Your pay stubs will appear here once payroll is processed.' 
                      : 'Your payment history will appear here after invoices are paid.'}
                  </p>
                  {userType === 'contractor' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
                      <h4 className="font-medium text-blue-900 mb-2">Compliance Requirements for {contractorCountry}:</h4>
                      <p className="text-sm text-blue-800">{getContractorComplianceInfo()}</p>
                    </div>
                  )}
                </div>
              ) : (
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
                          <p className="text-gray-600">{userType === 'employee' ? 'Gross Pay' : 'Total Amount'}</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(stub.grossPay)}</p>
                        </div>
                        {userType === 'employee' && (
                          <>
                            <div>
                              <p className="text-gray-600">Taxes</p>
                              <p className="font-semibold text-gray-900">-{formatCurrency(stub.taxes)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Deductions</p>
                              <p className="font-semibold text-gray-900">-{formatCurrency(stub.deductions)}</p>
                            </div>
                          </>
                        )}
                        <div>
                          <p className="text-gray-600">{userType === 'employee' ? 'Net Pay' : 'Net Payment'}</p>
                          <p className="font-semibold text-green-600">{formatCurrency(stub.netPay)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          Hours {userType === 'employee' ? 'Worked' : 'Billed'}: <span className="font-medium">{stub.hoursWorked}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

            {userType === 'contractor' ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Independent Contractor</h3>
                <p className="text-gray-500 mb-4">
                  As an independent contractor, you are responsible for your own benefits and taxes.
                </p>
                <div className="max-w-md mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Please consult with a tax professional regarding your obligations 
                    for self-employment taxes and business expenses in {contractorCountry}.
                  </p>
                </div>
              </div>
            ) : benefits.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No benefits enrolled</h3>
                <p className="text-gray-500 mb-4">
                  Contact HR to enroll in available benefit programs.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                  Contact HR
                </button>
              </div>
            ) : (
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
            )}
          </div>

          {/* 401k Details - Only for employees */}
          {userType === 'employee' && (
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
                <p className="text-2xl font-bold text-gray-900">$0.00</p>
                <p className="text-sm text-gray-500 mt-1">No contributions yet</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Monthly Contribution</span>
                </div>
                <p className="text-xl font-bold text-gray-900">$0.00</p>
                <p className="text-sm text-gray-500">Not enrolled</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Employer Match</span>
                </div>
                <p className="text-xl font-bold text-gray-900">$0.00</p>
                <p className="text-sm text-gray-500">Matching available</p>
              </div>
            </div>
          </div>
          )}
        </div>
      </IntranetLayout>
    </ProtectedRoute>
  );
}