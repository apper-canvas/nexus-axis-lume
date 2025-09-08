import { toast } from 'react-toastify';

// Initialize ApperClient
function getApperClient() {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
}

const tableName = 'activity_c';

export const getActivities = async (filters = {}) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "Owner"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "CreatedBy"}},
        {"field": {"Name": "ModifiedOn"}},
        {"field": {"Name": "ModifiedBy"}},
        {"field": {"Name": "activity_type_c"}},
        {"field": {"Name": "activity_date_c"}},
        {"field": {"Name": "associated_item_type_c"}},
        {"field": {"Name": "associated_item_id_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "assigned_to_user_id_c"}}
      ],
      orderBy: [{"fieldName": "activity_date_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    };

    // Add filters if provided
    if (filters.activityType) {
      params.where = [{
        "FieldName": "activity_type_c",
        "Operator": "EqualTo",
        "Values": [filters.activityType],
        "Include": true
      }];
    }

    if (filters.associatedItemType) {
      const whereClause = {
        "FieldName": "associated_item_type_c",
        "Operator": "EqualTo",
        "Values": [filters.associatedItemType],
        "Include": true
      };
      
      if (params.where) {
        params.where.push(whereClause);
      } else {
        params.where = [whereClause];
      }
    }

    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    if (!response.data || response.data.length === 0) {
      return [];
    }

    return response.data.map(activity => ({
      Id: activity.Id,
      name: activity.Name || '',
      tags: activity.Tags || '',
      owner: activity.Owner?.Name || '',
      ownerId: activity.Owner?.Id || null,
      createdOn: activity.CreatedOn || '',
      createdBy: activity.CreatedBy?.Name || '',
      modifiedOn: activity.ModifiedOn || '',
      modifiedBy: activity.ModifiedBy?.Name || '',
      activityType: activity.activity_type_c || '',
      activityDate: activity.activity_date_c || '',
      associatedItemType: activity.associated_item_type_c || '',
      associatedItemId: activity.associated_item_id_c || null,
      notes: activity.notes_c || '',
      assignedToUserId: activity.assigned_to_user_id_c?.Id || null,
      assignedToUserName: activity.assigned_to_user_id_c?.Name || ''
    }));

  } catch (error) {
    console.error("Error fetching activities:", error?.response?.data?.message || error);
    toast.error("Failed to fetch activities");
    return [];
  }
};

export const getActivityById = async (activityId) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "Owner"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "CreatedBy"}},
        {"field": {"Name": "ModifiedOn"}},
        {"field": {"Name": "ModifiedBy"}},
        {"field": {"Name": "activity_type_c"}},
        {"field": {"Name": "activity_date_c"}},
        {"field": {"Name": "associated_item_type_c"}},
        {"field": {"Name": "associated_item_id_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "assigned_to_user_id_c"}}
      ]
    };

    const response = await apperClient.getRecordById(tableName, activityId, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (!response.data) {
      return null;
    }

    const activity = response.data;
    return {
      Id: activity.Id,
      name: activity.Name || '',
      tags: activity.Tags || '',
      owner: activity.Owner?.Name || '',
      ownerId: activity.Owner?.Id || null,
      createdOn: activity.CreatedOn || '',
      createdBy: activity.CreatedBy?.Name || '',
      modifiedOn: activity.ModifiedOn || '',
      modifiedBy: activity.ModifiedBy?.Name || '',
      activityType: activity.activity_type_c || '',
      activityDate: activity.activity_date_c || '',
      associatedItemType: activity.associated_item_type_c || '',
      associatedItemId: activity.associated_item_id_c || null,
      notes: activity.notes_c || '',
      assignedToUserId: activity.assigned_to_user_id_c?.Id || null,
      assignedToUserName: activity.assigned_to_user_id_c?.Name || ''
    };

  } catch (error) {
    console.error(`Error fetching activity ${activityId}:`, error?.response?.data?.message || error);
    toast.error("Failed to fetch activity");
    return null;
  }
};

export const createActivity = async (activityData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Name: activityData.name || '',
        Tags: activityData.tags || '',
        activity_type_c: activityData.activityType || '',
        activity_date_c: activityData.activityDate || new Date().toISOString(),
        associated_item_type_c: activityData.associatedItemType || '',
        associated_item_id_c: activityData.associatedItemId || null,
        notes_c: activityData.notes || '',
        assigned_to_user_id_c: activityData.assignedToUserId || null
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
        console.error(`Failed to create ${failed.length} activities:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
        return null;
      }

      if (successful.length > 0) {
        const createdActivity = successful[0].data;
        toast.success("Activity created successfully");
        
        return {
          Id: createdActivity.Id,
          name: createdActivity.Name || '',
          tags: createdActivity.Tags || '',
          owner: createdActivity.Owner?.Name || '',
          ownerId: createdActivity.Owner?.Id || null,
          createdOn: createdActivity.CreatedOn || '',
          createdBy: createdActivity.CreatedBy?.Name || '',
          modifiedOn: createdActivity.ModifiedOn || '',
          modifiedBy: createdActivity.ModifiedBy?.Name || '',
          activityType: createdActivity.activity_type_c || '',
          activityDate: createdActivity.activity_date_c || '',
          associatedItemType: createdActivity.associated_item_type_c || '',
          associatedItemId: createdActivity.associated_item_id_c || null,
          notes: createdActivity.notes_c || '',
          assignedToUserId: createdActivity.assigned_to_user_id_c?.Id || null,
          assignedToUserName: createdActivity.assigned_to_user_id_c?.Name || ''
        };
      }
    }
    return null;

  } catch (error) {
    console.error("Error creating activity:", error?.response?.data?.message || error);
    toast.error("Failed to create activity");
    return null;
  }
};

export const updateActivity = async (activityId, activityData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Id: activityId,
        Name: activityData.name || '',
        Tags: activityData.tags || '',
        activity_type_c: activityData.activityType || '',
        activity_date_c: activityData.activityDate || '',
        associated_item_type_c: activityData.associatedItemType || '',
        associated_item_id_c: activityData.associatedItemId || null,
        notes_c: activityData.notes || '',
        assigned_to_user_id_c: activityData.assignedToUserId || null
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
        console.error(`Failed to update ${failed.length} activities:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
        return null;
      }

      if (successful.length > 0) {
        const updatedActivity = successful[0].data;
        toast.success("Activity updated successfully");
        
        return {
          Id: updatedActivity.Id,
          name: updatedActivity.Name || '',
          tags: updatedActivity.Tags || '',
          owner: updatedActivity.Owner?.Name || '',
          ownerId: updatedActivity.Owner?.Id || null,
          createdOn: updatedActivity.CreatedOn || '',
          createdBy: updatedActivity.CreatedBy?.Name || '',
          modifiedOn: updatedActivity.ModifiedOn || '',
          modifiedBy: updatedActivity.ModifiedBy?.Name || '',
          activityType: updatedActivity.activity_type_c || '',
          activityDate: updatedActivity.activity_date_c || '',
          associatedItemType: updatedActivity.associated_item_type_c || '',
          associatedItemId: updatedActivity.associated_item_id_c || null,
          notes: updatedActivity.notes_c || '',
          assignedToUserId: updatedActivity.assigned_to_user_id_c?.Id || null,
          assignedToUserName: updatedActivity.assigned_to_user_id_c?.Name || ''
        };
      }
    }
    return null;

  } catch (error) {
    console.error("Error updating activity:", error?.response?.data?.message || error);
    toast.error("Failed to update activity");
    return null;
  }
};

export const deleteActivity = async (activityId) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [activityId]
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
        console.error(`Failed to delete ${failed.length} activities:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
        return false;
      }

      if (successful.length > 0) {
        toast.success("Activity deleted successfully");
        return true;
      }
    }
    return false;

  } catch (error) {
    console.error("Error deleting activity:", error?.response?.data?.message || error);
    toast.error("Failed to delete activity");
    return false;
  }
};