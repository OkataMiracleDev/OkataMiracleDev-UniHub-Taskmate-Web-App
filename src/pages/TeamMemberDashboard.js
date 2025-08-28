import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import { format } from 'date-fns';

const TeamMemberDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await axios.get('http://localhost:5000/api/tasks/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch tasks.');
    }
  };

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await axios.get('http://localhost:5000/api/tasks/analytics/member', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch analytics.');
    }
  };

  // New function to handle task updates and refresh data
  const handleTaskUpdate = () => {
    fetchTasks();
    fetchAnalytics();
  };

  useEffect(() => {
    // Redirect if not a Team Member
    if (userRole !== 'Team Member') {
      toast.error('Access denied. Redirecting to login.');
      navigate('/');
    }
    handleTaskUpdate(); // Call the combined update function on initial load
  }, [userRole, navigate]);

  return (
    <>
      <Navbar role={userRole} />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">My Tasks</h1>

        {/* Member Analytics Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
          <h2 className="text-2xl font-semibold mb-2 text-gray-700">My Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">Total Assigned</h3>
              <p className="text-2xl font-bold text-indigo-600">{analytics.totalTasks || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">Total Completed</h3>
              <p className="text-2xl font-bold text-green-600">{analytics.totalCompleted || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">Avg. Completion Time</h3>
              <p className="text-2xl font-bold text-blue-600">{analytics.averageCompletionTime || 0} min</p>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard key={task._id} task={task} onTaskUpdate={handleTaskUpdate} />
            ))
          ) : (
            <p className="text-center text-gray-600">No tasks assigned yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default TeamMemberDashboard;