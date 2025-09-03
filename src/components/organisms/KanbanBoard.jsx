import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import DealCard from "@/components/molecules/DealCard";
import DealModal from "@/components/organisms/DealModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { getDeals, updateDealStage, deleteDeal } from "@/services/api/dealService";
import { getContacts } from "@/services/api/contactService";
import { cn } from "@/utils/cn";

const PIPELINE_STAGES = [
  { id: "Lead", title: "Lead", color: "bg-gray-100 border-gray-300" },
  { id: "Qualified", title: "Qualified", color: "bg-blue-100 border-blue-300" },
  { id: "Proposal", title: "Proposal", color: "bg-yellow-100 border-yellow-300" },
  { id: "Negotiation", title: "Negotiation", color: "bg-orange-100 border-orange-300" },
  { id: "Closed", title: "Closed", color: "bg-green-100 border-green-300" }
];

const KanbanBoard = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dealsData, contactsData] = await Promise.all([
        getDeals(),
        getContacts()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load deals data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedDeal || draggedDeal.stage === newStage) {
      setDraggedDeal(null);
      return;
    }

    try {
      const updatedDeal = await updateDealStage(draggedDeal.Id, newStage);
      setDeals(prev => prev.map(deal => 
        deal.Id === draggedDeal.Id ? updatedDeal : deal
      ));
      toast.success(`Deal moved to ${newStage}`);
    } catch (error) {
      toast.error("Failed to update deal stage");
      console.error("Error updating deal stage:", error);
    }

    setDraggedDeal(null);
  };

  const handleAddDeal = () => {
    setSelectedDeal(null);
    setShowDealModal(true);
  };

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setShowDealModal(true);
  };

  const handleDeleteDeal = async (dealId) => {
    if (!confirm("Are you sure you want to delete this deal?")) {
      return;
    }

    try {
      await deleteDeal(dealId);
      setDeals(prev => prev.filter(deal => deal.Id !== dealId));
      toast.success("Deal deleted successfully");
    } catch (error) {
      toast.error("Failed to delete deal");
      console.error("Error deleting deal:", error);
    }
  };

  const handleSaveDeal = async (dealData) => {
    try {
      await loadData(); // Refresh data after save
      toast.success(selectedDeal ? "Deal updated successfully" : "Deal created successfully");
      setShowDealModal(false);
    } catch (error) {
      toast.error("Failed to save deal");
      console.error("Error saving deal:", error);
    }
  };

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getTotalValue = (stage) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-gray-600">Track your sales opportunities from lead to close</p>
        </div>
        <Button onClick={handleAddDeal} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {PIPELINE_STAGES.map(stage => {
          const stageDeals = getDealsByStage(stage.id);
          const stageValue = getTotalValue(stage.id);
          return (
            <div key={stage.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">{stage.title}</div>
              <div className="text-2xl font-bold text-gray-900">{stageDeals.length}</div>
              <div className="text-sm text-gray-500">{formatCurrency(stageValue)}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {PIPELINE_STAGES.map(stage => {
          const stageDeals = getDealsByStage(stage.id);
          const isOver = dragOverStage === stage.id;
          
          return (
            <div
              key={stage.id}
              className={cn(
                "flex-shrink-0 w-80 bg-white rounded-lg border-2 border-dashed transition-all duration-200",
                stage.color,
                isOver && "scale-105 shadow-lg"
              )}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{stage.title}</h3>
                  <div className="text-sm text-gray-500">
                    {stageDeals.length} • {formatCurrency(getTotalValue(stage.id))}
                  </div>
                </div>
              </div>

              {/* Deal Cards */}
              <div className="p-4 space-y-3 min-h-[400px]">
                {stageDeals.map(deal => (
                  <DealCard
                    key={deal.Id}
                    deal={deal}
                    onDragStart={() => handleDragStart(deal)}
                    onEdit={() => handleEditDeal(deal)}
                    onDelete={() => handleDeleteDeal(deal.Id)}
                    isDragged={draggedDeal?.Id === deal.Id}
                  />
                ))}
                {stageDeals.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <ApperIcon name="FolderOpen" size={32} className="mx-auto mb-2" />
                    <p className="text-sm">No deals in {stage.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Modal */}
      <DealModal
        isOpen={showDealModal}
        onClose={() => setShowDealModal(false)}
        deal={selectedDeal}
        contacts={contacts}
        onSave={handleSaveDeal}
      />
    </div>
  );
};

export default KanbanBoard;