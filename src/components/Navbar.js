import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any user-related data (e.g., JWT token) from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    toast.info('Logged out successfully!');
    navigate('/'); // Redirect to the login page
  };

  return (
    <nav className="bg-white shadow-md p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-indigo-600">
          UniHub
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            Role: {role === 'Project Manager' ? 'Manager' : 'Member'}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
