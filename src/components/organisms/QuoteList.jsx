import React, { useState, useMemo } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import { cn } from "@/utils/cn";
import { format } from "date-fns";

const QuoteList = ({ 
  quotes, 
  onAddQuote, 
  onEditQuote, 
  onDeleteQuote,
  onSearch,
  searchTerm
}) => {
  const [sortBy, setSortBy] = useState("customerName");
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredAndSortedQuotes = useMemo(() => {
    let filtered = [...quotes];

    // Sort quotes
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "customerName":
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "validUntil":
          aValue = new Date(a.validUntil || 0);
          bValue = new Date(b.validUntil || 0);
          break;
        case "created":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [quotes, sortBy, sortOrder]);

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
    switch (status.toLowerCase()) {
      case "draft": return "secondary";
      case "sent": return "primary";
      case "accepted": return "success";
      case "rejected": return "danger";
      case "expired": return "warning";
      default: return "default";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600">Manage your sales quotes and proposals</p>
        </div>
        <Button onClick={onAddQuote} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Quote
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search quotes..."
          className="flex-1 max-w-md"
        />
        <div className="text-sm text-gray-500">
          {filteredAndSortedQuotes.length} {filteredAndSortedQuotes.length === 1 ? 'quote' : 'quotes'}
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("customerName")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    <ApperIcon name={getSortIcon("customerName")} size={14} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    <ApperIcon name={getSortIcon("amount")} size={14} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ApperIcon name={getSortIcon("status")} size={14} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("validUntil")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Valid Until</span>
                    <ApperIcon name={getSortIcon("validUntil")} size={14} />
                  </div>
</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("created")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    <ApperIcon name={getSortIcon("created")} size={14} />
                  </div>
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedQuotes.map((quote) => (
                <tr 
                  key={quote.Id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                        {quote.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {quote.customerName}
                        </div>
                        {quote.notes && (
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {quote.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
{formatCurrency(quote.amount)}
                    </div>
                  </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.discount ? `${quote.discount}%` : '-'}
                  </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.gst ? `${quote.gst}%` : '-'}
                  </td>
<td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(quote.status)}>
                      {quote.status}
                    </Badge>
                  </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quote.validUntil ? format(new Date(quote.validUntil), "MMM d, yyyy") : 'No date'}
                  </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quote.customerName || 'No customer'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(quote.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditQuote(quote)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <ApperIcon name="Edit2" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteQuote(quote.Id)}
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

      {filteredAndSortedQuotes.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? "Try adjusting your search criteria"
              : "Get started by creating your first quote"
            }
          </p>
          {!searchTerm && (
            <Button onClick={onAddQuote} variant="primary">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create Your First Quote
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuoteList;