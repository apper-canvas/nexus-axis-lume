import React from "react";
import { cn } from "@/utils/cn";

const StatusFilter = ({ activeStatus, onStatusChange }) => {
  const statuses = [
    { value: "all", label: "All Contacts" },
    { value: "lead", label: "Leads" },
    { value: "prospect", label: "Prospects" },
    { value: "customer", label: "Customers" }
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => onStatusChange(status.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            activeStatus === status.value
              ? "bg-white text-primary-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
          )}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;