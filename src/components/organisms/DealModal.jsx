import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { createDeal, updateDeal } from "@/services/api/dealService";
import { createFollowUpReminder } from "@/services/api/followUpReminderService";
import { createTask } from "@/services/api/taskService";
import { cn } from "@/utils/cn";

const PIPELINE_STAGES = [
  { id: "Lead", title: "Lead" },
  { id: "Qualified", title: "Qualified" },
  { id: "Proposal", title: "Proposal" },
  { id: "Negotiation", title: "Negotiation" },
  { id: "Closed", title: "Closed" }
];

const DealModal = ({ isOpen, onClose, deal, contacts, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    contactId: "",
    value: "",
    expectedCloseDate: "",
    stage: "Lead",
    probability: 25,
    description: ""
  });

  const [reminderData, setReminderData] = useState({
    enabled: false,
    date: "",
    type: "Call",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        name: deal.name || "",
        contactId: deal.contactId || "",
        value: deal.value || "",
        expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : "",
        stage: deal.stage || "Lead",
        probability: deal.probability || 25,
description: deal.description || ""
      });
      setReminderData({
        enabled: false,
        date: "",
        type: "Call",
        notes: ""
      });
    } else {
      setFormData({
        name: "",
        contactId: "",
        value: "",
        expectedCloseDate: "",
        stage: "Lead",
        probability: 25,
        description: ""
      });
      setReminderData({
        enabled: false,
        date: "",
        type: "Call",
        notes: ""
      });
    }
    setErrors({});
  }, [deal, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Deal name is required";
    }

    if (!formData.contactId) {
      newErrors.contactId = "Contact is required";
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Deal value must be greater than 0";
    }

    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = "Expected close date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
try {
      const selectedContact = contacts.find(c => c.Id === parseInt(formData.contactId));
      const dealData = {
        ...formData,
        contactId: parseInt(formData.contactId),
        contactName: selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : "",
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability)
      };

      let savedDeal;
      if (deal) {
        savedDeal = await updateDeal(deal.Id, dealData);
      } else {
        savedDeal = await createDeal(dealData);
      }

      // Create reminder and task if enabled
      if (reminderData.enabled && reminderData.date && savedDeal) {
        try {
          const reminder = await createFollowUpReminder({
            name: `${reminderData.type} reminder for ${dealData.name}`,
            reminderDate: reminderData.date,
            associatedItemType: "Deal",
            associatedItemId: savedDeal.Id,
            reminderType: reminderData.type
          });

          if (reminder) {
            await createTask({
              taskName: `${reminderData.type}: ${dealData.name}`,
              description: reminderData.notes || `Follow up on deal: ${dealData.name}`,
              dueDate: reminderData.date,
              status: "Not Started",
              externalTaskId: `reminder_${reminder.Id}`
            });
          }
        } catch (reminderError) {
          console.error("Error creating reminder:", reminderError);
          // Don't fail the whole operation if reminder creation fails
        }
      }

      await onSave(dealData);
    } catch (error) {
      console.error("Error saving deal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Auto-update probability based on stage
    if (name === "stage") {
      const stageProbabilities = {
        "Lead": 25,
        "Qualified": 45,
        "Proposal": 65,
        "Negotiation": 80,
        "Closed": 100
      };
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        probability: stageProbabilities[value] || 25
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {deal ? "Edit Deal" : "Add New Deal"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Deal Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter deal name..."
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact <span className="text-red-500">*</span>
            </label>
            <select
              name="contactId"
              value={formData.contactId}
              onChange={handleChange}
              className={cn(
                "block w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2",
                errors.contactId
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
              )}
            >
              <option value="">Select a contact...</option>
              {contacts.map(contact => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.firstName} {contact.lastName} - {contact.company}
                </option>
              ))}
            </select>
            {errors.contactId && (
              <p className="text-sm text-red-600">{errors.contactId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Deal Value"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              error={errors.value}
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {PIPELINE_STAGES.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Expected Close Date"
              name="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={handleChange}
              error={errors.expectedCloseDate}
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probability ({formData.probability}%)
              </label>
              <input
                type="range"
                name="probability"
                min="0"
                max="100"
                step="5"
                value={formData.probability}
                onChange={handleChange}
                className="block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Additional details about this deal..."
            />
</div>

          {/* Follow-up Reminder Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reminderEnabled"
                checked={reminderData.enabled}
                onChange={(e) => setReminderData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700">
                Set follow-up reminder
              </label>
            </div>

            {reminderData.enabled && (
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Reminder Date"
                    name="reminderDate"
                    type="datetime-local"
                    value={reminderData.date}
                    onChange={(e) => setReminderData(prev => ({ ...prev, date: e.target.value }))}
                    required={reminderData.enabled}
                  />
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Reminder Type
                    </label>
                    <select
                      value={reminderData.type}
                      onChange={(e) => setReminderData(prev => ({ ...prev, type: e.target.value }))}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="Call">Call</option>
                      <option value="Email">Email</option>
                      <option value="Meeting">Meeting</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Reminder Notes
                  </label>
                  <textarea
                    value={reminderData.notes}
                    onChange={(e) => setReminderData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Additional notes for the follow-up..."
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
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
                  Saving...
                </>
              ) : (
                <>
                  <ApperIcon name="Save" size={16} className="mr-2" />
                  {deal ? "Update Deal" : "Create Deal"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealModal;