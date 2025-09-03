import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const tableName = 'company_c';

export const getCompanies = async (searchTerm = '') => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "industry_c"}},
        {"field": {"Name": "website_c"}},
        {"field": {"Name": "address_c"}},
        {"field": {"Name": "notes_c"}}
      ],
      orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}]
    };

    // Add search filter if provided
    if (searchTerm) {
      params.where = [
        {"FieldName": "name_c", "Operator": "Contains", "Values": [searchTerm], "Include": true}
      ];
    }
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching companies:", response.message);
      toast.error(response.message);
      return [];
    }
    
    if (!response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data.map(company => ({
      Id: company.Id,
      name: company.name_c || company.Name || '',
      industry: company.industry_c?.Name || '',
      industryId: company.industry_c?.Id || null,
      website: company.website_c || '',
      address: company.address_c || '',
      notes: company.notes_c || ''
    }));
  } catch (error) {
    console.error("Error fetching companies:", error?.response?.data?.message || error);
    return [];
  }
};

export const getCompanyById = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "industry_c"}},
        {"field": {"Name": "website_c"}},
        {"field": {"Name": "address_c"}},
        {"field": {"Name": "notes_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response?.data) {
      return null;
    }
    
    const company = response.data;
    return {
      Id: company.Id,
      name: company.name_c || company.Name || '',
      industry: company.industry_c?.Name || '',
      industryId: company.industry_c?.Id || null,
      website: company.website_c || '',
      address: company.address_c || '',
      notes: company.notes_c || ''
    };
  } catch (error) {
    console.error(`Error fetching company ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

export const createCompany = async (companyData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Name: companyData.name || '',
        name_c: companyData.name || '',
        industry_c: companyData.industryId ? parseInt(companyData.industryId) : null,
        website_c: companyData.website || '',
        address_c: companyData.address || '',
        notes_c: companyData.notes || ''
      }]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating company:", response.message);
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
        const createdCompany = successful[0].data;
        return {
          Id: createdCompany.Id,
          name: createdCompany.name_c || createdCompany.Name || '',
          industry: createdCompany.industry_c?.Name || '',
          industryId: createdCompany.industry_c?.Id || null,
          website: createdCompany.website_c || '',
          address: createdCompany.address_c || '',
          notes: createdCompany.notes_c || ''
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating company:", error?.response?.data?.message || error);
    return null;
  }
};

export const updateCompany = async (id, companyData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: companyData.name || '',
        name_c: companyData.name || '',
        industry_c: companyData.industryId ? parseInt(companyData.industryId) : null,
        website_c: companyData.website || '',
        address_c: companyData.address || '',
        notes_c: companyData.notes || ''
      }]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating company:", response.message);
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
        const updatedCompany = successful[0].data;
        return {
          Id: updatedCompany.Id,
          name: updatedCompany.name_c || updatedCompany.Name || '',
          industry: updatedCompany.industry_c?.Name || '',
          industryId: updatedCompany.industry_c?.Id || null,
          website: updatedCompany.website_c || '',
          address: updatedCompany.address_c || '',
          notes: updatedCompany.notes_c || ''
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating company:", error?.response?.data?.message || error);
    return null;
  }
};

export const deleteCompany = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting company:", response.message);
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
    console.error("Error deleting company:", error?.response?.data?.message || error);
    return false;
  }
};