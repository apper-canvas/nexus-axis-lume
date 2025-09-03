import contactsData from "@/services/mockData/contacts.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create a copy of the data to simulate persistence
let contacts = [...contactsData];

export const getContacts = async () => {
  await delay(300);
  return [...contacts];
};

export const getContactById = async (id) => {
  await delay(200);
  const contact = contacts.find(c => c.Id === parseInt(id));
  if (!contact) {
    throw new Error("Contact not found");
  }
  return { ...contact };
};

export const createContact = async (contactData) => {
  await delay(500);
  
  // Find the highest existing Id and add 1
  const maxId = Math.max(...contacts.map(c => c.Id), 0);
  const newContact = {
    ...contactData,
    Id: maxId + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  contacts.push(newContact);
  return { ...newContact };
};

export const updateContact = async (id, contactData) => {
  await delay(400);
  
  const index = contacts.findIndex(c => c.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Contact not found");
  }
  
  const updatedContact = {
    ...contacts[index],
    ...contactData,
    Id: parseInt(id), // Ensure Id remains an integer
    updatedAt: new Date().toISOString()
  };
  
  contacts[index] = updatedContact;
  return { ...updatedContact };
};

export const deleteContact = async (id) => {
  await delay(300);
  
  const index = contacts.findIndex(c => c.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Contact not found");
  }
  
  contacts.splice(index, 1);
  return true;
};