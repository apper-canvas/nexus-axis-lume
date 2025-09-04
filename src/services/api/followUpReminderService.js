import { toast } from 'react-toastify';

function getApperClient() {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
}

export async function getFollowUpReminders() {
  try {
    const apperClient = getApperClient();
    const tableName = 'follow_up_reminder_c';
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "reminder_date_c"}},
        {"field": {"Name": "associated_item_type_c"}},
        {"field": {"Name": "associated_item_id_c"}},
        {"field": {"Name": "reminder_type_c"}},
        {"field": {"Name": "assigned_to_user_id_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      orderBy: [{"fieldName": "reminder_date_c", "sorttype": "ASC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    };

    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response?.data?.length) {
      return [];
    }

    return response.data.map(reminder => ({
      Id: reminder.Id,
      name: reminder.Name || '',
      tags: reminder.Tags || '',
      reminderDate: reminder.reminder_date_c || '',
      associatedItemType: reminder.associated_item_type_c || '',
      associatedItemId: reminder.associated_item_id_c || null,
      reminderType: reminder.reminder_type_c || '',
      assignedToUserId: reminder.assigned_to_user_id_c?.Id || null,
      assignedToUserName: reminder.assigned_to_user_id_c?.Name || '',
      createdOn: reminder.CreatedOn || '',
      modifiedOn: reminder.ModifiedOn || ''
    }));
  } catch (error) {
    console.error("Error fetching follow-up reminders:", error?.response?.data?.message || error);
    return [];
  }
}

export async function getFollowUpReminderById(id) {
  try {
    const apperClient = getApperClient();
    const tableName = 'follow_up_reminder_c';
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "reminder_date_c"}},
        {"field": {"Name": "associated_item_type_c"}},
        {"field": {"Name": "associated_item_id_c"}},
        {"field": {"Name": "reminder_type_c"}},
        {"field": {"Name": "assigned_to_user_id_c"}}
      ]
    };

    const response = await apperClient.getRecordById(tableName, id, params);
    
    if (!response?.data) {
      return null;
    }

    const reminder = response.data;
    return {
      Id: reminder.Id,
      name: reminder.Name || '',
      tags: reminder.Tags || '',
      reminderDate: reminder.reminder_date_c || '',
      associatedItemType: reminder.associated_item_type_c || '',
      associatedItemId: reminder.associated_item_id_c || null,
      reminderType: reminder.reminder_type_c || '',
      assignedToUserId: reminder.assigned_to_user_id_c?.Id || null,
      assignedToUserName: reminder.assigned_to_user_id_c?.Name || ''
    };
  } catch (error) {
    console.error(`Error fetching follow-up reminder ${id}:`, error?.response?.data?.message || error);
    return null;
  }
}

export async function createFollowUpReminder(reminderData) {
  try {
    const apperClient = getApperClient();
    const tableName = 'follow_up_reminder_c';
    
    const params = {
      records: [{
        Name: reminderData.name || `${reminderData.reminderType || 'Follow-up'} Reminder`,
        Tags: reminderData.tags || '',
        reminder_date_c: reminderData.reminderDate,
        associated_item_type_c: reminderData.associatedItemType,
        associated_item_id_c: parseInt(reminderData.associatedItemId),
        reminder_type_c: reminderData.reminderType,
        assigned_to_user_id_c: reminderData.assignedToUserId ? parseInt(reminderData.assignedToUserId) : null
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
        console.error(`Failed to create ${failed.length} follow-up reminders: ${JSON.stringify(failed)}`);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const createdReminder = successful[0].data;
        return {
          Id: createdReminder.Id,
          name: createdReminder.Name || '',
          tags: createdReminder.Tags || '',
          reminderDate: createdReminder.reminder_date_c || '',
          associatedItemType: createdReminder.associated_item_type_c || '',
          associatedItemId: createdReminder.associated_item_id_c || null,
          reminderType: createdReminder.reminder_type_c || '',
          assignedToUserId: createdReminder.assigned_to_user_id_c?.Id || null,
          assignedToUserName: createdReminder.assigned_to_user_id_c?.Name || ''
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error creating follow-up reminder:", error?.response?.data?.message || error);
    toast.error("Failed to create follow-up reminder");
    return null;
  }
}

export async function updateFollowUpReminder(id, reminderData) {
  try {
    const apperClient = getApperClient();
    const tableName = 'follow_up_reminder_c';
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: reminderData.name || `${reminderData.reminderType || 'Follow-up'} Reminder`,
        Tags: reminderData.tags || '',
        reminder_date_c: reminderData.reminderDate,
        associated_item_type_c: reminderData.associatedItemType,
        associated_item_id_c: parseInt(reminderData.associatedItemId),
        reminder_type_c: reminderData.reminderType,
        assigned_to_user_id_c: reminderData.assignedToUserId ? parseInt(reminderData.assignedToUserId) : null
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
        console.error(`Failed to update ${failed.length} follow-up reminders: ${JSON.stringify(failed)}`);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const updatedReminder = successful[0].data;
        return {
          Id: updatedReminder.Id,
          name: updatedReminder.Name || '',
          tags: updatedReminder.Tags || '',
          reminderDate: updatedReminder.reminder_date_c || '',
          associatedItemType: updatedReminder.associated_item_type_c || '',
          associatedItemId: updatedReminder.associated_item_id_c || null,
          reminderType: updatedReminder.reminder_type_c || '',
          assignedToUserId: updatedReminder.assigned_to_user_id_c?.Id || null,
          assignedToUserName: updatedReminder.assigned_to_user_id_c?.Name || ''
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error updating follow-up reminder:", error?.response?.data?.message || error);
    toast.error("Failed to update follow-up reminder");
    return null;
  }
}

export async function deleteFollowUpReminder(id) {
  try {
    const apperClient = getApperClient();
    const tableName = 'follow_up_reminder_c';
    
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
        console.error(`Failed to delete ${failed.length} follow-up reminders:`, JSON.stringify(failed));
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      return successful.length > 0;
    }
    return false;
  } catch (error) {
    console.error("Error deleting follow-up reminder:", error?.response?.data?.message || error);
    toast.error("Failed to delete follow-up reminder");
    return false;
  }
}