// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import authService from '../api/auth'; // Import our auth service

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.register(name, email, password);
      console.log('Registration successful:', response.data);
      // After successful registration, redirect to the login page
      navigate('/login');
    } catch (err) {
      // The error response from axios is usually in err.response.data.message
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">Create Your Account</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl">
        {error && <div className="bg-red-500 text-white p-3 rounded">{error}</div>}
        
        <FormInput
          label="Full Name"
          type="text"
          name="name"
          value={name}
          onChange={onChange}
          placeholder="John Doe"
        />
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
          placeholder="Minimum 6 characters"
        />
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;