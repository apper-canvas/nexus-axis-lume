import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { createDeal, updateDeal } from "@/services/api/dealService";
import { createFollowUpReminder } from "@/services/api/followUpReminderService";
import { createTask } from "@/services/api/taskService";
import { getComments, createComment, updateComment, deleteComment } from "@/services/api/commentService";
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
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

  // Comments state
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Get current user from Redux store
  const { user } = useSelector((state) => state.user);

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
    setNewComment('');
    setEditingCommentId(null);
    setEditingCommentText('');
    
    // Load comments if deal exists
    if (deal && isOpen) {
      loadComments(deal.Id);
    } else {
      setComments([]);
    }
  }, [deal, isOpen]);

  const loadComments = async (dealId) => {
    if (!dealId) return;
    
    setLoadingComments(true);
    try {
      const dealComments = await getComments(dealId);
      setComments(dealComments || []);
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !deal) return;

    try {
      const commentData = {
        dealId: deal.Id,
        dealName: deal.name,
        text: newComment.trim(),
        authorId: user?.userId || null,
        authorName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown'
      };

      const createdComment = await createComment(commentData);
      if (createdComment) {
        setComments(prev => [createdComment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingCommentText.trim()) return;

    try {
      const comment = comments.find(c => c.Id === commentId);
      const updatedComment = await updateComment(commentId, {
        text: editingCommentText.trim(),
        dealId: comment.dealId,
        author: comment.author,
        authorId: comment.authorId,
        createdOn: comment.createdOn
      });

      if (updatedComment) {
        setComments(prev => prev.map(c => 
          c.Id === commentId ? updatedComment : c
        ));
        setEditingCommentId(null);
        setEditingCommentText('');
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const success = await deleteComment(commentId);
      if (success) {
        setComments(prev => prev.filter(c => c.Id !== commentId));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.Id);
    setEditingCommentText(comment.text);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

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

          {/* Comments Section */}
          {deal && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowComments(!showComments)}
              >
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <ApperIcon name="MessageSquare" size={16} className="mr-2" />
                  Comments ({comments.length})
                </h3>
                <ApperIcon 
                  name={showComments ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="text-gray-400" 
                />
              </div>

              {showComments && (
                <div className="space-y-4 pl-6">
                  {/* Add Comment Form */}
                  <div className="space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    {newComment.trim() && (
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewComment('')}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleAddComment}
                        >
                          Add Comment
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {loadingComments ? (
                      <div className="flex justify-center py-4">
                        <ApperIcon name="Loader2" size={16} className="animate-spin text-gray-400" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No comments yet. Be the first to add one!
                      </p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.Id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-700">
                                {comment.author}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(comment.date), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => startEditingComment(comment)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <ApperIcon name="Edit2" size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.Id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <ApperIcon name="Trash2" size={14} />
                              </button>
                            </div>
                          </div>
                          
                          {editingCommentId === comment.Id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                rows={2}
                                className="block w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
                              />
                              <div className="flex justify-end space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditingComment}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleEditComment(comment.Id)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                              {comment.text}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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