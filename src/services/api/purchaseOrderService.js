import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const tableName = 'purchase_order_c';

export const getPurchaseOrders = async () => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "vendor_c"}},
        {"field": {"Name": "order_date_c"}},
        {"field": {"Name": "total_value_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "contact_id_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching purchase orders:", response.message);
      toast.error(response.message);
      return [];
    }
    
    if (!response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data.map(po => ({
      Id: po.Id,
      name: po.name_c || po.Name || '',
      vendor: po.vendor_c?.Name || '',
      vendorId: po.vendor_c?.Id || null,
      orderDate: po.order_date_c || '',
      totalValue: po.total_value_c || 0,
      status: po.status_c || 'Draft',
      contact: po.contact_id_c?.Name || '',
      contactId: po.contact_id_c?.Id || null,
      createdAt: po.CreatedOn || new Date().toISOString(),
      updatedAt: po.ModifiedOn || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching purchase orders:", error?.response?.data?.message || error);
    return [];
  }
};

export const getPurchaseOrderById = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "vendor_c"}},
        {"field": {"Name": "order_date_c"}},
        {"field": {"Name": "total_value_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "contact_id_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response?.data) {
      return null;
    }
    
    const po = response.data;
    return {
      Id: po.Id,
      name: po.name_c || po.Name || '',
      vendor: po.vendor_c?.Name || '',
      vendorId: po.vendor_c?.Id || null,
      orderDate: po.order_date_c || '',
      totalValue: po.total_value_c || 0,
      status: po.status_c || 'Draft',
      contact: po.contact_id_c?.Name || '',
      contactId: po.contact_id_c?.Id || null,
      createdAt: po.CreatedOn || new Date().toISOString(),
      updatedAt: po.ModifiedOn || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching purchase order ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

export const createPurchaseOrder = async (poData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Name: poData.name || '',
        name_c: poData.name || '',
        vendor_c: poData.vendorId ? parseInt(poData.vendorId) : null,
        order_date_c: poData.orderDate || '',
        total_value_c: parseFloat(poData.totalValue) || 0,
        status_c: poData.status || 'Draft',
        contact_id_c: poData.contactId ? parseInt(poData.contactId) : null
      }]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating purchase order:", response.message);
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
        const createdPO = successful[0].data;
        return {
          Id: createdPO.Id,
          name: createdPO.name_c || createdPO.Name || '',
          vendor: createdPO.vendor_c?.Name || '',
          vendorId: createdPO.vendor_c?.Id || null,
          orderDate: createdPO.order_date_c || '',
          totalValue: createdPO.total_value_c || 0,
          status: createdPO.status_c || 'Draft',
          contact: createdPO.contact_id_c?.Name || '',
          contactId: createdPO.contact_id_c?.Id || null,
          createdAt: createdPO.CreatedOn || new Date().toISOString(),
          updatedAt: createdPO.ModifiedOn || new Date().toISOString()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating purchase order:", error?.response?.data?.message || error);
    return null;
  }
};

export const updatePurchaseOrder = async (id, poData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: poData.name || '',
        name_c: poData.name || '',
        vendor_c: poData.vendorId ? parseInt(poData.vendorId) : null,
        order_date_c: poData.orderDate || '',
        total_value_c: parseFloat(poData.totalValue) || 0,
        status_c: poData.status || 'Draft',
        contact_id_c: poData.contactId ? parseInt(poData.contactId) : null
      }]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating purchase order:", response.message);
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
        const updatedPO = successful[0].data;
        return {
          Id: updatedPO.Id,
          name: updatedPO.name_c || updatedPO.Name || '',
          vendor: updatedPO.vendor_c?.Name || '',
          vendorId: updatedPO.vendor_c?.Id || null,
          orderDate: updatedPO.order_date_c || '',
          totalValue: updatedPO.total_value_c || 0,
          status: updatedPO.status_c || 'Draft',
          contact: updatedPO.contact_id_c?.Name || '',
          contactId: updatedPO.contact_id_c?.Id || null,
          createdAt: updatedPO.CreatedOn || new Date().toISOString(),
          updatedAt: updatedPO.ModifiedOn || new Date().toISOString()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating purchase order:", error?.response?.data?.message || error);
    return null;
  }
};

export const deletePurchaseOrder = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting purchase order:", response.message);
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
    console.error("Error deleting purchase order:", error?.response?.data?.message || error);
    return false;
  }
};