import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const TaskCard = ({ task, onTaskUpdate }) => {
  const [proofFile, setProofFile] = useState(null);
  const [deliverableLink, setDeliverableLink] = useState('');

  // Function to handle starting a task, changing its status to 'In Progress'
  const handleStartTask = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You are not logged in.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/tasks/start/${task._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Task started!');
      onTaskUpdate(); // Refresh the task list to reflect the new status
    } catch (error) {
      toast.error('Failed to start task.');
      console.error(error);
    }
  };

  // Function to handle the file input change event
  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  // Function to handle the deliverable link input change event
  const handleDeliverableLinkChange = (e) => {
    setDeliverableLink(e.target.value);
  };

  // Function to handle submitting a task and changing its status to 'Completed'
  const handleSubmitTask = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You are not logged in.");
      return;
    }

    // Ensure at least a file or a link is provided
    if (!proofFile && !deliverableLink) {
      toast.error('Please provide a file or a link.');
      return;
    }

    let proofBase64 = null;
    
    // Check if a file was selected
    if (proofFile) {
      const reader = new FileReader();
      reader.readAsDataURL(proofFile);
      reader.onloadend = async () => {
        proofBase64 = reader.result;
        try {
          // Send a PUT request with the deliverable link and base64 encoded proof file
          await axios.put(
            `http://localhost:5000/api/tasks/submit/${task._id}`,
            { deliverableLink, proofBase64 },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          toast.success('Task submitted successfully!');
          onTaskUpdate();
        } catch (error) {
          toast.error('Failed to submit task.');
          console.error(error);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast.error("Error reading file.");
      };
    } else {
        try {
          // Send a PUT request with only the deliverable link if no file was selected
          await axios.put(
            `http://localhost:5000/api/tasks/submit/${task._id}`,
            { deliverableLink },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          toast.success('Task submitted successfully!');
          onTaskUpdate();
        } catch (error) {
          toast.error('Failed to submit task.');
          console.error(error);
        }
    }
  };

  // Helper function to dynamically set status color for the badge
  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h3 className="text-xl font-bold mb-2 text-gray-800">{task.title}</h3>
      <p className="text-gray-600 mb-4">{task.description}</p>
      <div className="flex items-center mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </div>

      {/* Renders the "Start Task" button if the status is 'Assigned' or 'Pending' */}
      {(task.status === 'Assigned' || task.status === 'Pending') && (
        <button
          onClick={handleStartTask}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mb-4"
        >
          Start Task
        </button>
      )}

      {/* Renders the submission form when the task is 'In Progress' */}
      {task.status === 'In Progress' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Deliverable Link (Optional)"
            value={deliverableLink}
            onChange={handleDeliverableLinkChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-gray-600"
          />
          <button
            onClick={handleSubmitTask}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark as Complete
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
