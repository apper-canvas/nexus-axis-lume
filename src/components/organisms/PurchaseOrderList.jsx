import React, { useMemo, useState } from "react";
import { format, isValid } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import StatusFilter from "@/components/molecules/StatusFilter";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

function PurchaseOrderList({ 
  purchaseOrders, 
  onAddPurchaseOrder, 
  onEditPurchaseOrder, 
  onDeletePurchaseOrder 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const statusOptions = [
{ value: "all", label: "All Status", count: purchaseOrders.length },
    { value: "Draft", label: "Draft", count: purchaseOrders.filter(po => po.status_c === "Draft").length },
    { value: "Ordered", label: "Ordered", count: purchaseOrders.filter(po => po.status_c === "Ordered").length },
    { value: "Received", label: "Received", count: purchaseOrders.filter(po => po.status_c === "Received").length },
    { value: "Cancelled", label: "Cancelled", count: purchaseOrders.filter(po => po.status_c === "Cancelled").length }
  ];

  const filteredAndSortedPurchaseOrders = useMemo(() => {
    let filtered = purchaseOrders;

    // Filter by search term
    if (searchTerm) {
filtered = filtered.filter(po =>
        po.name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.vendor_c?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.contact_id_c?.Name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
if (statusFilter !== "all") {
      filtered = filtered.filter(po => po.status_c === statusFilter);
    }

    // Sort purchase orders
    filtered.sort((a, b) => {
      let aValue, bValue;
      
switch (sortBy) {
        case "name":
          aValue = a.name_c?.toLowerCase() || "";
          bValue = b.name_c?.toLowerCase() || "";
          break;
        case "vendor":
          aValue = a.vendor_c?.Name?.toLowerCase() || "";
          bValue = b.vendor_c?.Name?.toLowerCase() || "";
          break;
        case "orderDate":
          aValue = (a.order_date_c && isValid(new Date(a.order_date_c))) ? new Date(a.order_date_c) : new Date(0);
          bValue = (b.order_date_c && isValid(new Date(b.order_date_c))) ? new Date(b.order_date_c) : new Date(0);
          break;
        case "totalValue":
          aValue = a.total_value_c || 0;
          bValue = b.total_value_c || 0;
          break;
        case "created":
          aValue = new Date(a.CreatedOn || 0);
          bValue = new Date(b.CreatedOn || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [purchaseOrders, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "ArrowUpDown";
    return sortOrder === "asc" ? "ArrowUp" : "ArrowDown";
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Draft": return "default";
      case "Ordered": return "warning";
      case "Received": return "success";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600">Manage your procurement and vendor orders</p>
        </div>
        <Button onClick={onAddPurchaseOrder} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Purchase Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search purchase orders..."
          className="flex-1 max-w-md"
        />
        <StatusFilter
          activeStatus={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
        />
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <ApperIcon name={getSortIcon("name")} size={14} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("vendor")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vendor</span>
                    <ApperIcon name={getSortIcon("vendor")} size={14} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("orderDate")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Order Date</span>
                    <ApperIcon name={getSortIcon("orderDate")} size={14} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("totalValue")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Value</span>
                    <ApperIcon name={getSortIcon("totalValue")} size={14} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedPurchaseOrders.map((purchaseOrder) => (
                <tr 
                  key={purchaseOrder.Id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                        <ApperIcon name="ShoppingCart" size={16} />
                      </div>
                      <div className="ml-4">
<div className="text-sm font-medium text-gray-900">
                          {purchaseOrder.name_c}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-gray-900">{purchaseOrder.vendor_c?.Name || 'No Vendor'}</div>
                  </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Calendar" size={14} />
                      {purchaseOrder.order_date_c && isValid(new Date(purchaseOrder.order_date_c)) ? format(new Date(purchaseOrder.order_date_c), "MMM d, yyyy") : 'No Date'}
</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <ApperIcon name="DollarSign" size={14} />
                      {formatCurrency(purchaseOrder.total_value_c)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
<Badge variant={getStatusVariant(purchaseOrder.status_c)}>
                      {purchaseOrder.status_c}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-gray-900">{purchaseOrder.contact_id_c?.Name || 'No Contact'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPurchaseOrder(purchaseOrder)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <ApperIcon name="Edit2" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePurchaseOrder(purchaseOrder.Id)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSortedPurchaseOrders.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Get started by creating your first purchase order"
            }
          </p>
          {(!searchTerm && statusFilter === "all") && (
            <Button onClick={onAddPurchaseOrder} variant="primary">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create Your First Purchase Order
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;