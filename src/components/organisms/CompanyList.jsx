import React, { useState, useMemo } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import { cn } from "@/utils/cn";
import { format } from "date-fns";

const CompanyList = ({
  companies = [],
  loading = false,
  onAddCompany,
  onEditCompany,
  onDeleteCompany,
  onViewProfile,
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const sortedCompanies = useMemo(() => {
    return [...companies].sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      if (sortField === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [companies, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage your business relationships and track opportunities</p>
        </div>
        <Button onClick={onAddCompany} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Company
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search companies..."
          className="flex-1 max-w-md"
        />
        <div className="text-sm text-gray-500">
          {companies.length} {companies.length === 1 ? 'company' : 'companies'}
        </div>
      </div>

      {/* Company Table */}
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
                    <span>Company</span>
                    <ApperIcon name={getSortIcon("name")} size={14} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("industry")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Industry</span>
                    <ApperIcon name={getSortIcon("industry")} size={14} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deals & Contacts
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && companies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <ApperIcon name="Loader2" size={20} className="animate-spin mr-2" />
                      Loading companies...
                    </div>
                  </td>
                </tr>
              ) : sortedCompanies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-500">
                      <ApperIcon name="Building2" size={48} className="mb-2" />
                      <p className="text-lg font-medium">No companies found</p>
                      <p className="text-sm">Get started by adding your first company</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedCompanies.map((company) => (
                  <tr 
                    key={company.Id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div 
                            className="text-sm font-medium text-gray-900 hover:text-primary-600 cursor-pointer"
                            onClick={() => onViewProfile?.(company.Id)}
                          >
                            {company.name}
                          </div>
                          {company.notes && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {company.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {company.industry || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.website ? (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          {company.website}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No website</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {company.address || 'No address'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ApperIcon name="TrendingUp" size={14} className="mr-1" />
                          <span>0 deals</span>
                        </div>
                        <div className="flex items-center">
                          <ApperIcon name="Users" size={14} className="mr-1" />
                          <span>0 contacts</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewProfile?.(company.Id)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <ApperIcon name="Eye" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditCompany?.(company)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ApperIcon name="Edit2" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteCompany?.(company.Id)}
                          className="text-error-600 hover:text-error-700"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyList;