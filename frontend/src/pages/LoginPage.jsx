// frontend/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import authService from '../api/auth';
import { AuthContext } from '../context/AuthContext'; // Import the context

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get the login function from context

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      // On success, call the login function from our context
      login(response.data);
      console.log('Login successful:', response.data);
      // Redirect to the homepage
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl">
        {error && <div className="bg-red-500 text-white p-3 rounded">{error}</div>}
        
        <FormInput
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          placeholder="you@example.com"
        />
        <FormInput
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          placeholder="Your password"
        />
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;