import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ContactList from "@/components/organisms/ContactList";
import ContactModal from "@/components/organisms/ContactModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { getContacts, createContact, updateContact, deleteContact } from "@/services/api/contactService";
const [companies, setCompanies] = useState([]);
const ContactsPage = () => {
const [contacts, setContacts] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const loadContacts = async () => {
    try {
      setLoading(true);
setError("");
      await loadCompanies();
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
      console.error("Error loading contacts:", err);
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

  useEffect(() => {
    loadContacts();
    loadCompanies();
  }, []);

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (formData) => {
    try {
      let savedContact;
      
      if (selectedContact) {
        savedContact = await updateContact(selectedContact.Id, formData);
        setContacts(prev => 
          prev.map(contact => 
            contact.Id === selectedContact.Id ? savedContact : contact
          )
        );
        toast.success("Contact updated successfully!");
      } else {
        savedContact = await createContact(formData);
        setContacts(prev => [...prev, savedContact]);
        toast.success("Contact added successfully!");
      }
    } catch (err) {
      toast.error("Failed to save contact. Please try again.");
      throw err;
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      await deleteContact(contactId);
      setContacts(prev => prev.filter(contact => contact.Id !== contactId));
      toast.success("Contact deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete contact. Please try again.");
      console.error("Error deleting contact:", err);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadContacts} />;
  }

  if (contacts.length === 0 && !loading) {
    return (
      <Empty
        title="No contacts yet"
        description="Start building your customer relationships by adding your first contact."
        actionLabel="Add Contact"
        onAction={handleAddContact}
        icon="Users"
      />
    );
  }

  return (
    <>
      <ContactList
        contacts={contacts}
        onAddContact={handleAddContact}
        onEditContact={handleEditContact}
        onDeleteContact={handleDeleteContact}
      />
      
<ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contact={selectedContact}
        onSave={handleSaveContact}
        companies={companies}
      />
    </>
  );
};

export default ContactsPage;