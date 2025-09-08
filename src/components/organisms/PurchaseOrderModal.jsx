import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import { cn } from "@/utils/cn";

const PurchaseOrderModal = ({ 
  isOpen, 
  onClose, 
  purchaseOrder, 
  onSave, 
  companies = [], 
  contacts = [] 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    vendorId: "",
    orderDate: "",
    totalValue: "",
    status: "Draft",
    contactId: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        name: purchaseOrder.name || "",
        vendorId: purchaseOrder.vendorId || "",
        orderDate: purchaseOrder.orderDate || "",
        totalValue: purchaseOrder.totalValue || "",
        status: purchaseOrder.status || "Draft",
        contactId: purchaseOrder.contactId || ""
      });
    } else {
      setFormData({
        name: "",
        vendorId: "",
        orderDate: "",
        totalValue: "",
        status: "Draft",
        contactId: ""
      });
    }
  }, [purchaseOrder, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }

setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving purchase order:", error);
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {purchaseOrder ? "Edit Purchase Order" : "Create Purchase Order"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Name"
            required
            error={!formData.name.trim() ? "Name is required" : ""}
          >
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter purchase order name"
              className={cn(
                !formData.name.trim() && "border-error-500 focus:border-error-500 focus:ring-error-500"
              )}
            />
          </FormField>

          <FormField label="Vendor">
            <select
              value={formData.vendorId}
              onChange={(e) => handleChange("vendorId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a vendor</option>
              {companies.map((company) => (
                <option key={company.Id} value={company.Id}>
                  {company.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Order Date">
            <Input
              type="date"
              value={formData.orderDate}
              onChange={(e) => handleChange("orderDate", e.target.value)}
            />
          </FormField>

          <FormField label="Total Value">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.totalValue}
              onChange={(e) => handleChange("totalValue", e.target.value)}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Status">
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Draft">Draft</option>
              <option value="Ordered">Ordered</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </FormField>

          <FormField label="Contact">
            <select
              value={formData.contactId}
              onChange={(e) => handleChange("contactId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a contact</option>
              {contacts.map((contact) => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.firstName} {contact.lastName}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex justify-end space-x-3 pt-6">
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
              disabled={loading || !formData.name.trim()}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </div>
              ) : (
                purchaseOrder ? "Update Purchase Order" : "Create Purchase Order"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;