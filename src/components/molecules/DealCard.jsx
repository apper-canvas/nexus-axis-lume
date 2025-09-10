import React from "react";
import { format, isValid } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const DealCard = ({ deal, onDragStart, onEdit, onDelete, isDragged }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 75) return "text-green-600 bg-green-50";
    if (probability >= 50) return "text-yellow-600 bg-yellow-50";
    if (probability >= 25) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const isOverdue = deal.expectedCloseDate && isValid(new Date(deal.expectedCloseDate)) && new Date(deal.expectedCloseDate) < new Date() && deal.stage !== "Closed";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 shadow-sm cursor-move transition-all duration-200 hover:shadow-md",
        isDragged && "opacity-50 scale-95"
      )}
    >
      {/* Deal Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
          {deal.name}
        </h4>
        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <ApperIcon name="Edit2" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-600 p-1"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex items-center space-x-2 mb-3">
        <ApperIcon name="User" size={14} className="text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-600 truncate">{deal.contactName}</span>
      </div>

      {/* Deal Value */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-bold text-gray-900">
          {formatCurrency(deal.value)}
        </div>
        <div className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          getProbabilityColor(deal.probability)
        )}>
          {deal.probability}%
        </div>
      </div>

      {/* Expected Close Date */}
      <div className="flex items-center space-x-2 mb-2">
        <ApperIcon 
          name="Calendar" 
          size={14} 
          className={cn(
            "flex-shrink-0",
            isOverdue ? "text-red-500" : "text-gray-400"
          )} 
        />
<span className={cn(
          "text-sm",
          isOverdue ? "text-red-600" : "text-gray-600"
        )}>
          {deal.expectedCloseDate && isValid(new Date(deal.expectedCloseDate)) ? format(new Date(deal.expectedCloseDate), "MMM d, yyyy") : 'No date set'}
        </span>
        {isOverdue && (
          <Badge variant="error" className="text-xs">
            Overdue
          </Badge>
        )}
      </div>

      {/* Description */}
      {deal.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {deal.description}
        </p>
      )}

      {/* Drag Indicator */}
      <div className="flex justify-center mt-3">
        <ApperIcon name="GripVertical" size={16} className="text-gray-300" />
      </div>
    </div>
  );
};

export default DealCard;