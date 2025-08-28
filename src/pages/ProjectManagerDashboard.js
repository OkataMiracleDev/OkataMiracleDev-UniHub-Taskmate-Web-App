// /src/pages/ProjectManagerDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';

// --- TaskCard Component (copied from previous response for completeness) ---
const TaskCard = ({ task, teamMembers }) => {
    const assignedMember = teamMembers.find(member => member._id === task.assignedTo);
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
            <p className="text-gray-600 mb-2">{task.description}</p>
            <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
                    {task.status}
                </span>
                {assignedMember && (
                    <div className="flex items-center space-x-2">
                        {assignedMember.profilePhoto ? (
                            <img src={assignedMember.profilePhoto} alt={`${assignedMember.name}`} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <FaUserCircle className="w-6 h-6 text-gray-400" />
                        )}
                        <p className="text-sm text-gray-600">Assigned to: {assignedMember.name}</p>
                    </div>
                )}
            </div>
            {task.status === 'Completed' && (
                <div className="mt-4">
                    {task.completionProof && (
                        <div className="mt-2">
                            <h4 className="font-semibold text-sm">Proof:</h4>
                            <img src={task.completionProof} alt="Completion Proof" className="mt-1 w-full max-h-48 object-cover rounded-md" />
                        </div>
                    )}
                    {task.deliverableLink && (
                        <a href={task.deliverableLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm mt-2 block">
                            View Deliverable
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

// --- ProjectManagerDashboard Component (updated) ---
const ProjectManagerDashboard = ({ Navbar }) => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [newTask, setNewTask] = useState({ assignedToId: '', title: '', description: '' });
    const [teamCode, setTeamCode] = useState('');
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    const fetchAllData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
            // Fetch user profile to get the team code
            const userRes = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeamCode(userRes.data.user.teamCode);

            // Fetch team members
            const membersRes = await axios.get('http://localhost:5000/api/users/team', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeamMembers(membersRes.data);

            // Fetch tasks
            const tasksRes = await axios.get('http://localhost:5000/api/tasks/assigned', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(tasksRes.data);

            // Fetch analytics
            const analyticsRes = await axios.get('http://localhost:5000/api/tasks/analytics/manager', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load dashboard data.');
            // Do not navigate on error, so the user can see what's wrong.
        }
    };

    useEffect(() => {
        if (userRole !== 'Project Manager') {
            toast.error('Access denied. Redirecting to login.');
            navigate('/');
        }
        fetchAllData();
    }, [userRole, navigate]);

    const handleAssignTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.post(
                'http://localhost:5000/api/tasks/assign',
                newTask,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Task assigned successfully!');
            setNewTask({ assignedToId: '', title: '', description: '' });
            fetchAllData(); // Refresh all data
        } catch (error) {
            toast.error('Failed to assign task.');
            console.error(error);
        }
    };

    return (
        <>
            <Navbar role={userRole} />
            <div className="container mx-auto p-4 mt-8">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Project Manager Dashboard</h1>

                {teamCode && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Your Team Code</h2>
                        <p className="text-xl font-bold text-center text-indigo-600 p-4 bg-indigo-50 rounded-lg">
                            {teamCode}
                        </p>
                        <p className="text-sm text-center text-gray-500 mt-2">
                            Share this code with your team members so they can join your project.
                        </p>
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Assign a New Task</h2>
                    <form onSubmit={handleAssignTask} className="space-y-4">
                        <select
                            value={newTask.assignedToId}
                            onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="">Select Team Member</option>
                            {teamMembers.map((member) => (
                                <option key={member._id} value={member._id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Task Title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        <textarea
                            placeholder="Task Description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows="4"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Assign Task
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Team Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamMembers.length > 0 ? (
                            teamMembers.map((member) => (
                                <div key={member._id} className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center space-x-4">
                                    {member.profilePhoto ? (
                                        <img src={member.profilePhoto} alt={`${member.name}`} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <FaUserCircle className="w-12 h-12 text-gray-400" />
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold">{member.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            Completed Tasks: {analytics[member._id]?.completedTasks || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Avg. Completion Time: {analytics[member._id]?.averageCompletionTime || 'N/A'} min
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-600">No team members found.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Assigned Tasks</h2>
                    <div className="space-y-4">
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <TaskCard key={task._id} task={task} teamMembers={teamMembers} />
                            ))
                        ) : (
                            <p className="text-center text-gray-600">No tasks assigned yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProjectManagerDashboard;
