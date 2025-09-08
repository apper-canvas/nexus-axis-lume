import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import DealCard from "@/components/molecules/DealCard";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import CompanyModal from "@/components/organisms/CompanyModal";
import { getDeals } from "@/services/api/dealService";
import { getCompanyById, updateCompany } from "@/services/api/companyService";
import { getContacts } from "@/services/api/contactService";
const CompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const [company, setCompany] = useState(null);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadCompanyData();
    }
  }, [id]);

const loadCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load company details
      const companyData = await getCompanyById(parseInt(id));
      if (!companyData) {
        setError('Company not found');
        return;
      }
      setCompany(companyData);

      // Load related data
      const [allDeals, allContacts] = await Promise.all([
        getDeals(),
        getContacts()
      ]);

      // Filter deals and contacts for this company
      const companyContacts = (allContacts || []).filter(contact => 
        contact.companyId === parseInt(id)
      );
      
      const companyDeals = (allDeals || []).filter(deal => 
        deal.contactId && companyContacts.some(contact => 
          contact.Id === deal.contactId
        )
      );

      setDeals(companyDeals);
      setContacts(companyContacts);
    } catch (err) {
      setError('Failed to load company data');
      console.error('Error loading company data:', err);
      setDeals([]);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

const handleEditCompany = async (companyData) => {
    setIsSubmitting(true);
    try {
      const updatedCompany = await updateCompany(id, companyData);
      if (updatedCompany) {
        setCompany({ ...updatedCompany, contactCount: company.contactCount, dealCount: company.dealCount });
        setShowEditModal(false);
        toast.success('Company updated successfully');
      } else {
        toast.error('Failed to update company');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Calculate deal statistics
  const dealStats = useMemo(() => {
    const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const totalDeals = deals.length;
    const activeDeals = deals.filter(deal => deal.status !== 'closed-won' && deal.status !== 'closed-lost').length;
    const closedDeals = deals.filter(deal => deal.status === 'closed-won' || deal.status === 'closed-lost').length;
    const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;

    return {
      totalValue,
      totalDeals,
      activeDeals,
      closedDeals,
      averageDealSize
    };
  }, [deals]);

if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Error 
        message={error} 
        onRetry={loadCompanyData}
        showBackButton
        onBack={() => navigate('/companies')}
      />
    );
  }
  if (!company) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="Building2" size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-lg text-gray-600">Company not found</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/companies')}
          className="mt-4"
        >
          Back to Companies
        </Button>
      </div>
    );
  }

return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/companies')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ApperIcon name="ArrowLeft" size={20} className="mr-2" />
            Back to Companies
          </Button>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowEditModal(true)}
        >
          <ApperIcon name="Edit2" size={16} className="mr-2" />
          Edit Company
        </Button>
      </div>
      {/* Company Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {(company.name || '').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name || 'Unnamed Company'}</h1>
              {company.industry && (
                <Badge variant="secondary" className="mt-2">
                  {company.industry}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {company.website && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Website</label>
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 hover:underline"
              >
                {company.website}
              </a>
            </div>
          )}

          {company.address && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Address</label>
              <p className="text-gray-900">{company.address}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Contacts</label>
            <p className="text-2xl font-bold text-gray-900">{company.contactCount || 0}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Deals</label>
            <p className="text-2xl font-bold text-gray-900">{company.dealCount || 0}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Account Value</label>
            <p className="text-2xl font-bold text-success-600">
              {formatCurrency(dealStats.totalValue)}
            </p>
          </div>
        </div>

        {company.notes && (
          <div className="mt-6 pt-6 border-t">
            <label className="text-sm font-medium text-gray-500 block mb-2">Notes</label>
            <p className="text-gray-700 whitespace-pre-wrap">{company.notes}</p>
          </div>
        )}
</div>
      {/* Deal Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(dealStats.totalValue)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Deals</div>
          <div className="text-2xl font-bold text-gray-900">{dealStats.totalDeals}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-1">Active Deals</div>
          <div className="text-2xl font-bold text-gray-900">{dealStats.activeDeals}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-1">Closed Deals</div>
          <div className="text-2xl font-bold text-gray-900">{dealStats.closedDeals}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-1">Avg Deal Size</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(dealStats.averageDealSize)}</div>
        </div>
      </div>
{/* Deals Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Deals</h2>
          <Button
            variant="secondary"
            onClick={() => navigate('/deals')}
          >
            View All Deals
          </Button>
        </div>
        
        {deals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ApperIcon name="TrendingUp" size={32} className="mx-auto mb-2" />
            <p>No deals associated with this company yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.slice(0, 6).map(deal => (
              <DealCard
                key={deal.Id}
                deal={deal}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
{/* Contacts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
          <Button
            variant="secondary"
            onClick={() => navigate('/contacts')}
          >
            View All Contacts
          </Button>
        </div>
        
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ApperIcon name="Users" size={32} className="mx-auto mb-2" />
            <p>No contacts associated with this company yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.slice(0, 5).map(contact => (
              <div key={contact.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                    {(contact.firstName || '').charAt(0)}{(contact.lastName || '').charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                  </div>
                </div>
                <Badge variant={contact.status === 'lead' ? 'warning' : 'success'}>
                  {contact.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
</div>

      {/* Edit Company Modal */}
      <CompanyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        company={company}
        onSave={handleEditCompany}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CompanyProfile;