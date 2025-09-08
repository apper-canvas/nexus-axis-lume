import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const tableName = 'quote_c';

export const getQuotes = async () => {
try {
    const apperClient = getApperClient();
    const params = {
fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "contact_id_c"}},
        {"field": {"Name": "value_c"}},
        {"field": {"Name": "quote_date_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "discount_c"}},
        {"field": {"Name": "gst_c"}}
      ],
      orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching quotes:", response.message);
      toast.error(response.message);
      return [];
    }
    
    if (!response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data.map(quote => ({
      Id: quote.Id,
      customerName: quote.customer_name_c || '',
      amount: quote.amount_c || 0,
      status: quote.status_c || 'Draft',
name: quote.name_c || '',
      customerName: quote.contact_id_c?.Name || '',
      contactId: quote.contact_id_c?.Id || null,
      amount: quote.value_c || 0,
      status: quote.status_c || 'Draft',
      validUntil: quote.quote_date_c || '',
      discount: quote.discount_c || null,
      gst: quote.gst_c || null
    }));
  } catch (error) {
    console.error("Error fetching quotes:", error?.response?.data?.message || error);
    return [];
  }
};

export const getQuoteById = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
{"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "name_c"}},
        {"field": {"Name": "contact_id_c"}},
        {"field": {"Name": "value_c"}},
        {"field": {"Name": "quote_date_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "discount_c"}},
        {"field": {"Name": "gst_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response?.data) {
      return null;
    }
    
    const quote = response.data;
    return {
      Id: quote.Id,
      customerName: quote.customer_name_c || '',
      amount: quote.amount_c || 0,
      status: quote.status_c || 'Draft',
      validUntil: quote.valid_until_c || '',
name: quote.name_c || '',
      customerName: quote.contact_id_c?.Name || '',
      contactId: quote.contact_id_c?.Id || null,
      amount: quote.value_c || 0,
      status: quote.status_c || 'Draft',
      validUntil: quote.quote_date_c || '',
      discount: quote.discount_c || null,
      gst: quote.gst_c || null
    };
  } catch (error) {
    console.error(`Error fetching quote ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

export const createQuote = async (quoteData) => {
try {
    const apperClient = getApperClient();
    const params = {
      records: [{
        Name: quoteData.customerName || '',
        customer_name_c: quoteData.customerName || '',
name_c: quoteData.name || '',
        contact_id_c: quoteData.contactId || null,
        value_c: parseFloat(quoteData.amount) || 0,
        quote_date_c: quoteData.validUntil || '',
        status_c: quoteData.status || 'Draft',
        discount_c: quoteData.discount || null,
        gst_c: quoteData.gst || null
      }]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating quote:", response.message);
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
        const createdQuote = successful[0].data;
        return {
          Id: createdQuote.Id,
          customerName: createdQuote.customer_name_c || '',
          amount: createdQuote.amount_c || 0,
          status: createdQuote.status_c || 'Draft',
validUntil: createdQuote.valid_until_c || '',
          discount: createdQuote.discount_c || null,
name: createdQuote.name_c || '',
          customerName: createdQuote.contact_id_c?.Name || '',
          contactId: createdQuote.contact_id_c?.Id || null,
          amount: createdQuote.value_c || 0,
          status: createdQuote.status_c || 'Draft',
          validUntil: createdQuote.quote_date_c || '',
          discount: createdQuote.discount_c || null,
          gst: createdQuote.gst_c || null
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating quote:", error?.response?.data?.message || error);
    return null;
  }
};

export const updateQuote = async (id, quoteData) => {
try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: quoteData.customerName || '',
name_c: quoteData.name || '',
        contact_id_c: quoteData.contactId || null,
        value_c: parseFloat(quoteData.amount) || 0,
        quote_date_c: quoteData.validUntil || '',
        status_c: quoteData.status || 'Draft',
        discount_c: quoteData.discount || null,
        gst_c: quoteData.gst || null
      }]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating quote:", response.message);
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
        const updatedQuote = successful[0].data;
        return {
          Id: updatedQuote.Id,
          customerName: updatedQuote.customer_name_c || '',
name: updatedQuote.name_c || '',
          customerName: updatedQuote.contact_id_c?.Name || '',
          contactId: updatedQuote.contact_id_c?.Id || null,
          amount: updatedQuote.value_c || 0,
          status: updatedQuote.status_c || 'Draft',
          validUntil: updatedQuote.quote_date_c || '',
          discount: updatedQuote.discount_c || null,
          gst: updatedQuote.gst_c || null,
          createdAt: updatedQuote.CreatedOn || new Date().toISOString(),
          updatedAt: updatedQuote.updated_at_c || new Date().toISOString()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating quote:", error?.response?.data?.message || error);
    return null;
  }
};

export const deleteQuote = async (id) => {
try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting quote:", response.message);
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
    console.error("Error deleting quote:", error?.response?.data?.message || error);
    return false;
  }
};