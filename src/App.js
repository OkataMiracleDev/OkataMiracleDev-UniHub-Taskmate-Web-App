import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Navbar Component ---
// This component handles the navigation bar at the top of the dashboards.
const Navbar = ({ role }) => {
  // useNavigate is a hook from react-router-dom to programmatically navigate.
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from local storage to log them out.
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    toast.info('Logged out successfully!');
    navigate('/'); // Redirect the user back to the login page.
  };

  return (
    // Use a fixed position and z-index to keep the navbar at the top.
    // The bottom margin is removed here and added to the content containers instead.
    <nav className="sticky top-0 z-50 bg-white shadow-md p-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center sm:space-x-4 space-y-2 sm:space-y-0">
        <div className="text-xl font-bold text-indigo-600">
          UniHub
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 text-sm sm:text-base">
            Role: {role === 'Project Manager' ? 'Manager' : 'Member'}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

// --- AuthForm Component ---
// This component handles the login and registration forms.
const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [teamCode, setTeamCode] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !profilePhoto || !role) {
      toast.error("Please fill all required fields and upload a photo.");
      return;
    }

    try {
      // Create a FormData object to send the file and other form data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('profilePhoto', profilePhoto); // Append the actual file, not the Base64 string

      // Only append teamCode if the role is 'Team Member'
      if (role === 'Team Member' && teamCode) {
        formData.append('teamCode', teamCode);
      }

      // Send the FormData object to the server
      const { data } = await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Axios handles this automatically with FormData
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
      console.error("Registration Error:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });

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
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <>
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.73 0-5.46-.36-8.209-1.002a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-gray-700 text-sm mb-2">Profile Photo (Required)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-gray-700 text-sm mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Team Member">Team Member</option>
                  <option value="Project Manager">Project Manager</option>
                </select>
              </div>
            </>
          )}
          {role === 'Team Member' && !isLogin && (
            <input
              type="text"
              placeholder="Team Code"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-sm text-indigo-600 hover:underline"
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

// --- TaskCard Component ---
// Reusable component to display a single task.
const TaskCard = ({ task, onTaskUpdate }) => {
  const [proofFile, setProofFile] = useState(null);
  const [deliverableLink, setDeliverableLink] = useState('');

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
      onTaskUpdate(); // Refresh the task list
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
      toast.error("You are not logged in.");
      return;
    }

    if (!proofFile && !deliverableLink) {
      toast.error('Please provide a file or a link.');
      return;
    }

    // Use FormData for file upload to handle both file and other data
    const formData = new FormData();
    if (proofFile) {
        formData.append('proofFile', proofFile);
    }
    formData.append('deliverableLink', deliverableLink);

    try {
      await axios.put(
        `http://localhost:5000/api/tasks/submit/${task._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      toast.success('Task submitted successfully!');
      onTaskUpdate();
    } catch (error) {
      toast.error('Failed to submit task.');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
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

      {/* This is the key change: check for both 'Assigned' and 'Pending' */}
      {(task.status === 'Assigned' || task.status === 'Pending') && (
        <button
          onClick={handleStartTask}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mb-4"
        >
          Start Task
        </button>
      )}

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
            className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <button
            onClick={handleSubmitTask}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Submit Task
          </button>
        </div>
      )}
    </div>
  );
};

// --- ProjectManagerDashboard Component ---
// This is the dashboard for a Project Manager.
const ProjectManagerDashboard = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [newTask, setNewTask] = useState({ assignedToId: '', title: '', description: '' });
  // Add a state to hold the team code
  const [teamCode, setTeamCode] = useState('');
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    // Redirect if not a Project Manager
    if (userRole !== 'Project Manager') {
      toast.error('Access denied. Redirecting to login.');
      navigate('/');
    }

    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        // Fetch user profile data to get the team code
        const { data } = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Set the team code from the user data
        if (data.user.role === 'Project Manager') {
          setTeamCode(data.user.teamCode);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch user data.');
      }
    };

    const fetchTeamMembers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data } = await axios.get('http://localhost:5000/api/users/team', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeamMembers(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch team members.');
      }
    };

    const fetchAnalytics = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data } = await axios.get('http://localhost:5000/api/tasks/analytics/manager', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch analytics.');
      }
    };

    fetchUserData();
    fetchTeamMembers();
    fetchAnalytics();
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
    } catch (error) {
      toast.error('Failed to assign task.');
      console.error(error);
    }
  };

  return (
    <>
      <Navbar role={userRole} />
      {/* Add padding to the main container to prevent content from being hidden behind the sticky navbar */}
      <div className="container mx-auto p-4 mt-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Project Manager Dashboard</h1>

        {/* Display Team Code */}
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

        {/* Assign New Task Section */}
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

        {/* Analytics Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Team Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member._id} className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center space-x-4">
                {member.profilePhoto ? (
                  <img src={member.profilePhoto} alt={`${member.name}`} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  // Inline SVG for a user icon as a fallback.
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-gray-400">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.73 0-5.46-.36-8.209-1.002a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
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
            ))}
          </div>
        </div>
      </div>
    </>
  );
};


// --- TeamMemberDashboard Component ---
// This is the dashboard for a Team Member.
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

  useEffect(() => {
    // Redirect if not a Team Member
    if (userRole !== 'Team Member') {
      toast.error('Access denied. Redirecting to login.');
      navigate('/');
    }
    fetchTasks();
    fetchAnalytics();
  }, [userRole, navigate]);

  return (
    <>
      <Navbar role={userRole} />
      {/* Add padding to the main container to prevent content from being hidden behind the sticky navbar */}
      <div className="container mx-auto p-4 mt-8">
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
              <TaskCard key={task._id} task={task} onTaskUpdate={fetchTasks} />
            ))
          ) : (
            <p className="text-center text-gray-600">No tasks assigned yet.</p>
          )}
        </div>
      </div>
    </>
  );
};


// Main App component that contains all the routing logic
const App = () => {
  return (
    // BrowserRouter enables client-side routing
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 font-sans antialiased">
        {/*
          ToastContainer is for displaying notifications (e.g., success or error messages)
          from react-toastify.
        */}
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        
        {/* Routes component acts as a container for all Route definitions */}
        <Routes>
          {/* Route for the authentication page (login/signup).
            This is the default route that loads at the root URL (/).
          */}
          <Route path="/" element={<AuthForm />} />

          {/*
            Route for the Project Manager's dashboard.
            This is where a user with the 'Project Manager' role will be redirected.
          */}
          <Route path="/manager-dashboard" element={<ProjectManagerDashboard />} />

          {/*
            Route for the Team Member's dashboard.
            This is where a user with the 'Team Member' role will be redirected.
          */}
          <Route path="/member-dashboard" element={<TeamMemberDashboard />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;