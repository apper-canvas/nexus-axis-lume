import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { getTasks, createTask, updateTask, deleteTask } from "@/services/api/taskService";
import { cn } from "@/utils/cn";
import { format } from "date-fns";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    dueDate: "",
    status: "Not Started"
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Deferred':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { icon: 'AlertCircle', color: 'text-red-500', label: 'Overdue' };
    if (daysDiff === 0) return { icon: 'Clock', color: 'text-orange-500', label: 'Due Today' };
    if (daysDiff <= 3) return { icon: 'AlertTriangle', color: 'text-yellow-500', label: 'Due Soon' };
    return null;
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setFormData({
      taskName: "",
      description: "",
      dueDate: "",
      status: "Not Started"
    });
    setFormErrors({});
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormData({
      taskName: task.taskName || task.name,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status
    });
    setFormErrors({});
    setShowTaskModal(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.taskName.trim()) {
      errors.taskName = "Task name is required";
    }
    
    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (selectedTask) {
        await updateTask(selectedTask.Id, formData);
        toast.success("Task updated successfully");
      } else {
        await createTask(formData);
        toast.success("Task created successfully");
      }
      
      setShowTaskModal(false);
      loadTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const success = await deleteTask(taskId);
      if (success) {
        setTasks(prev => prev.filter(task => task.Id !== taskId));
        toast.success("Task deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.Id === taskId);
      if (!task) return;

      const updatedTask = await updateTask(taskId, { ...task, status: newStatus });
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.Id === taskId ? updatedTask : t));
        toast.success("Task status updated");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTasks} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your follow-up tasks and reminders
          </p>
        </div>
        <Button
          onClick={handleAddTask}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All Tasks</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Deferred">Deferred</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty 
          message="No tasks found"
          description="Create your first task to get started with task management."
          action={
            <Button onClick={handleAddTask} className="mt-4">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Task
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const priority = getPriorityIcon(task.dueDate);
            
            return (
              <div
                key={task.Id}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {task.taskName || task.name}
                      </h3>
                      {priority && (
                        <div className={cn("flex items-center space-x-1", priority.color)}>
                          <ApperIcon name={priority.icon} size={16} />
                          <span className="text-xs font-medium">{priority.label}</span>
                        </div>
                      )}
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {task.dueDate && (
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Calendar" size={14} />
                          <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                        </div>
                      )}
                      {task.assignedToUserName && (
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="User" size={14} />
                          <span>Assigned: {task.assignedToUserName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.Id, e.target.value)}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Deferred">Deferred</option>
                    </select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.Id)}
                      className="text-gray-400 hover:text-red-600"
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

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedTask ? "Edit Task" : "Add New Task"}
              </h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <FormField
                label="Task Name"
                name="taskName"
                value={formData.taskName}
                onChange={handleChange}
                error={formErrors.taskName}
                required
              />

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
                  placeholder="Task description..."
                />
              </div>

              <FormField
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                error={formErrors.dueDate}
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Deferred">Deferred</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTaskModal(false)}
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
                      {selectedTask ? "Update Task" : "Create Task"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;