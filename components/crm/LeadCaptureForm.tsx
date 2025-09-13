import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Globe, 
  DollarSign, 
  Calendar, 
  FileText, 
  Save, 
  Loader 
} from 'lucide-react';
import { LeadCaptureForm as LeadFormData, LeadSource, LeadPriority } from '../../lib/types/lead-types';
import { LeadService } from '../../lib/services/lead-service';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPermissions } from '../../lib/permissions';

interface LeadCaptureFormProps {
  onSuccess?: (leadId: string) => void;
  onCancel?: () => void;
  source?: LeadSource;
  embedded?: boolean;
  className?: string;
}

const BUDGET_OPTIONS = [
  { value: '', label: 'Select Budget Range' },
  { value: 'under_5k', label: 'Under $5,000' },
  { value: '5k_15k', label: '$5,000 - $15,000' },
  { value: '15k_50k', label: '$15,000 - $50,000' },
  { value: '50k_100k', label: '$50,000 - $100,000' },
  { value: 'over_100k', label: 'Over $100,000' }
];

const TIMELINE_OPTIONS = [
  { value: '', label: 'Select Timeline' },
  { value: 'immediate', label: 'Immediate (Within 1 month)' },
  { value: '1_3_months', label: '1-3 months' },
  { value: '3_6_months', label: '3-6 months' },
  { value: '6_12_months', label: '6-12 months' },
  { value: 'over_12_months', label: 'Over 12 months' },
  { value: 'not_sure', label: 'Not sure' }
];

export default function LeadCaptureForm({ 
  onSuccess, 
  onCancel, 
  source = 'website_form',
  embedded = false,
  className = ''
}: LeadCaptureFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    website: '',
    source,
    budget: '',
    timeline: '',
    decisionMaker: false,
    notes: '',
    customFields: {}
  });

  const handleInputChange = (
    field: keyof LeadFormData,
    value: string | boolean | Record<string, any>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Optional phone validation
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Optional website validation
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ submit: 'Please log in to submit leads' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const permissions = await getUserPermissions(user.uid);
      const leadId = await LeadService.createLead(
        formData,
        user.uid,
        permissions.role,
        // In a real app, you'd get these from the request
        undefined, // ipAddress
        navigator.userAgent // userAgent
      );

      if (onSuccess) {
        onSuccess(leadId);
      }

      // Reset form if embedded (like on website)
      if (embedded) {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          jobTitle: '',
          website: '',
          source,
          budget: '',
          timeline: '',
          decisionMaker: false,
          notes: '',
          customFields: {}
        });
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create lead' 
      });
    } finally {
      setLoading(false);
    }
  };

  const containerClass = embedded 
    ? `bg-white rounded-lg p-6 shadow-md ${className}`
    : `bg-gray-900 p-6 border border-gray-700 rounded-lg ${className}`;

  const inputClass = embedded
    ? "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    : "w-full px-4 py-2 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const labelClass = embedded
    ? "block text-sm font-medium text-gray-700 mb-1"
    : "block text-sm font-medium text-gray-300 mb-1";

  const errorClass = "text-red-500 text-sm mt-1";

  return (
    <div className={containerClass}>
      {!embedded && (
        <div className="mb-6">
          <h2 className="text-2xl font-light text-white">Capture New Lead</h2>
          <p className="text-gray-400 mt-1">Enter prospect information to start the qualification process</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <User className="inline w-4 h-4 mr-1" />
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={inputClass}
              placeholder="Enter first name"
              required
            />
            {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
          </div>

          <div>
            <label className={labelClass}>
              <User className="inline w-4 h-4 mr-1" />
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={inputClass}
              placeholder="Enter last name"
              required
            />
            {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={inputClass}
              placeholder="Enter email address"
              required
            />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>

          <div>
            <label className={labelClass}>
              <Phone className="inline w-4 h-4 mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={inputClass}
              placeholder="Enter phone number"
            />
            {errors.phone && <p className={errorClass}>{errors.phone}</p>}
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Building className="inline w-4 h-4 mr-1" />
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className={inputClass}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className={labelClass}>
              <Briefcase className="inline w-4 h-4 mr-1" />
              Job Title
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className={inputClass}
              placeholder="Enter job title"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <Globe className="inline w-4 h-4 mr-1" />
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className={inputClass}
            placeholder="https://www.example.com"
          />
          {errors.website && <p className={errorClass}>{errors.website}</p>}
        </div>

        {/* Project Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <DollarSign className="inline w-4 h-4 mr-1" />
              Budget Range
            </label>
            <select
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className={inputClass}
            >
              {BUDGET_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              <Calendar className="inline w-4 h-4 mr-1" />
              Project Timeline
            </label>
            <select
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className={inputClass}
            >
              {TIMELINE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Decision Maker */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="decisionMaker"
            checked={formData.decisionMaker}
            onChange={(e) => handleInputChange('decisionMaker', e.target.checked)}
            className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="decisionMaker" className={labelClass.replace('block', 'inline')}>
            I am the primary decision maker for this project
          </label>
        </div>

        {/* Additional Notes */}
        <div>
          <label className={labelClass}>
            <FileText className="inline w-4 h-4 mr-1" />
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Tell us more about your project or requirements..."
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Creating Lead...' : 'Create Lead'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary px-6"
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}