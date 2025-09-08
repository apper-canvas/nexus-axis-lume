import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import CompanyModal from "@/components/organisms/CompanyModal";
import CompanyList from "@/components/organisms/CompanyList";
import { createCompany, deleteCompany, getCompanies, updateCompany } from "@/services/api/companyService";

const CompaniesPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

const loadCompanies = async (searchTerm = '') => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCompanies(searchTerm);
      setCompanies(Array.isArray(result) ? result : []);
    } catch (err) {
      setError('Failed to load companies');
      console.error('Error loading companies:', err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

const handleSearch = (searchTerm) => {
    loadCompanies(searchTerm);
  };

const handleAddCompany = () => {
    setSelectedCompany(null);
    setShowModal(true);
  };

const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteCompany(companyId);
      if (success) {
        toast.success('Company deleted successfully');
        setCompanies(prev => prev.filter(c => c.Id !== companyId));
      } else {
        toast.error('Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

const handleViewProfile = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

const handleSaveCompany = async (companyData) => {
    setIsSubmitting(true);
    try {
      let savedCompany;
      
      if (selectedCompany?.Id) {
        // Update existing company
        savedCompany = await updateCompany(selectedCompany.Id, companyData);
        if (savedCompany) {
          setCompanies(prev => 
            prev.map(c => c.Id === selectedCompany.Id ? { ...savedCompany, contactCount: c.contactCount, dealCount: c.dealCount } : c)
          );
          toast.success('Company updated successfully');
        } else {
          toast.error('Failed to update company');
        }
      } else {
        // Create new company
        savedCompany = await createCompany(companyData);
        if (savedCompany) {
          setCompanies(prev => [savedCompany, ...prev]);
          toast.success('Company created successfully');
        } else {
          toast.error('Failed to create company');
        }
      }

      if (savedCompany) {
        setShowModal(false);
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

if (loading && companies.length === 0) {
    return <Loading />;
  }
  if (error && companies.length === 0) {
return <Error message={error} onRetry={() => loadCompanies()} />;
  }

  return (
    <div className="space-y-6">
<CompanyList
        companies={companies}
        loading={loading}
        onAddCompany={handleAddCompany}
        onEditCompany={handleEditCompany}
        onDeleteCompany={handleDeleteCompany}
        onViewProfile={handleViewProfile}
        onSearch={handleSearch}
      />

      <CompanyModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onSave={handleSaveCompany}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CompaniesPage;