// frontend/src/pages/MyBookmarksPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import userService from '../api/user'; // Our user API service
import ResourceCard from '../components/ResourceCard';
import { FiLoader } from 'react-icons/fi';

const MyBookmarksPage = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchBookmarks = async () => {
            if (!user?.token) return; // Make sure we have a token

            try {
                setLoading(true);
                const response = await userService.getBookmarks(user.token);
                setBookmarks(response.data);
            } catch (err) {
                setError('Could not fetch your bookmarks.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarks();
    }, [user?.token]); // Re-fetch if the user logs in/out

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-20">
                <FiLoader className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-center mb-8">My Bookmarks</h1>
            {bookmarks.length === 0 ? (
                <p className="text-center text-gray-400 mt-10">You haven't bookmarked any resources yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* We can reuse the same ResourceCard component! */}
                    {bookmarks.map((resource) => (
                        <ResourceCard key={resource._id} resource={resource} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookmarksPage;