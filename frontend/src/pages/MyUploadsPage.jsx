// frontend/src/pages/MyUploadsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import resourceService from '../api/resource';
import { FiLoader, FiEdit, FiTrash2, FiClock, FiCheckCircle, FiPlus } from 'react-icons/fi';
import EditResourceModal from '../components/EditResourceModal';

const MyUploadsPage = () => {
    const [myUploads, setMyUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUpload, setSelectedUpload] = useState(null);

    useEffect(() => {
        const fetchUploads = async () => {
            if (!user?.token) return;
            try {
                const res = await resourceService.getMyResources(user.token);
                setMyUploads(res.data);
            } catch (err) {
                setError('Could not fetch your uploaded resources.');
            } finally {
                setLoading(false);
            }
        };
        fetchUploads();
    }, [user?.token]);

    const openEditModal = (upload) => {
        setSelectedUpload(upload);
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedUpload(null);
        setIsModalOpen(false);
    };

    const handleUpdate = async (resourceId, formData) => {
        try {
            const res = await resourceService.updateResource(resourceId, formData, user.token);
            setMyUploads(myUploads.map(upload => 
                upload._id === resourceId ? res.data : upload
            ));
        } catch (err) {
            alert('Failed to update resource.');
            console.error(err);
        }
    };
    
    const handleDelete = async (resourceId) => {
        if (window.confirm('Are you sure you want to permanently delete this resource?')) {
            try {
                await resourceService.deleteResource(resourceId, user.token);
                setMyUploads(myUploads.filter(upload => upload._id !== resourceId));
            } catch (err) {
                alert('Failed to delete resource.');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center mt-20"><FiLoader className="animate-spin text-4xl text-white" /></div>;
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto text-center mt-10 bg-[#181818] p-8 rounded-lg border border-[#282828]">
                <h2 className="text-xl font-bold text-white">An Error Occurred</h2>
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">My Uploads</h1>
                <Link
                    to="/upload"
                    className="flex items-center gap-2 bg-white hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-full transition-colors cursor-pointer"
                >
                    <FiPlus />
                    <span>Upload New</span>
                </Link>
            </div>
            {myUploads.length === 0 ? (
                <div className="text-center bg-[#181818] p-12 rounded-lg border border-[#282828]">
                     <p className="text-gray-400">You have not uploaded any resources yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {myUploads.map(upload => (
                        <div 
                            key={upload._id} 
                            // Added transition classes and a hover effect for the border
                            className="bg-[#181818] p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between shadow-md gap-4 border border-[#282828] transition-colors duration-300 hover:border-gray-700"
                        >
                            <div className="flex-grow">
                                <h2 className="text-xl font-bold text-white">{upload.title}</h2>
                                <p className="text-sm text-gray-400">Subject: {upload.subject} | Semester: {upload.semester}</p>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                {upload.approved ? (
                                    <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded-full">
                                        <FiCheckCircle /> Approved
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs text-white bg-gray-700 px-2 py-1 rounded-full">
                                        <FiClock /> Pending Review
                                    </span>
                                )}
                                <button
                                    onClick={() => openEditModal(upload)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                                    title="Edit Resource"
                                >
                                    <FiEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(upload._id)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                                    title="Delete Resource"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {selectedUpload && (
                <EditResourceModal
                    isOpen={isModalOpen}
                    onRequestClose={closeEditModal}
                    resource={selectedUpload}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
};

export default MyUploadsPage;