import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';

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
      const reader = new FileReader();
      reader.readAsDataURL(profilePhoto);
      reader.onloadend = async () => {
        const photoBase64 = reader.result;
        const payload = {
          name,
          email,
          password,
          role,
          profilePhoto: photoBase64,
          teamCode: role === 'Team Member' ? teamCode : undefined,
        };

        const { data } = await axios.post('http://localhost:5000/api/auth/register', payload);

        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        toast.success('Registration successful!');

        if (data.user.role === 'Project Manager') {
          navigate('/manager-dashboard');
        } else {
          navigate('/member-dashboard');
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast.error("Error reading file.");
      };
    } catch (error) {
      const msg = error.response?.data?.msg || 'Registration failed.';
      toast.error(msg);
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
                <FaUserCircle className="text-gray-500 text-2xl" />
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

export default AuthForm;
