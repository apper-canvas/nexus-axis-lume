import React from "react";
import ApperIcon from "@/components/ApperIcon";

const PlaceholderSection = ({ 
  title, 
  description, 
  icon = "Construction", 
  comingSoon = true 
}) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
          <ApperIcon name={icon} size={96} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        {comingSoon && (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 text-sm font-medium border border-primary-200">
            <ApperIcon name="Clock" size={16} className="mr-2" />
            Coming Soon
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceholderSection;