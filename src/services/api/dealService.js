import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const tableName = 'deal_c';

export const getDeals = async () => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "contact_id_c"}},
        {"field": {"Name": "contact_name_c"}},
        {"field": {"Name": "value_c"}},
        {"field": {"Name": "expected_close_date_c"}},
        {"field": {"Name": "stage_c"}},
        {"field": {"Name": "probability_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "updated_at_c"}},
        {"field": {"Name": "history_c"}}
      ],
      orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching deals:", response.message);
      toast.error(response.message);
      return [];
    }
    
    if (!response.data || response.data.length === 0) {
      return [];
    }
    
return response.data.map(deal => ({
      Id: deal.Id,
      name: deal.name_c || deal.Name || '',
      contactId: deal.contact_id_c || null,
      contactName: deal.contact_name_c || '',
      value: deal.value_c || 0,
      expectedCloseDate: deal.expected_close_date_c || '',
      stage: deal.stage_c || 'Lead',
      probability: deal.probability_c || 25,
      description: deal.description_c || '',
      createdAt: deal.created_at_c || new Date().toISOString(),
      updatedAt: deal.updated_at_c || new Date().toISOString(),
      history: (() => {
        try {
          return deal.history_c ? JSON.parse(deal.history_c) : [];
        } catch (error) {
          console.warn('Failed to parse deal history JSON:', error);
          return [];
        }
      })()
    }));
  } catch (error) {
    console.error("Error fetching deals:", error?.response?.data?.message || error);
    return [];
  }
};

export const getDealById = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "contact_id_c"}},
        {"field": {"Name": "contact_name_c"}},
        {"field": {"Name": "value_c"}},
        {"field": {"Name": "expected_close_date_c"}},
        {"field": {"Name": "stage_c"}},
        {"field": {"Name": "probability_c"}},
        {"field": {"Name": "description_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "updated_at_c"}},
        {"field": {"Name": "history_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response?.data) {
      return null;
    }
    
const deal = response.data;
    return {
      Id: deal.Id,
      name: deal.name_c || deal.Name || '',
      contactId: deal.contact_id_c || null,
      contactName: deal.contact_name_c || '',
      value: deal.value_c || 0,
      expectedCloseDate: deal.expected_close_date_c || '',
      stage: deal.stage_c || 'Lead',
      probability: deal.probability_c || 25,
      description: deal.description_c || '',
      createdAt: deal.created_at_c || new Date().toISOString(),
      updatedAt: deal.updated_at_c || new Date().toISOString(),
      history: (() => {
        try {
          return deal.history_c ? JSON.parse(deal.history_c) : [];
        } catch (error) {
          console.warn('Failed to parse deal history JSON:', error);
          return [];
        }
      })()
    };
  } catch (error) {
    console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

export const createDeal = async (dealData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Name: dealData.name || '',
        name_c: dealData.name || '',
        contact_id_c: dealData.contactId ? parseInt(dealData.contactId) : null,
        contact_name_c: dealData.contactName || '',
        value_c: parseFloat(dealData.value) || 0,
        expected_close_date_c: dealData.expectedCloseDate || '',
        stage_c: dealData.stage || 'Lead',
        probability_c: parseInt(dealData.probability) || 25,
        description_c: dealData.description || '',
        created_at_c: new Date().toISOString(),
        updated_at_c: new Date().toISOString(),
        history_c: JSON.stringify([{
          Id: 1,
          stage: dealData.stage || 'Lead',
          changedAt: new Date().toISOString(),
          changedBy: "System",
          notes: "Deal created"
        }])
      }]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating deal:", response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} records:`, failed);
        failed.forEach(record => {
          if (record.errors) {
            record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          }
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const createdDeal = successful[0].data;
        return {
Id: createdDeal.Id,
          name: createdDeal.name_c || createdDeal.Name || '',
          contactId: createdDeal.contact_id_c || null,
          contactName: createdDeal.contact_name_c || '',
          value: createdDeal.value_c || 0,
          expectedCloseDate: createdDeal.expected_close_date_c || '',
          stage: createdDeal.stage_c || 'Lead',
          probability: createdDeal.probability_c || 25,
          description: createdDeal.description_c || '',
          createdAt: createdDeal.created_at_c || new Date().toISOString(),
          updatedAt: createdDeal.updated_at_c || new Date().toISOString(),
          history: (() => {
            try {
              return createdDeal.history_c ? JSON.parse(createdDeal.history_c) : [];
            } catch (error) {
              console.warn('Failed to parse deal history JSON:', error);
              return [];
            }
          })()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating deal:", error?.response?.data?.message || error);
    return null;
  }
};

export const updateDeal = async (id, dealData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: dealData.name || '',
        name_c: dealData.name || '',
        contact_id_c: dealData.contactId ? parseInt(dealData.contactId) : null,
        contact_name_c: dealData.contactName || '',
        value_c: parseFloat(dealData.value) || 0,
        expected_close_date_c: dealData.expectedCloseDate || '',
        stage_c: dealData.stage || 'Lead',
        probability_c: parseInt(dealData.probability) || 25,
        description_c: dealData.description || '',
        updated_at_c: new Date().toISOString()
      }]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating deal:", response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} records:`, failed);
        failed.forEach(record => {
          if (record.errors) {
            record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          }
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        const updatedDeal = successful[0].data;
        return {
Id: updatedDeal.Id,
          name: updatedDeal.name_c || updatedDeal.Name || '',
          contactId: updatedDeal.contact_id_c || null,
          contactName: updatedDeal.contact_name_c || '',
          value: updatedDeal.value_c || 0,
          expectedCloseDate: updatedDeal.expected_close_date_c || '',
          stage: updatedDeal.stage_c || 'Lead',
          probability: updatedDeal.probability_c || 25,
          description: updatedDeal.description_c || '',
          createdAt: updatedDeal.created_at_c || new Date().toISOString(),
          updatedAt: updatedDeal.updated_at_c || new Date().toISOString(),
          history: (() => {
            try {
              return updatedDeal.history_c ? JSON.parse(updatedDeal.history_c) : [];
            } catch (error) {
              console.warn('Failed to parse deal history JSON:', error);
              return [];
            }
          })()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating deal:", error?.response?.data?.message || error);
    return null;
  }
};

export const updateDealStage = async (id, newStage) => {
  // Get current deal first to preserve other data
  const currentDeal = await getDealById(id);
  if (!currentDeal) {
    throw new Error("Deal not found");
  }
  
  // Update with new stage and probability
  const stageProbabilities = {
    "Lead": 25,
    "Qualified": 45,
    "Proposal": 65,
    "Negotiation": 80,
    "Closed": 100
  };
  
  return updateDeal(id, {
    ...currentDeal,
    stage: newStage,
    probability: stageProbabilities[newStage] || 25
  });
};

export const deleteDeal = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting deal:", response.message);
      toast.error(response.message);
      return false;
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} records:`, failed);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      return successful.length === 1;
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting deal:", error?.response?.data?.message || error);
    return false;
  }
};