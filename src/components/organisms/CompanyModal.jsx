import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import FormField from "@/components/molecules/FormField";

const CompanyModal = ({
  isOpen,
  onClose,
  company = null,
  onSave,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    industryId: '',
    website: '',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (company) {
        setFormData({
          name: company.name || '',
          industryId: company.industryId || '',
          website: company.website || '',
          address: company.address || '',
          notes: company.notes || ''
        });
      } else {
        setFormData({
          name: '',
          industryId: '',
          website: '',
          address: '',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, company]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {company ? 'Edit Company' : 'Add Company'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="md:col-span-2">
<FormField
                label="Company Name"
                error={errors.name}
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter company name"
                className={errors.name ? 'border-error-500' : ''}
              />
            </div>

            {/* Industry */}
            <FormField
              label="Industry"
              error={errors.industryId}
            >
              <select
                value={formData.industryId}
                onChange={(e) => handleChange('industryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select industry</option>
                <option value="1">Technology</option>
                <option value="2">Healthcare</option>
                <option value="3">Finance</option>
                <option value="4">Manufacturing</option>
                <option value="5">Retail</option>
                <option value="6">Education</option>
                <option value="7">Real Estate</option>
                <option value="8">Consulting</option>
              </select>
            </FormField>

            {/* Website */}
<FormField
              label="Website"
              error={errors.website}
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
              className={errors.website ? 'border-error-500' : ''}
            />
          </div>

          {/* Address */}
          <FormField
            label="Address"
            error={errors.address}
          >
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter company address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </FormField>

          {/* Notes */}
          <FormField
            label="Notes"
            error={errors.notes}
          >
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this company"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </FormField>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                  {company ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <ApperIcon name="Save" size={16} className="mr-2" />
                  {company ? 'Update Company' : 'Create Company'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyModal;