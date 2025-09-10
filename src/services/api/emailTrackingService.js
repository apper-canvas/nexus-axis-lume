import { toast } from 'react-toastify';

// Initialize ApperClient
function getApperClient() {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
}

export async function getEmailTrackings(filters = {}) {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "recipient_c"}},
        {"field": {"Name": "subject_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "sent_date_c"}},
        {"field": {"Name": "open_date_c"}},
        {"field": {"Name": "click_count_c"}},
        {"field": {"Name": "last_clicked_date_c"}},
        {"field": {"Name": "email_body_c"}},
        {"field": {"Name": "related_to_type_c"}},
        {"field": {"Name": "related_to_id_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      orderBy: [{"fieldName": "sent_date_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": filters.limit || 20, "offset": filters.offset || 0}
    };

    // Add status filter if provided
    if (filters.status && filters.status !== 'All') {
      params.where = [
        {"FieldName": "status_c", "Operator": "EqualTo", "Values": [filters.status]}
      ];
    }

    // Add search filter if provided
    if (filters.search) {
      const searchGroups = {
        operator: "OR",
        subGroups: [
          {
            conditions: [
              {"fieldName": "recipient_c", "operator": "Contains", "values": [filters.search]}
            ]
          },
          {
            conditions: [
              {"fieldName": "subject_c", "operator": "Contains", "values": [filters.search]}
            ]
          }
        ]
      };
      
      if (params.where) {
        params.whereGroups = [searchGroups];
      } else {
        params.whereGroups = [searchGroups];
      }
    }

    const response = await apperClient.fetchRecords('emailtracking_c', params);
    
    if (!response.success) {
      console.error('Error fetching email trackings:', response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error('Error in getEmailTrackings:', error?.response?.data?.message || error);
    toast.error('Failed to fetch email trackings');
    return [];
  }
}

export async function getEmailTrackingById(id) {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "recipient_c"}},
        {"field": {"Name": "subject_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "sent_date_c"}},
        {"field": {"Name": "open_date_c"}},
        {"field": {"Name": "click_count_c"}},
        {"field": {"Name": "last_clicked_date_c"}},
        {"field": {"Name": "email_body_c"}},
        {"field": {"Name": "related_to_type_c"}},
        {"field": {"Name": "related_to_id_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ]
    };

    const response = await apperClient.getRecordById('emailtracking_c', id, params);
    
    if (!response.success) {
      console.error('Error fetching email tracking:', response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error in getEmailTrackingById ${id}:`, error?.response?.data?.message || error);
    toast.error('Failed to fetch email tracking details');
    return null;
  }
}

export async function createEmailTracking(emailTrackingData) {
  try {
    const apperClient = getApperClient();
    
    // Only include updateable fields
    const params = {
      records: [{
        Name: emailTrackingData.Name || '',
        Tags: emailTrackingData.Tags || '',
        recipient_c: emailTrackingData.recipient_c || '',
        subject_c: emailTrackingData.subject_c || '',
        status_c: emailTrackingData.status_c || 'Sent',
        sent_date_c: emailTrackingData.sent_date_c || new Date().toISOString(),
        open_date_c: emailTrackingData.open_date_c || null,
        click_count_c: parseInt(emailTrackingData.click_count_c) || 0,
        last_clicked_date_c: emailTrackingData.last_clicked_date_c || null,
        email_body_c: emailTrackingData.email_body_c || '',
        related_to_type_c: emailTrackingData.related_to_type_c || '',
        related_to_id_c: parseInt(emailTrackingData.related_to_id_c) || null
      }]
    };

    const response = await apperClient.createRecord('emailtracking_c', params);
    
    if (!response.success) {
      console.error('Error creating email tracking:', response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} email tracking records:`, failed);
        failed.forEach(record => {
          if (record.errors) {
            record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          }
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        toast.success('Email tracking created successfully');
        return successful[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in createEmailTracking:', error?.response?.data?.message || error);
    toast.error('Failed to create email tracking');
    return null;
  }
}

export async function updateEmailTracking(id, emailTrackingData) {
  try {
    const apperClient = getApperClient();
    
    // Only include updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: emailTrackingData.Name,
        Tags: emailTrackingData.Tags,
        recipient_c: emailTrackingData.recipient_c,
        subject_c: emailTrackingData.subject_c,
        status_c: emailTrackingData.status_c,
        sent_date_c: emailTrackingData.sent_date_c,
        open_date_c: emailTrackingData.open_date_c,
        click_count_c: parseInt(emailTrackingData.click_count_c) || 0,
        last_clicked_date_c: emailTrackingData.last_clicked_date_c,
        email_body_c: emailTrackingData.email_body_c,
        related_to_type_c: emailTrackingData.related_to_type_c,
        related_to_id_c: parseInt(emailTrackingData.related_to_id_c) || null
      }]
    };

    const response = await apperClient.updateRecord('emailtracking_c', params);
    
    if (!response.success) {
      console.error('Error updating email tracking:', response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} email tracking records:`, failed);
        failed.forEach(record => {
          if (record.errors) {
            record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          }
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        toast.success('Email tracking updated successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in updateEmailTracking:', error?.response?.data?.message || error);
    toast.error('Failed to update email tracking');
    return false;
  }
}

export async function deleteEmailTracking(id) {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await apperClient.deleteRecord('emailtracking_c', params);
    
    if (!response.success) {
      console.error('Error deleting email tracking:', response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} email tracking records:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        toast.success('Email tracking deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in deleteEmailTracking:', error?.response?.data?.message || error);
    toast.error('Failed to delete email tracking');
    return false;
  }
}