import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

import { toast } from 'react-toastify';

const QuoteModal = ({ quote, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    status: 'Draft',
    validUntil: '',
    items: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, price: '' });

  useEffect(() => {
    if (quote) {
      setFormData({
        customerName: quote.customerName || '',
        amount: quote.amount?.toString() || '',
        status: quote.status || 'Draft',
        validUntil: quote.validUntil ? quote.validUntil.split('T')[0] : '',
        items: quote.items || [],
        notes: quote.notes || ''
      });
    }
  }, [quote]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddItem = () => {
    if (newItem.description && newItem.price) {
      const item = {
        id: Date.now(),
        description: newItem.description,
        quantity: parseInt(newItem.quantity) || 1,
        price: parseFloat(newItem.price) || 0,
        total: (parseInt(newItem.quantity) || 1) * (parseFloat(newItem.price) || 0)
      };
      
      setFormData(prev => ({ 
        ...prev, 
        items: [...prev.items, item]
      }));
      
      // Update total amount
      const newTotal = [...formData.items, item].reduce((sum, item) => sum + item.total, 0);
      setFormData(prev => ({ ...prev, amount: newTotal.toString() }));
      
      setNewItem({ description: '', quantity: 1, price: '' });
    }
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = formData.items.filter(item => item.id !== itemId);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    
    // Update total amount
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    setFormData(prev => ({ ...prev, amount: newTotal.toString() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        amount: parseFloat(formData.amount),
        validUntil: formData.validUntil || null
      });
} catch (error) {
      console.error('Error saving quote:', error?.response?.data?.message || error);
      toast.error('Failed to save quote');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Expired', label: 'Expired' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {quote ? 'Edit Quote' : 'Create New Quote'}
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={errors.customerName}
                  placeholder="Enter customer name"
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-error-600">{errors.customerName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Total Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  error={errors.amount}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-error-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleInputChange('validUntil', e.target.value)}
                  placeholder="Select expiry date"
                />
              </div>
            </div>

            {/* Quote Items */}
            <div>
              <Label>Quote Items</Label>
              <div className="mt-2 space-y-4">
                {/* Add New Item */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <Input
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Item description"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Price"
                      />
                      <Button
                        type="button"
                        onClick={handleAddItem}
                        variant="primary"
                        size="sm"
                      >
                        <ApperIcon name="Plus" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Items</h4>
                    {formData.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{item.description}</div>
                          <div className="text-xs text-gray-500">
                            {item.quantity} × ${item.price.toFixed(2)} = ${item.total.toFixed(2)}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-error-600 hover:text-error-700"
                        >
                          <ApperIcon name="Trash2" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Additional notes or terms..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  quote ? 'Update Quote' : 'Create Quote'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;