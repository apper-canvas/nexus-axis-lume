import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const tableName = 'contact_c';

export const getContacts = async () => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "first_name_c"}},
        {"field": {"Name": "last_name_c"}},
        {"field": {"Name": "email_c"}},
        {"field": {"Name": "phone_c"}},
{"field": {"Name": "company_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "updated_at_c"}}
      ],
      orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching contacts:", response.message);
      toast.error(response.message);
      return [];
    }
    
    if (!response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data.map(contact => ({
      Id: contact.Id,
      firstName: contact.first_name_c || '',
      lastName: contact.last_name_c || '',
      email: contact.email_c || '',
      phone: contact.phone_c || '',
company: contact.company_c?.Name || '',
      companyId: contact.company_c?.Id || null,
      status: contact.status_c || 'lead',
      notes: contact.notes_c || '',
      createdAt: contact.created_at_c || new Date().toISOString(),
      updatedAt: contact.updated_at_c || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching contacts:", error?.response?.data?.message || error);
    return [];
  }
};

export const getContactById = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "first_name_c"}},
        {"field": {"Name": "last_name_c"}},
        {"field": {"Name": "email_c"}},
        {"field": {"Name": "phone_c"}},
{"field": {"Name": "company_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "updated_at_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response?.data) {
      return null;
    }
    
    const contact = response.data;
    return {
      Id: contact.Id,
      firstName: contact.first_name_c || '',
      lastName: contact.last_name_c || '',
      email: contact.email_c || '',
      phone: contact.phone_c || '',
company: contact.company_c?.Name || '',
      companyId: contact.company_c?.Id || null,
      status: contact.status_c || 'lead',
      notes: contact.notes_c || '',
      createdAt: contact.created_at_c || new Date().toISOString(),
      updatedAt: contact.updated_at_c || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

export const createContact = async (contactData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Name: `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim(),
        first_name_c: contactData.firstName || '',
        last_name_c: contactData.lastName || '',
        email_c: contactData.email || '',
        phone_c: contactData.phone || '',
company_c: contactData.companyId ? parseInt(contactData.companyId) : null,
        status_c: contactData.status || 'lead',
        notes_c: contactData.notes || '',
        created_at_c: new Date().toISOString(),
        updated_at_c: new Date().toISOString()
      }]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating contact:", response.message);
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
        const createdContact = successful[0].data;
        return {
          Id: createdContact.Id,
          firstName: createdContact.first_name_c || '',
          lastName: createdContact.last_name_c || '',
          email: createdContact.email_c || '',
          phone: createdContact.phone_c || '',
company: createdContact.company_c?.Name || '',
          companyId: createdContact.company_c?.Id || null,
          status: createdContact.status_c || 'lead',
          notes: createdContact.notes_c || '',
          createdAt: createdContact.created_at_c || new Date().toISOString(),
          updatedAt: createdContact.updated_at_c || new Date().toISOString()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating contact:", error?.response?.data?.message || error);
    return null;
  }
};

export const updateContact = async (id, contactData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim(),
        first_name_c: contactData.firstName || '',
        last_name_c: contactData.lastName || '',
        email_c: contactData.email || '',
phone_c: contactData.phone || '',
        company_c: contactData.companyId ? parseInt(contactData.companyId) : null,
        status_c: contactData.status || 'lead',
        notes_c: contactData.notes || '',
        updated_at_c: new Date().toISOString()
      }]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating contact:", response.message);
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
        const updatedContact = successful[0].data;
        return {
          Id: updatedContact.Id,
          firstName: updatedContact.first_name_c || '',
          lastName: updatedContact.last_name_c || '',
          email: updatedContact.email_c || '',
          phone: updatedContact.phone_c || '',
company: updatedContact.company_c?.Name || '',
          companyId: updatedContact.company_c?.Id || null,
          status: updatedContact.status_c || 'lead',
          notes: updatedContact.notes_c || '',
          createdAt: updatedContact.created_at_c || new Date().toISOString(),
          updatedAt: updatedContact.updated_at_c || new Date().toISOString()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating contact:", error?.response?.data?.message || error);
    return null;
  }
};

export const deleteContact = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting contact:", response.message);
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
    console.error("Error deleting contact:", error?.response?.data?.message || error);
    return false;
  }
};