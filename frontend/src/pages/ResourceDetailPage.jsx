// frontend/src/pages/ResourceDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import resourceService from '../api/resource';
import userService from '../api/user';

import StarRating from '../components/StarRating';
import CommentsSection from '../components/CommentsSection';
import { FiDownload, FiMessageSquare, FiLoader, FiBookmark } from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';

const ResourceDetailPage = () => {
    const { resourceId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [resource, setResource] = useState(null);
    const [comments, setComments] = useState([]);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProcessingChat, setIsProcessingChat] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const resourceRes = await resourceService.getById(resourceId, user?.token);
                setResource(resourceRes.data);

                if (user) {
                    const userBookmarksRes = await userService.getBookmarks(user.token);
                    if (userBookmarksRes.data.some(bookmark => bookmark._id === resourceId)) {
                        setIsBookmarked(true);
                    }
                }
                
                const commentsRes = await resourceService.getComments(resourceId);
                setComments(commentsRes.data);

            } catch (err) {
                setError('Could not load resource details. It may have been removed.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [resourceId, user]);

    // --- (All handler functions remain the same) ---
    const handleRatingSubmit = async (rating) => {
        if (!user) return alert('Please log in to rate resources.');
        try {
            const res = await resourceService.rate(resourceId, rating, user.token);
            setResource(prev => ({ ...prev, averageRating: res.data.averageRating }));
            alert('Thank you for your rating!');
        } catch (err) {
            console.error('Failed to submit rating:', err);
            alert('There was an error submitting your rating.');
        }
    };

    const handleCommentSubmit = async (message) => {
        if (!user) return alert('Please log in to comment.');
        try {
            const res = await resourceService.addComment(resourceId, message, user.token);
            setComments(prev => [res.data, ...prev]);
        } catch (err) {
            console.error('Failed to submit comment:', err);
            alert('There was an error submitting your comment.');
        }
    };

    const handleBookmarkToggle = async () => {
        if (!user) return alert('Please log in to bookmark resources.');
        try {
            await userService.toggleBookmark(resourceId, user.token);
            setIsBookmarked(prev => !prev);
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
            alert('There was an error updating your bookmarks.');
        }
    };

    const handleChatClick = async () => {
        setIsProcessingChat(true);
        try {
            const fileRes = await axios.get(resource.fileUrl, { responseType: 'blob' });
            const formData = new FormData();
            formData.append('file', fileRes.data, resource.title);

            const pythonApiUrl = `${import.meta.env.VITE_PYTHON_API_URL}/process/`;
            const processRes = await axios.post(pythonApiUrl, formData);
            
            navigate(`/chat/${resource._id}`, { state: { sessionId: processRes.data.session_id } });
        } catch (err) {
            console.error('Error preparing chat session:', err);
            setIsProcessingChat(false);
        }
    };

    const actionLinkBaseStyles = "flex items-center gap-3 text-gray-300 transition-colors duration-200 cursor-pointer";
    const actionLinkHoverStyles = "hover:text-white";
    const actionLinkDisabledStyles = "disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:text-gray-600";


    if (loading) return <div className="text-center mt-20"><FiLoader className="animate-spin text-4xl mx-auto text-white" /></div>;
    if (error) return <div className="text-center mt-20 text-white font-semibold">{error}</div>;
    if (!resource) return null;

    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

            {/* --- Left Column (Sticky) --- */}
            {/* Removed self-start to allow the column to stretch vertically */}
            <div className="lg:w-1/3 lg:sticky top-28">
                {/* Added h-full to make the card fill the entire height of the column */}
                <div className="bg-[#181818] p-6 rounded-lg border border-[#282828] h-full">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{resource.title}</h1>
                    <p className="text-gray-400 mb-4">Uploaded by {resource.uploader?.name || 'Anonymous'} on {new Date(resource.createdAt).toLocaleDateString()}</p>
                    
                    <div className="mb-8">
                        <StarRating 
                            initialRating={resource.averageRating}
                            onRate={handleRatingSubmit}
                            disabled={!user}
                        />
                        {!user && <p className="text-xs text-gray-500 mt-1">Log in to rate this resource.</p>}
                    </div>

                    <div className="flex flex-col items-start gap-5">
                        <button 
                            onClick={handleChatClick} 
                            disabled={!user || isProcessingChat} 
                            className={`${actionLinkBaseStyles} ${actionLinkHoverStyles} ${actionLinkDisabledStyles}`}
                        >
                            {isProcessingChat ? <FiLoader className="animate-spin" /> : <FiMessageSquare />}
                            <span>Chat with AI</span>
                        </button>
                        
                        <a 
                            href={resource.fileUrl} 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`${actionLinkBaseStyles} ${actionLinkHoverStyles}`}
                        >
                            <FiDownload /><span>Download</span>
                        </a>
                        
                        <button 
                            onClick={handleBookmarkToggle} 
                            disabled={!user} 
                            className={`
                                ${actionLinkBaseStyles} 
                                ${isBookmarked ? 'text-white font-bold' : actionLinkHoverStyles}
                                ${actionLinkDisabledStyles}
                            `}
                        >
                            {isBookmarked ? <BsBookmarkFill /> : <FiBookmark />}
                            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* --- Right Column (Content) --- */}
            <div className="lg:w-2/3">
                <div className="bg-[#181818] rounded-lg border border-[#282828] w-full px-6 pb-6">
                    <CommentsSection 
                        comments={comments}
                        onCommentSubmit={handleCommentSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailPage;