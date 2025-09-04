import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
const navigation = [
    { name: "Contacts", href: "/", icon: "Users" },
    { name: "Deals", href: "/deals", icon: "TrendingUp" },
    { name: "Tasks", href: "/tasks", icon: "CheckSquare" },
    { name: "Companies", href: "/companies", icon: "Building2" },
    { name: "Quotes", href: "/quotes", icon: "FileText" },
    { name: "Analytics", href: "/analytics", icon: "BarChart3" },
    { name: "Settings", href: "/settings", icon: "Settings" }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ApperIcon name="Zap" size={24} className="text-primary-400" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-white">Nexus CRM</h1>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                )}
              >
                <ApperIcon name={item.icon} size={20} className="mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-gradient-to-b lg:from-slate-900 lg:via-slate-800 lg:to-slate-900">
        <div className="flex items-center h-16 px-6 border-b border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ApperIcon name="Zap" size={24} className="text-primary-400" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-white">Nexus CRM</h1>
          </div>
        </div>
        
        <nav className="flex-1 mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                )}
              >
                <ApperIcon name={item.icon} size={20} className="mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;