import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const analyticsDataTable = 'analytics_data_c';
const analyticsFeatureTable = 'analytics_feature_c';

export const getAnalyticsData = async (filters = {}) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "Owner"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "ModifiedOn"}},
        {"field": {"Name": "metric_name_c"}},
        {"field": {"Name": "metric_value_c"}},
        {"field": {"Name": "metric_date_c"}},
        {"field": {"Name": "metric_type_c"}},
        {"field": {"Name": "related_entity_type_c"}},
        {"field": {"Name": "related_entity_id_c"}},
        {"field": {"Name": "calculation_method_c"}},
        {"field": {"Name": "time_period_c"}},
        {"field": {"Name": "additional_data_c"}}
      ],
      orderBy: [{"fieldName": "metric_date_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    };

    // Add date filtering if provided
    if (filters.startDate && filters.endDate) {
      params.where = [{
        "FieldName": "metric_date_c",
        "Operator": "GreaterThanOrEqualTo",
        "Values": [filters.startDate],
        "Include": true
      }, {
        "FieldName": "metric_date_c",
        "Operator": "LessThanOrEqualTo", 
        "Values": [filters.endDate],
        "Include": true
      }];
    }

    const response = await apperClient.fetchRecords(analyticsDataTable, params);
    
    if (!response.success) {
      console.error("Error fetching analytics data:", response.message);
      toast.error(response.message);
      return [];
    }

    if (!response.data || response.data.length === 0) {
      return [];
    }

    return response.data.map(item => ({
      Id: item.Id,
      name: item.Name || '',
      tags: item.Tags || '',
      owner: item.Owner?.Name || '',
      ownerId: item.Owner?.Id || null,
      createdOn: item.CreatedOn || '',
      modifiedOn: item.ModifiedOn || '',
      metricName: item.metric_name_c || '',
      metricValue: parseFloat(item.metric_value_c) || 0,
      metricDate: item.metric_date_c || '',
      metricType: item.metric_type_c || '',
      relatedEntityType: item.related_entity_type_c || '',
      relatedEntityId: item.related_entity_id_c || null,
      calculationMethod: item.calculation_method_c || '',
      timePeriod: item.time_period_c || '',
      additionalData: (() => {
        try {
          return item.additional_data_c ? JSON.parse(item.additional_data_c) : {};
        } catch (error) {
          console.warn('Failed to parse additional data JSON:', error);
          return {};
        }
      })()
    }));
  } catch (error) {
    console.error("Error fetching analytics data:", error?.response?.data?.message || error);
    return [];
  }
};

export const getDashboardMetrics = async (dateRange = 30) => {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Import dealService and activityService to calculate metrics
    const { getDeals } = await import('./dealService.js');
    const { getActivities } = await import('./activityService.js');
    
    const [deals, activities] = await Promise.all([
      getDeals(),
      getActivities()
    ]);

    // Calculate revenue metrics
    const totalRevenue = deals.reduce((sum, deal) => {
      if (deal.stage === 'Closed' && deal.value) {
        return sum + parseFloat(deal.value);
      }
      return sum;
    }, 0);

    const totalDeals = deals.length;
    const closedDeals = deals.filter(deal => deal.stage === 'Closed').length;
    const conversionRate = totalDeals > 0 ? ((closedDeals / totalDeals) * 100) : 0;
    
    const recentActivities = activities.filter(activity => {
      if (!activity.activityDate) return false;
      const activityDate = new Date(activity.activityDate);
      const filterStartDate = new Date(startDate);
      return activityDate >= filterStartDate;
    }).length;

    // Calculate pipeline value
    const pipelineValue = deals.reduce((sum, deal) => {
      if (deal.stage !== 'Closed' && deal.value) {
        return sum + parseFloat(deal.value);
      }
      return sum;
    }, 0);

    return {
      totalRevenue,
      totalDeals,
      conversionRate,
      recentActivities,
      pipelineValue,
      averageDealValue: totalDeals > 0 ? totalRevenue / closedDeals || 0 : 0
    };
  } catch (error) {
    console.error("Error calculating dashboard metrics:", error);
    return {
      totalRevenue: 0,
      totalDeals: 0,
      conversionRate: 0,
      recentActivities: 0,
      pipelineValue: 0,
      averageDealValue: 0
    };
  }
};

export const getRevenueChartData = async (months = 6) => {
  try {
    const { getDeals } = await import('./dealService.js');
    const deals = await getDeals();

    // Get last N months
    const monthLabels = [];
    const revenueData = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthLabels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      
      const monthRevenue = deals.reduce((sum, deal) => {
        if (deal.stage === 'Closed' && deal.expectedCloseDate && deal.expectedCloseDate.startsWith(monthKey)) {
          return sum + parseFloat(deal.value || 0);
        }
        return sum;
      }, 0);
      
      revenueData.push(monthRevenue);
    }

    return {
      labels: monthLabels,
      series: [{
        name: 'Revenue',
        data: revenueData
      }]
    };
  } catch (error) {
    console.error("Error generating revenue chart data:", error);
    return {
      labels: [],
      series: []
    };
  }
};

export const getDealStageDistribution = async () => {
  try {
    const { getDeals } = await import('./dealService.js');
    const deals = await getDeals();

    const stageCount = deals.reduce((acc, deal) => {
      const stage = deal.stage || 'Lead';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(stageCount);
    const series = Object.values(stageCount);

    return {
      labels,
      series
    };
  } catch (error) {
    console.error("Error generating deal stage distribution:", error);
    return {
      labels: [],
      series: []
    };
  }
};

export const getActivityMetrics = async (days = 30) => {
  try {
    const { getActivities } = await import('./activityService.js');
    const activities = await getActivities();

    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const recentActivities = activities.filter(activity => {
      if (!activity.activityDate) return false;
      const activityDate = new Date(activity.activityDate);
      return activityDate >= startDate && activityDate <= endDate;
    });

    const activityTypes = recentActivities.reduce((acc, activity) => {
      const type = activity.activityType || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: recentActivities.length,
      byType: activityTypes,
      averagePerDay: Math.round(recentActivities.length / days)
    };
  } catch (error) {
    console.error("Error calculating activity metrics:", error);
    return {
      total: 0,
      byType: {},
      averagePerDay: 0
    };
  }
};

export const createAnalyticsRecord = async (analyticsData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      records: [{
        Name: analyticsData.name || '',
        Tags: analyticsData.tags || '',
        metric_name_c: analyticsData.metricName || '',
        metric_value_c: parseFloat(analyticsData.metricValue) || 0,
        metric_date_c: analyticsData.metricDate || new Date().toISOString(),
        metric_type_c: analyticsData.metricType || '',
        related_entity_type_c: analyticsData.relatedEntityType || '',
        related_entity_id_c: analyticsData.relatedEntityId || null,
        calculation_method_c: analyticsData.calculationMethod || '',
        time_period_c: analyticsData.timePeriod || '',
        additional_data_c: JSON.stringify(analyticsData.additionalData || {})
      }]
    };

    const response = await apperClient.createRecord(analyticsDataTable, params);
    
    if (!response.success) {
      console.error("Error creating analytics record:", response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} analytics records:`, failed);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successful.length > 0) {
        toast.success("Analytics record created successfully");
        return successful[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating analytics record:", error?.response?.data?.message || error);
    return null;
  }
};