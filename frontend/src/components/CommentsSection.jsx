import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CommentsSection = ({ comments, onCommentSubmit }) => {
    const { user } = useContext(AuthContext);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        await onCommentSubmit(newComment);
        setIsSubmitting(false);
        setNewComment('');
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Discussion</h2>

            {user ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a public comment..."
                        className="w-full p-3 bg-black border border-[#282828] rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white transition-colors"
                        rows="3"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-3 px-6 py-2 bg-white hover:bg-gray-300 text-black font-bold rounded-full disabled:bg-gray-700 disabled:text-gray-400 cursor-pointer transition-colors"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                    </button>
                </form>
            ) : (
                <div className="mb-6 p-4 bg-[#181818] rounded-lg border border-[#282828] text-center">
                    <p className="text-gray-400">
                        You must be <Link to="/login" className="text-white hover:underline font-semibold cursor-pointer">logged in</Link> to post a comment.
                    </p>
                </div>
            )}

            {/* List of Comments with scrollbar styling */}
            {/* ADD THE SCROLLBAR CLASSES HERE */}
            <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <div className="space-y-4">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment._id} className="bg-[#181818] p-4 rounded-lg border border-[#282828]">
                                <div className="flex items-center mb-2">
                                    <p className="font-bold text-white">{comment.user.name}</p>
                                    <span className="text-gray-500 text-xs ml-auto">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-300">{comment.message}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No comments yet. Be the first to start the discussion!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentsSection;