import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuClick, user, onLogout, ...props }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:pl-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden -ml-2"
            >
              <ApperIcon name="Menu" size={20} />
            </Button>
          </div>
          
<div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ApperIcon name="Bell" size={20} />
            </Button>
{user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {(user.firstName || 'U').charAt(0).toUpperCase()}
                </div>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;