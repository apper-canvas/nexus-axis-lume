import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { getDashboardMetrics, getRevenueChartData, getDealStageDistribution, getActivityMetrics } from "@/services/api/analyticsService";
import Chart from 'react-apexcharts';

const AnalyticsPage = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalDeals: 0,
    conversionRate: 0,
    recentActivities: 0,
    pipelineValue: 0,
    averageDealValue: 0
  });
  const [revenueChartData, setRevenueChartData] = useState({ labels: [], series: [] });
  const [stageDistribution, setStageDistribution] = useState({ labels: [], series: [] });
  const [activityMetrics, setActivityMetrics] = useState({ total: 0, byType: {}, averagePerDay: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboardData, revenueData, stageData, activityData] = await Promise.all([
        getDashboardMetrics(dateRange),
        getRevenueChartData(6),
        getDealStageDistribution(),
        getActivityMetrics(dateRange)
      ]);

      setMetrics(dashboardData);
      setRevenueChartData(revenueData);
      setStageDistribution(stageData);
      setActivityMetrics(activityData);
    } catch (err) {
      console.error("Error loading analytics data:", err);
      setError("Failed to load analytics data");
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const revenueChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    colors: ['#4f46e5'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [50, 100, 100, 100]
      }
    },
    xaxis: {
      categories: revenueChartData.labels,
      labels: { style: { colors: '#6B7280' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#6B7280' },
        formatter: (val) => formatCurrency(val)
      }
    },
    grid: { borderColor: '#E5E7EB' },
    tooltip: {
      y: { formatter: (val) => formatCurrency(val) }
    }
  };

  const stageChartOptions = {
    chart: {
      type: 'donut',
      height: 350,
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
    labels: stageDistribution.labels,
    legend: {
      position: 'bottom',
      labels: { colors: '#6B7280' }
    },
    tooltip: {
      y: { formatter: (val) => `${val} deals` }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Deals',
              color: '#374151',
              formatter: () => stageDistribution.series.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadAnalyticsData} variant="primary">
            <ApperIcon name="RefreshCw" size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your sales performance and get actionable insights
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <Button 
            onClick={loadAnalyticsData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <ApperIcon name="RefreshCw" size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-50 rounded-lg">
              <ApperIcon name="DollarSign" size={24} className="text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-20"></div>
                ) : (
                  formatCurrency(metrics.totalRevenue)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-50 rounded-lg">
              <ApperIcon name="Target" size={24} className="text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deals</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-16"></div>
                ) : (
                  metrics.totalDeals
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-warning-50 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} className="text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-12"></div>
                ) : (
                  `${metrics.conversionRate.toFixed(1)}%`
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-error-50 rounded-lg">
              <ApperIcon name="Activity" size={24} className="text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-14"></div>
                ) : (
                  activityMetrics.total
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <Badge variant="primary">Last 6 months</Badge>
          </div>
          {loading ? (
            <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <Chart
              options={revenueChartOptions}
              series={revenueChartData.series}
              type="area"
              height={320}
            />
          )}
        </div>

        {/* Deal Stage Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Deal Pipeline</h3>
            <Badge variant="secondary">Current</Badge>
          </div>
          {loading ? (
            <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <Chart
              options={stageChartOptions}
              series={stageDistribution.series}
              type="donut"
              height={320}
            />
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pipeline Value */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Metrics</h3>
            <ApperIcon name="PieChart" size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pipeline Value</span>
              <span className="font-semibold text-gray-900">
                {loading ? (
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
                ) : (
                  formatCurrency(metrics.pipelineValue)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Deal Value</span>
              <span className="font-semibold text-gray-900">
                {loading ? (
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                ) : (
                  formatCurrency(metrics.averageDealValue)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
            <ApperIcon name="Calendar" size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Average</span>
              <span className="font-semibold text-gray-900">
                {loading ? (
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-8"></div>
                ) : (
                  `${activityMetrics.averagePerDay} per day`
                )}
              </span>
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-full"></div>
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4"></div>
                </div>
              ) : (
                Object.entries(activityMetrics.byType).slice(0, 3).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 capitalize">{type}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;