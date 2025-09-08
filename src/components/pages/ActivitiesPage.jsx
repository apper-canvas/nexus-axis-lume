import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { getActivities, createActivity, updateActivity, deleteActivity } from "@/services/api/activityService";
import { getContacts } from "@/services/api/contactService";
import { getDeals } from "@/services/api/dealService";
import { cn } from "@/utils/cn";
import { format } from "date-fns";

const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Task'];
const ASSOCIATED_ITEM_TYPES = ['Contact', 'Deal'];

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterAssociatedType, setFilterAssociatedType] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    activityType: '',
    activityDate: '',
    associatedItemType: '',
    associatedItemId: '',
    notes: '',
    tags: ''
  });

  // Load activities on component mount
  useEffect(() => {
    loadActivities();
    loadContactsAndDeals();
  }, []);

  // Reload activities when filters change
  useEffect(() => {
    loadActivities();
  }, [filterType, filterAssociatedType]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      if (filterType) filters.activityType = filterType;
      if (filterAssociatedType) filters.associatedItemType = filterAssociatedType;
      
      const activitiesData = await getActivities(filters);
      setActivities(activitiesData || []);
    } catch (error) {
      console.error("Error loading activities:", error?.response?.data?.message || error);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const loadContactsAndDeals = async () => {
    try {
      const [contactsData, dealsData] = await Promise.all([
        getContacts(),
        getDeals()
      ]);
      setContacts(contactsData || []);
      setDeals(dealsData || []);
    } catch (error) {
      console.error("Error loading contacts and deals:", error?.response?.data?.message || error);
    }
  };

  const getStatusColor = (activityType) => {
    const colorMap = {
      'Call': 'bg-blue-100 text-blue-800',
      'Email': 'bg-green-100 text-green-800',
      'Meeting': 'bg-purple-100 text-purple-800',
      'Task': 'bg-orange-100 text-orange-800'
    };
    return colorMap[activityType] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (activityDate) => {
    const now = new Date();
    const activityDateObj = new Date(activityDate);
    const diffHours = (activityDateObj - now) / (1000 * 60 * 60);
    
    if (diffHours < -24) return { icon: "AlertCircle", color: "text-red-500", title: "Overdue" };
    if (diffHours < 0) return { icon: "Clock", color: "text-orange-500", title: "Due today" };
    if (diffHours < 24) return { icon: "Clock", color: "text-yellow-500", title: "Due soon" };
    return { icon: "CheckCircle2", color: "text-green-500", title: "Upcoming" };
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setFormData({
      name: '',
      activityType: '',
      activityDate: '',
      associatedItemType: '',
      associatedItemId: '',
      notes: '',
      tags: ''
    });
    setShowModal(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name || '',
      activityType: activity.activityType || '',
      activityDate: activity.activityDate ? activity.activityDate.slice(0, 16) : '',
      associatedItemType: activity.associatedItemType || '',
      associatedItemId: activity.associatedItemId?.toString() || '',
      notes: activity.notes || '',
      tags: activity.tags || ''
    });
    setShowModal(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Activity name is required");
      return false;
    }
    if (!formData.activityType) {
      toast.error("Activity type is required");
      return false;
    }
    if (!formData.activityDate) {
      toast.error("Activity date is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const activityData = {
        name: formData.name.trim(),
        activityType: formData.activityType,
        activityDate: new Date(formData.activityDate).toISOString(),
        associatedItemType: formData.associatedItemType || null,
        associatedItemId: formData.associatedItemId ? parseInt(formData.associatedItemId) : null,
        notes: formData.notes.trim(),
        tags: formData.tags.trim()
      };
      
      if (editingActivity) {
        const updatedActivity = await updateActivity(editingActivity.Id, activityData);
        if (updatedActivity) {
          setActivities(prev => 
            prev.map(a => a.Id === editingActivity.Id ? updatedActivity : a)
          );
          setShowModal(false);
        }
      } else {
        const newActivity = await createActivity(activityData);
        if (newActivity) {
          setActivities(prev => [newActivity, ...prev]);
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving activity:", error?.response?.data?.message || error);
      toast.error("Failed to save activity");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    
    try {
      const success = await deleteActivity(activityId);
      if (success) {
        setActivities(prev => prev.filter(a => a.Id !== activityId));
      }
    } catch (error) {
      console.error("Error deleting activity:", error?.response?.data?.message || error);
      toast.error("Failed to delete activity");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getAssociatedItemName = (activity) => {
    if (!activity.associatedItemType || !activity.associatedItemId) return 'None';
    
    if (activity.associatedItemType === 'Contact') {
      const contact = contacts.find(c => c.Id === activity.associatedItemId);
      return contact ? contact.name : `Contact #${activity.associatedItemId}`;
    } else if (activity.associatedItemType === 'Deal') {
      const deal = deals.find(d => d.Id === activity.associatedItemId);
      return deal ? deal.name : `Deal #${activity.associatedItemId}`;
    }
    
    return 'Unknown';
  };

  const getAssociatedItems = () => {
    if (formData.associatedItemType === 'Contact') {
      return contacts;
    } else if (formData.associatedItemType === 'Deal') {
      return deals;
    }
    return [];
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadActivities} />;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track and manage your activities and interactions
              </p>
            </div>
            <Button onClick={handleAddActivity} className="flex items-center gap-2">
              <ApperIcon name="Plus" size={16} />
              Add Activity
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {ACTIVITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={filterAssociatedType}
              onChange={(e) => setFilterAssociatedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Associations</option>
              {ASSOCIATED_ITEM_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="text-sm text-gray-500 ml-auto">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activities.length === 0 ? (
            <Empty
              title="No activities found"
              description="Get started by creating your first activity to track interactions and tasks."
              action={
                <Button onClick={handleAddActivity} className="mt-4">
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Add Activity
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const priorityInfo = getPriorityIcon(activity.activityDate);
                return (
                  <div
                    key={activity.Id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {activity.name}
                          </h3>
                          <Badge className={getStatusColor(activity.activityType)}>
                            {activity.activityType}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500" title={priorityInfo.title}>
                            <ApperIcon name={priorityInfo.icon} size={16} className={priorityInfo.color} />
                            {activity.activityDate && format(new Date(activity.activityDate), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Associated with:</span>
                            <span className="ml-2">
                              {activity.associatedItemType ? 
                                `${activity.associatedItemType}: ${getAssociatedItemName(activity)}` : 
                                'None'
                              }
                            </span>
                          </div>
                          {activity.assignedToUserName && (
                            <div>
                              <span className="font-medium">Assigned to:</span>
                              <span className="ml-2">{activity.assignedToUserName}</span>
                            </div>
                          )}
                        </div>
                        
                        {activity.notes && (
                          <div className="text-sm text-gray-700 mb-3">
                            <span className="font-medium">Notes:</span>
                            <p className="mt-1 line-clamp-2">{activity.notes}</p>
                          </div>
                        )}
                        
                        {activity.tags && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {activity.tags.split(',').map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Created {activity.createdOn && format(new Date(activity.createdOn), 'MMM dd, yyyy')}
                          {activity.createdBy && ` by ${activity.createdBy}`}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditActivity(activity)}
                          className="text-gray-600 hover:text-primary-600"
                        >
                          <ApperIcon name="Edit2" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.Id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingActivity ? 'Edit Activity' : 'Add Activity'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField label="Activity Name" required>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter activity name"
                    />
                  </FormField>

                  <FormField label="Activity Type" required>
                    <select
                      name="activityType"
                      value={formData.activityType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      {ACTIVITY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField label="Activity Date & Time" required>
                  <input
                    type="datetime-local"
                    name="activityDate"
                    value={formData.activityDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </FormField>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField label="Associate with">
                    <select
                      name="associatedItemType"
                      value={formData.associatedItemType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">None</option>
                      {ASSOCIATED_ITEM_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FormField>

                  {formData.associatedItemType && (
                    <FormField label={`Select ${formData.associatedItemType}`}>
                      <select
                        name="associatedItemId"
                        value={formData.associatedItemId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select {formData.associatedItemType.toLowerCase()}</option>
                        {getAssociatedItems().map(item => (
                          <option key={item.Id} value={item.Id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  )}
                </div>

                <FormField label="Tags">
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter tags separated by commas"
                  />
                </FormField>

                <FormField label="Notes">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add any notes or details about this activity..."
                  />
                </FormField>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : editingActivity ? 'Update Activity' : 'Create Activity'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;