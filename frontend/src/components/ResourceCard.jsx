// frontend/src/components/ResourceCard.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import resourceService from '../api/resource';
import { FiLoader } from 'react-icons/fi';

const ResourceCard = ({ resource }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const interactiveExtensions = ['.pdf', '.docx', '.txt'];
  const isInteractive = interactiveExtensions.some(ext =>
    resource.fileUrl.toLowerCase().endsWith(ext)
  );

  const handleChatClick = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const detailsRes = await resourceService.getById(resource._id, user.token);
      const fileUrl = detailsRes.data.fileUrl;
      const fileRes = await axios.get(fileUrl, { responseType: 'blob' });
      const fileBlob = fileRes.data;
      const formData = new FormData();
      formData.append('file', fileBlob, 'resource_file');
      const pythonApiUrl = `${import.meta.env.VITE_PYTHON_API_URL}/process/`;
      const processRes = await axios.post(pythonApiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const sessionId = processRes.data.session_id;
      navigate(`/chat/${resource._id}`, { state: { sessionId } });
    } catch (err)
    {
      console.error('Error preparing chat session:', err);
      setError(err.response?.data?.message || 'Could not start chat. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleQuizClick = () => {
    navigate(`/quiz/${resource._id}`);
  };

  // Base classes for a consistent "ghost button" style.
  const buttonBaseStyles = "flex-1 flex justify-center items-center gap-2 bg-transparent border border-gray-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 text-center cursor-pointer";
  
  // Hover effect is now only a border color change.
  const buttonHoverStyles = "hover:border-white";
  
  // Disabled state styles.
  const buttonDisabledStyles = "disabled:border-gray-800 disabled:text-gray-600 disabled:hover:border-gray-800 disabled:cursor-wait";


  return (
    // Card uses a neutral dark gray background with a subtle border that brightens on hover.
    <div className="bg-[#181818] rounded-lg p-6 flex flex-col justify-between border border-[#282828] transition-colors duration-300 hover:border-gray-700">
      <div>
        <Link to={`/resource/${resource._id}`} className="hover:text-gray-300 transition-colors duration-200 cursor-pointer">
          <h3 className="text-xl font-bold text-white mb-2">{resource.title}</h3>
        </Link>
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-semibold">Subject:</span> {resource.subject}
        </p>
        <p className="text-gray-400 text-sm mb-4">
          <span className="font-semibold">Semester:</span> {resource.semester}
        </p>
        <p className="text-gray-500 text-xs">
          Uploaded by: {resource.uploader?.name || 'Unknown'}
        </p>
        {error && <p className="text-sm text-white mt-2 font-semibold">{error}</p>}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        {isInteractive ? (
          <>
            <button
              onClick={handleChatClick}
              disabled={isProcessing}
              className={`${buttonBaseStyles} ${buttonHoverStyles} ${buttonDisabledStyles}`}
            >
              {isProcessing ? <><FiLoader className="animate-spin" /> Processing...</> : 'Chat with AI'}
            </button>
            <button
              onClick={handleQuizClick}
              className={`${buttonBaseStyles} ${buttonHoverStyles}`}
            >
              Take a Quiz
            </button>
          </>
        ) : (
          <a
            href={resource.fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonBaseStyles} ${buttonHoverStyles}`}
          >
            Download
          </a>
        )}
      </div>
      
      {isInteractive && (
         <a
            href={resource.fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            // Removing flex-1 for this full-width button and applying styles.
            className={`w-full mt-3 ${buttonBaseStyles.replace('flex-1', '')} ${buttonHoverStyles}`}
          >
            Download Original File
          </a>
      )}
    </div>
  );
};

export default ResourceCard;