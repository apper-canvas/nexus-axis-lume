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
        {"field": {"Name": "customer_name_c"}},
        {"field": {"Name": "amount_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "valid_until_c"}},
        {"field": {"Name": "items_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "updated_at_c"}}
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
      validUntil: quote.valid_until_c || '',
      items: (() => {
        try {
          return quote.items_c ? JSON.parse(quote.items_c) : [];
        } catch (error) {
          console.warn('Failed to parse quote items JSON:', error);
          return [];
        }
      })(),
      notes: quote.notes_c || '',
      createdAt: quote.created_at_c || new Date().toISOString(),
      updatedAt: quote.updated_at_c || new Date().toISOString()
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
        {"field": {"Name": "customer_name_c"}},
        {"field": {"Name": "amount_c"}},
        {"field": {"Name": "status_c"}},
        {"field": {"Name": "valid_until_c"}},
        {"field": {"Name": "items_c"}},
        {"field": {"Name": "notes_c"}},
        {"field": {"Name": "created_at_c"}},
        {"field": {"Name": "updated_at_c"}}
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
      items: (() => {
        try {
          return quote.items_c ? JSON.parse(quote.items_c) : [];
        } catch (error) {
          console.warn('Failed to parse quote items JSON:', error);
          return [];
        }
      })(),
      notes: quote.notes_c || '',
      createdAt: quote.created_at_c || new Date().toISOString(),
      updatedAt: quote.updated_at_c || new Date().toISOString()
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
        amount_c: parseFloat(quoteData.amount) || 0,
        status_c: quoteData.status || 'Draft',
        valid_until_c: quoteData.validUntil || '',
        items_c: JSON.stringify(quoteData.items || []),
        notes_c: quoteData.notes || '',
        created_at_c: new Date().toISOString(),
        updated_at_c: new Date().toISOString()
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
          items: (() => {
            try {
              return createdQuote.items_c ? JSON.parse(createdQuote.items_c) : [];
            } catch (error) {
              console.warn('Failed to parse quote items JSON:', error);
              return [];
            }
          })(),
          notes: createdQuote.notes_c || '',
          createdAt: createdQuote.created_at_c || new Date().toISOString(),
          updatedAt: createdQuote.updated_at_c || new Date().toISOString()
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
        customer_name_c: quoteData.customerName || '',
        amount_c: parseFloat(quoteData.amount) || 0,
        status_c: quoteData.status || 'Draft',
        valid_until_c: quoteData.validUntil || '',
        items_c: JSON.stringify(quoteData.items || []),
        notes_c: quoteData.notes || '',
        updated_at_c: new Date().toISOString()
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
          amount: updatedQuote.amount_c || 0,
          status: updatedQuote.status_c || 'Draft',
          validUntil: updatedQuote.valid_until_c || '',
          items: (() => {
            try {
              return updatedQuote.items_c ? JSON.parse(updatedQuote.items_c) : [];
            } catch (error) {
              console.warn('Failed to parse quote items JSON:', error);
              return [];
            }
          })(),
          notes: updatedQuote.notes_c || '',
          createdAt: updatedQuote.created_at_c || new Date().toISOString(),
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