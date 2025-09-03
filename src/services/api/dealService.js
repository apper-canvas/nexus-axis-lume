import dealsData from "@/services/mockData/deals.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create a copy of the data to simulate persistence
let deals = [...dealsData];

export const getDeals = async () => {
  await delay(300);
  return [...deals];
};

export const getDealById = async (id) => {
  await delay(200);
  const deal = deals.find(d => d.Id === parseInt(id));
  if (!deal) {
    throw new Error("Deal not found");
  }
  return { ...deal };
};

export const createDeal = async (dealData) => {
  await delay(500);
  
  // Find the highest existing Id and add 1
  const maxId = Math.max(...deals.map(d => d.Id), 0);
  const newDeal = {
    ...dealData,
    Id: maxId + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [{
      Id: 1,
      stage: dealData.stage,
      changedAt: new Date().toISOString(),
      changedBy: "System",
      notes: "Deal created"
    }]
  };
  
  deals.push(newDeal);
  return { ...newDeal };
};

export const updateDeal = async (id, dealData) => {
  await delay(400);
  
  const index = deals.findIndex(d => d.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Deal not found");
  }
  
  const currentDeal = deals[index];
  const updatedDeal = {
    ...currentDeal,
    ...dealData,
    Id: parseInt(id),
    updatedAt: new Date().toISOString()
  };

  // Add history entry if stage changed
  if (dealData.stage && dealData.stage !== currentDeal.stage) {
    const maxHistoryId = Math.max(...(currentDeal.history || []).map(h => h.Id), 0);
    updatedDeal.history = [
      ...(currentDeal.history || []),
      {
        Id: maxHistoryId + 1,
        stage: dealData.stage,
        previousStage: currentDeal.stage,
        changedAt: new Date().toISOString(),
        changedBy: "User",
        notes: `Deal moved from ${currentDeal.stage} to ${dealData.stage}`
      }
    ];
  }
  
  deals[index] = updatedDeal;
  return { ...updatedDeal };
};

export const deleteDeal = async (id) => {
  await delay(300);
  
  const index = deals.findIndex(d => d.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Deal not found");
  }
  
  deals.splice(index, 1);
  return true;
};

export const updateDealStage = async (id, stage) => {
  return await updateDeal(id, { stage });
};