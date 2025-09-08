import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const tableName = 'comment_c';

export const getComments = async (dealId) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "deal_c"}},
        {"field": {"Name": "comment_text_c"}},
        {"field": {"Name": "comment_author_c"}},
        {"field": {"Name": "comment_date_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ],
      where: [
        {
          "FieldName": "deal_c",
          "Operator": "EqualTo",
          "Values": [parseInt(dealId)],
          "Include": true
        }
      ],
      orderBy: [{"fieldName": "comment_date_c", "sorttype": "DESC"}]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error("Error fetching comments:", response.message);
      toast.error(response.message);
      return [];
    }
    
    if (!response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data.map(comment => ({
      Id: comment.Id,
      dealId: comment.deal_c?.Id || parseInt(dealId),
      text: comment.comment_text_c || '',
      author: comment.comment_author_c?.Name || 'Unknown',
      authorId: comment.comment_author_c?.Id || null,
      date: comment.comment_date_c || comment.CreatedOn || new Date().toISOString(),
      createdOn: comment.CreatedOn || new Date().toISOString(),
      modifiedOn: comment.ModifiedOn || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching comments:", error?.response?.data?.message || error);
    return [];
  }
};

export const getCommentById = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "deal_c"}},
        {"field": {"Name": "comment_text_c"}},
        {"field": {"Name": "comment_author_c"}},
        {"field": {"Name": "comment_date_c"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}}
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response?.data) {
      return null;
    }
    
    const comment = response.data;
    return {
      Id: comment.Id,
      dealId: comment.deal_c?.Id || null,
      text: comment.comment_text_c || '',
      author: comment.comment_author_c?.Name || 'Unknown',
      authorId: comment.comment_author_c?.Id || null,
      date: comment.comment_date_c || comment.CreatedOn || new Date().toISOString(),
      createdOn: comment.CreatedOn || new Date().toISOString(),
      modifiedOn: comment.ModifiedOn || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching comment ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

export const createComment = async (commentData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Name: `Comment on ${commentData.dealName || 'Deal'}`,
        deal_c: parseInt(commentData.dealId),
        comment_text_c: commentData.text || '',
        comment_author_c: commentData.authorId ? parseInt(commentData.authorId) : null,
        comment_date_c: new Date().toISOString()
      }]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error creating comment:", response.message);
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
        const createdComment = successful[0].data;
        toast.success("Comment added successfully");
        return {
          Id: createdComment.Id,
          dealId: createdComment.deal_c?.Id || parseInt(commentData.dealId),
          text: createdComment.comment_text_c || '',
          author: createdComment.comment_author_c?.Name || commentData.authorName || 'Unknown',
          authorId: createdComment.comment_author_c?.Id || commentData.authorId,
          date: createdComment.comment_date_c || new Date().toISOString(),
          createdOn: createdComment.CreatedOn || new Date().toISOString(),
          modifiedOn: createdComment.ModifiedOn || new Date().toISOString()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating comment:", error?.response?.data?.message || error);
    return null;
  }
};

export const updateComment = async (id, commentData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        comment_text_c: commentData.text || '',
        comment_date_c: new Date().toISOString()
      }]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error updating comment:", response.message);
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
        const updatedComment = successful[0].data;
        toast.success("Comment updated successfully");
        return {
          Id: updatedComment.Id,
          dealId: updatedComment.deal_c?.Id || commentData.dealId,
          text: updatedComment.comment_text_c || '',
          author: updatedComment.comment_author_c?.Name || commentData.author || 'Unknown',
          authorId: updatedComment.comment_author_c?.Id || commentData.authorId,
          date: updatedComment.comment_date_c || new Date().toISOString(),
          createdOn: updatedComment.CreatedOn || commentData.createdOn,
          modifiedOn: updatedComment.ModifiedOn || new Date().toISOString()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating comment:", error?.response?.data?.message || error);
    return null;
  }
};

export const deleteComment = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error("Error deleting comment:", response.message);
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
      
      if (successful.length === 1) {
        toast.success("Comment deleted successfully");
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting comment:", error?.response?.data?.message || error);
    return false;
  }
};