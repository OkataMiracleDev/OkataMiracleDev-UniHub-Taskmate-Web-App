import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Heroicons - a popular icon library used in Tailwind CSS projects
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  BuildingOfficeIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ArrowRightCircleIcon,
  AcademicCapIcon, // Added for the UniHub logo
} from '@heroicons/react/24/outline';

// --- Navbar Component ---
const Navbar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    toast.info('Logged out successfully!');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 p-4 bg-white/70 backdrop-blur-md shadow-lg border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          <AcademicCapIcon className="h-8 w-8 text-indigo-500" />
          <span>UniHub</span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-gray-600 text-sm font-medium">
            Role: {role === 'Project Manager' ? 'Manager' : 'Member'}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all transform hover:scale-105 shadow-md"
          >
            <KeyIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

// --- AuthForm Component ---
const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [teamCode, setTeamCode] = useState('');

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleFileChange = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !profilePhoto || !role) {
      toast.error('Please fill all required fields and upload a photo.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('profilePhoto', profilePhoto);

      if (role === 'Team Member' && teamCode) {
        formData.append('teamCode', teamCode);
      }

      const { data } = await axios.post(`${API_URL}/api/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      toast.success('Registration successful!');

      if (data.user.role === 'Project Manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.msg || 'Registration failed.';
      toast.error(msg);
      console.error('Registration Error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      toast.success('Login successful!');

      if (data.user.role === 'Project Manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.msg || 'Login failed.';
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-indigo-600">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          {isLogin ? 'Welcome Back!' : 'Join UniHub'}
        </h1>
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
          {!isLogin && (
            <>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-gray-700 text-sm mb-2 font-semibold">Profile Photo (Required)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-gray-700 text-sm mb-2 font-semibold">Role</label>
                <BuildingOfficeIcon className="absolute right-3 top-1/2 translate-y-2 h-5 w-5 text-gray-400 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none"
                >
                  <option value="Team Member">Team Member</option>
                  <option value="Project Manager">Project Manager</option>
                </select>
              </div>
              {role === 'Team Member' && (
                <div className="relative">
                  <ClipboardDocumentCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Team Code"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              )}
            </>
          )}
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              required
            />
          </div>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-md"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-sm text-indigo-600 hover:underline font-medium"
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

// --- TaskCard Component ---
const TaskCard = ({ task, onTaskUpdate }) => {
  const [proofFile, setProofFile] = useState(null);
  const [deliverableLink, setDeliverableLink] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const handleStartTask = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/tasks/start/${task._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Task started!');
      onTaskUpdate();
    } catch (error) {
      toast.error('Failed to start task.');
      console.error(error);
    }
  };

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handleDeliverableLinkChange = (e) => {
    setDeliverableLink(e.target.value);
  };

  const handleSubmitTask = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    if (!proofFile && !deliverableLink) {
      toast.error('Please provide a file or a link.');
      return;
    }

    const formData = new FormData();
    if (proofFile) {
      formData.append('proofFile', proofFile);
    }
    formData.append('deliverableLink', deliverableLink);

    try {
      await axios.put(`${API_URL}/api/tasks/submit/${task._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Task submitted successfully!');
      onTaskUpdate();
    } catch (error) {
      toast.error('Failed to submit task.');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(
            task.status
          )}`}
        >
          {task.status}
        </span>
      </div>
      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{task.description}</p>

      {(task.status === 'Assigned' || task.status === 'Pending') && (
        <button
          onClick={handleStartTask}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-md"
        >
          <ArrowRightCircleIcon className="h-5 w-5" />
          <span>Start Task</span>
        </button>
      )}

      {task.status === 'In Progress' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Deliverable Link (Optional)"
            value={deliverableLink}
            onChange={handleDeliverableLinkChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
          />
          <button
            onClick={handleSubmitTask}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 shadow-md"
          >
            Submit Task
          </button>
        </div>
      )}
    </div>
  );
};

// --- ProjectManagerDashboard Component ---
const ProjectManagerDashboard = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [newTask, setNewTask] = useState({ assignedToId: '', title: '', description: '' });
  const [teamCode, setTeamCode] = useState('');
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.user.role === 'Project Manager') {
        setTeamCode(data.user.teamCode);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch user data.');
    }
  }, [API_URL]);

  const fetchTeamMembers = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/users/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeamMembers(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch team members.');
    }
  }, [API_URL]);

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/tasks/analytics/manager`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch analytics.');
    }
  }, [API_URL]);

  useEffect(() => {
    if (userRole !== 'Project Manager') {
      toast.error('Access denied. Redirecting to login.');
      navigate('/');
      return;
    }

    fetchUserData();
    fetchTeamMembers();
    fetchAnalytics();
  }, [userRole, navigate, fetchUserData, fetchTeamMembers, fetchAnalytics]);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post(
        `${API_URL}/api/tasks/assign`,
        newTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Task assigned successfully!');
      setNewTask({ assignedToId: '', title: '', description: '' });
    } catch (error) {
      toast.error('Failed to assign task.');
      console.error(error);
    }
  };

  return (
    <>
      <Navbar role={userRole} />
      <div className="container mx-auto p-4 sm:p-8 mt-8">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800 tracking-tight">Project Manager Dashboard</h1>

        {teamCode && (
          <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border-l-4 border-indigo-600">
            <h2 className="text-xl font-bold mb-2 text-gray-700">Your Team Code</h2>
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <span className="text-2xl font-extrabold text-indigo-600 tracking-widest">
                {teamCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(teamCode);
                  toast.success('Team code copied!');
                }}
                className="px-4 py-2 bg-indigo-200 text-indigo-700 text-sm font-semibold rounded-full hover:bg-indigo-300 transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share this code with your team members so they can join your project.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Assign a New Task</h2>
            <form onSubmit={handleAssignTask} className="space-y-6">
              <div className="relative">
                <select
                  value={newTask.assignedToId}
                  onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none"
                  required
                >
                  <option value="">Select Team Member</option>
                  {teamMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                required
              />
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                rows="4"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-md"
              >
                Assign Task
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Team Analytics</h2>
            <div className="space-y-6">
              {teamMembers.map((member) => (
                <div
                  key={member._id}
                  className="p-4 bg-gray-50 rounded-xl shadow-inner flex items-center space-x-4 hover:bg-gray-100 transition-colors"
                >
                  {member.profilePhoto ? (
                    <img
                      src={member.profilePhoto}
                      alt={`${member.name}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 p-2 text-indigo-400 bg-indigo-50 rounded-full" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                        <span>Completed: {analytics[member._id]?.completedTasks || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 text-blue-500" />
                        <span>Avg. Time: {analytics[member._id]?.averageCompletionTime || 'N/A'} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- TeamMemberDashboard Component ---
const TeamMemberDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/api/tasks/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch tasks.');
    }
  }, [API_URL]);

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/api/tasks/analytics/member`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch analytics.');
    }
  }, [API_URL]);

  useEffect(() => {
    if (userRole !== 'Team Member') {
      toast.error('Access denied. Redirecting to login.');
      navigate('/');
      return;
    }
    fetchTasks();
    fetchAnalytics();
  }, [userRole, navigate, fetchTasks, fetchAnalytics]);

  return (
    <>
      <Navbar role={userRole} />
      <div className="container mx-auto p-4 sm:p-8 mt-8">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800 tracking-tight">My Tasks</h1>

        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">My Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-indigo-50 rounded-xl shadow-inner">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Assigned</h3>
              <p className="text-3xl font-extrabold text-indigo-600 mt-2">{analytics.totalTasks || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl shadow-inner">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Completed</h3>
              <p className="text-3xl font-extrabold text-green-600 mt-2">{analytics.totalCompleted || 0}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl shadow-inner">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Avg. Completion Time</h3>
              <p className="text-3xl font-extrabold text-blue-600 mt-2">{analytics.averageCompletionTime || 0} min</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {tasks.length > 0 ? (
            tasks.map((task) => <TaskCard key={task._id} task={task} onTaskUpdate={fetchTasks} />)
          ) : (
            <p className="text-center text-gray-600 text-lg">No tasks assigned yet. Hang tight!</p>
          )}
        </div>
      </div>
    </>
  );
};

// Main App component
const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 font-sans antialiased">
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/manager-dashboard" element={<ProjectManagerDashboard />} />
          <Route path="/member-dashboard" element={<TeamMemberDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;