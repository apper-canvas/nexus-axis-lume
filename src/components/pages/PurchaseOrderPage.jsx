import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PurchaseOrderList from "@/components/organisms/PurchaseOrderList";
import PurchaseOrderModal from "@/components/organisms/PurchaseOrderModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from "@/services/api/purchaseOrderService";

const PurchaseOrderPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError("");
      await loadCompanies();
      await loadContacts();
      const data = await getPurchaseOrders();
      setPurchaseOrders(data);
    } catch (err) {
      setError("Failed to load purchase orders. Please try again.");
      console.error("Error loading purchase orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const { getCompanies } = await import('@/services/api/companyService');
      const companiesData = await getCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error("Error loading companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setCompaniesLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const { getContacts } = await import('@/services/api/contactService');
      const contactsData = await getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const handleAddPurchaseOrder = () => {
    setSelectedPurchaseOrder(null);
    setIsModalOpen(true);
  };

  const handleEditPurchaseOrder = (purchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setIsModalOpen(true);
  };

  const handleSavePurchaseOrder = async (formData) => {
    try {
      let savedPurchaseOrder;
      
      if (selectedPurchaseOrder) {
        savedPurchaseOrder = await updatePurchaseOrder(selectedPurchaseOrder.Id, formData);
        setPurchaseOrders(prev => 
          prev.map(po => 
            po.Id === selectedPurchaseOrder.Id ? savedPurchaseOrder : po
          )
        );
        toast.success("Purchase order updated successfully!");
      } else {
savedPurchaseOrder = await createPurchaseOrder(formData);
        setPurchaseOrders(prev => [...prev, savedPurchaseOrder]);
        toast.success("Purchase order created successfully!");
      }
    } catch (err) {
      toast.error("Failed to save purchase order. Please try again.");
      console.error("Error saving purchase order:", err);
      return;
    }
  };

  const handleDeletePurchaseOrder = async (purchaseOrderId) => {
    if (!window.confirm("Are you sure you want to delete this purchase order?")) {
      return;
    }

    try {
      await deletePurchaseOrder(purchaseOrderId);
      setPurchaseOrders(prev => prev.filter(po => po.Id !== purchaseOrderId));
      toast.success("Purchase order deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete purchase order. Please try again.");
      console.error("Error deleting purchase order:", err);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadPurchaseOrders} />;
  }

  if (purchaseOrders.length === 0 && !loading) {
    return (
      <Empty
        title="No purchase orders yet"
        description="Start managing your procurement by creating your first purchase order."
        actionLabel="Create Purchase Order"
        onAction={handleAddPurchaseOrder}
        icon="ShoppingCart"
      />
    );
  }

  return (
    <>
      <PurchaseOrderList
        purchaseOrders={purchaseOrders}
        onAddPurchaseOrder={handleAddPurchaseOrder}
        onEditPurchaseOrder={handleEditPurchaseOrder}
        onDeletePurchaseOrder={handleDeletePurchaseOrder}
      />
      
      <PurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        purchaseOrder={selectedPurchaseOrder}
        onSave={handleSavePurchaseOrder}
        companies={companies}
        contacts={contacts}
      />
    </>
  );
};

export default PurchaseOrderPage;