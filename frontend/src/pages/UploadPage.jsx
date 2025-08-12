// frontend/src/pages/UploadPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { AuthContext } from '../context/AuthContext';
import resourceService from '../api/resource';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const UploadPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    semester: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { title, subject, semester } = formData;

  const onTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('title', title);
    uploadData.append('subject', subject);
    uploadData.append('semester', semester);

    try {
      await resourceService.upload(uploadData, user.token);
      setSuccess('File uploaded successfully! It will be reviewed by a faculty member.');
      setFormData({ title: '', subject: '', semester: '' });
      setFile(null);
      document.getElementById('file-input').value = null;
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">Upload New Resource</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-[#181818] p-8 rounded-lg border border-[#282828] shadow-xl">
        {/* Styled Alert Components */}
        {error && 
          <div className="bg-gray-900 border border-gray-700 text-white p-3 rounded-lg text-center flex items-center justify-center gap-2">
            <FiAlertTriangle /> {error}
          </div>
        }
        {success && 
          <div className="bg-gray-900 border border-gray-700 text-white p-3 rounded-lg text-center flex items-center justify-center gap-2">
            <FiCheckCircle /> {success}
          </div>
        }
        
        <FormInput label="Title" type="text" name="title" value={title} onChange={onTextChange} placeholder="e.g., Chapter 5 Notes" />
        <FormInput label="Subject Code" type="text" name="subject" value={subject} onChange={onTextChange} placeholder="e.g., CS101" />
        <FormInput label="Semester" type="text" name="semester" value={semester} onChange={onTextChange} placeholder="e.g., 3" />
        
        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-300 mb-2">
            Resource File
          </label>
          <label htmlFor="file-input" className="w-full text-center cursor-pointer bg-white hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-full transition-colors block">
              {file ? file.name : 'Select File'}
          </label>
          <input
            id="file-input"
            type="file"
            onChange={onFileChange}
            required
            className="hidden" // Hide the default ugly input
          />
          <p className="text-xs text-gray-500 mt-2">Allowed formats: PDF, DOCX, TXT, JPG, PNG.</p>
        </div>

        <div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-black bg-white hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:bg-gray-700 disabled:text-gray-400"
          >
            {loading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;