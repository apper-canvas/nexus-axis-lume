import { toast } from 'react-toastify';

function getApperClient() {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
}

export async function getTasks() {
  try {
    const apperClient = getApperClient();
    const tableName = 'task_c';
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "task_name_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "due_date_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "assigned_to_user_id_c"}},
        {"field": {"Name": "external_task_id_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    };

    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response?.data?.length) {
      return [];
    }

    return response.data.map(task => ({
      Id: task.Id,
      name: task.Name || '',
      tags: task.Tags || '',
      taskName: task.task_name_c || '',
      description: task.description_c || '',
      dueDate: task.due_date_c || '',
      status: task.status_c || 'Not Started',
      assignedToUserId: task.assigned_to_user_id_c?.Id || null,
      assignedToUserName: task.assigned_to_user_id_c?.Name || '',
      externalTaskId: task.external_task_id_c || '',
      createdOn: task.CreatedOn || '',
      modifiedOn: task.ModifiedOn || ''
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error?.response?.data?.message || error);
    return [];
  }
}

export async function getTaskById(id) {
  try {
    const apperClient = getApperClient();
    const tableName = 'task_c';
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "task_name_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "due_date_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "assigned_to_user_id_c"}},
        {"field": {"Name": "external_task_id_c"}}
      ]
    };

    const response = await apperClient.getRecordById(tableName, id, params);
    
    if (!response?.data) {
      return null;
    }

    const task = response.data;
    return {
      Id: task.Id,
      name: task.Name || '',
      tags: task.Tags || '',
      taskName: task.task_name_c || '',
      description: task.description_c || '',
      dueDate: task.due_date_c || '',
      status: task.status_c || 'Not Started',
      assignedToUserId: task.assigned_to_user_id_c?.Id || null,
      assignedToUserName: task.assigned_to_user_id_c?.Name || '',
      externalTaskId: task.external_task_id_c || ''
    };
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
    return null;
  }
}

export async function createTask(taskData) {
  try {
    const apperClient = getApperClient();
    const tableName = 'task_c';
    
    const params = {
      records: [{
        Name: taskData.name || taskData.taskName || 'New Task',
        Tags: taskData.tags || '',
        task_name_c: taskData.taskName || taskData.name || 'New Task',
        description_c: taskData.description || '',
        due_date_c: taskData.dueDate || '',
        status_c: taskData.status || 'Not Started',
        assigned_to_user_id_c: taskData.assignedToUserId ? parseInt(taskData.assignedToUserId) : null,
        external_task_id_c: taskData.externalTaskId || ''
      }]
    };

    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} tasks:`, JSON.stringify(failed));
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const createdTask = successful[0].data;
        return {
          Id: createdTask.Id,
          name: createdTask.Name || '',
          tags: createdTask.Tags || '',
          taskName: createdTask.task_name_c || '',
          description: createdTask.description_c || '',
          dueDate: createdTask.due_date_c || '',
          status: createdTask.status_c || 'Not Started',
          assignedToUserId: createdTask.assigned_to_user_id_c?.Id || null,
          assignedToUserName: createdTask.assigned_to_user_id_c?.Name || '',
          externalTaskId: createdTask.external_task_id_c || ''
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error creating task:", error?.response?.data?.message || error);
    toast.error("Failed to create task");
    return null;
  }
}

export async function updateTask(id, taskData) {
  try {
    const apperClient = getApperClient();
    const tableName = 'task_c';
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: taskData.name || taskData.taskName || 'Task',
        Tags: taskData.tags || '',
        task_name_c: taskData.taskName || taskData.name || 'Task',
        description_c: taskData.description || '',
        due_date_c: taskData.dueDate || '',
        status_c: taskData.status || 'Not Started',
        assigned_to_user_id_c: taskData.assignedToUserId ? parseInt(taskData.assignedToUserId) : null,
        external_task_id_c: taskData.externalTaskId || ''
      }]
    };

    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} tasks:`, JSON.stringify(failed));
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const updatedTask = successful[0].data;
        return {
          Id: updatedTask.Id,
          name: updatedTask.Name || '',
          tags: updatedTask.Tags || '',
          taskName: updatedTask.task_name_c || '',
          description: updatedTask.description_c || '',
          dueDate: updatedTask.due_date_c || '',
          status: updatedTask.status_c || 'Not Started',
          assignedToUserId: updatedTask.assigned_to_user_id_c?.Id || null,
          assignedToUserName: updatedTask.assigned_to_user_id_c?.Name || '',
          externalTaskId: updatedTask.external_task_id_c || ''
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error updating task:", error?.response?.data?.message || error);
    toast.error("Failed to update task");
    return null;
  }
}

export async function deleteTask(id) {
  try {
    const apperClient = getApperClient();
    const tableName = 'task_c';
    
    const params = { 
      RecordIds: [parseInt(id)]
    };

    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} tasks:`, JSON.stringify(failed));
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      return successful.length > 0;
    }
    return false;
  } catch (error) {
    console.error("Error deleting task:", error?.response?.data?.message || error);
    toast.error("Failed to delete task");
    return false;
  }
}