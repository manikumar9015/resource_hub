// frontend/src/pages/FacultyDashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import adminService from '../api/admin';
import { FiLoader, FiCheck, FiX, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FacultyDashboardPage = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchPendingResources = async () => {
            if (!user?.token) return;
            try {
                const res = await adminService.getPending(user.token);
                setPending(res.data);
            } catch (err) {
                setError('Could not fetch pending resources. You may not have access.');
            } finally {
                setLoading(false);
            }
        };
        fetchPendingResources();
    }, [user?.token]);

    const handleApprove = async (resourceId) => {
        try {
            await adminService.approve(resourceId, user.token);
            setPending(pending.filter(p => p._id !== resourceId));
        } catch (err) {
            alert('Failed to approve resource.');
        }
    };

    const handleReject = async (resourceId) => {
        if (window.confirm('Are you sure you want to reject and delete this resource?')) {
            try {
                await adminService.reject(resourceId, user.token);
                setPending(pending.filter(p => p._id !== resourceId));
            } catch (err) {
                alert('Failed to reject resource.');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center mt-20"><FiLoader className="animate-spin text-4xl text-white" /></div>;
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto text-center mt-10 bg-[#181818] p-8 rounded-lg border border-[#282828]">
                <h2 className="text-xl font-bold text-white">An Error Occurred</h2>
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-2 text-white">Faculty Moderation Dashboard</h1>
            <p className="text-center text-gray-400 mb-8">Review and approve or reject student submissions.</p>

            {pending.length === 0 ? (
                <div className="text-center bg-[#181818] p-12 rounded-lg border border-[#282828]">
                    <p className="text-gray-400">No resources are currently pending review. Well done!</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-[#181818] rounded-lg border border-[#282828] shadow-lg">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-[#282828] text-xs text-gray-400 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">Title</th>
                                <th scope="col" className="px-6 py-3">Uploader</th>
                                <th scope="col" className="px-6 py-3">Subject</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pending.map(resource => (
                                <tr key={resource._id} className="border-b border-[#282828] hover:bg-black/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                        <Link to={`/resource/${resource._id}`} className="hover:underline flex items-center gap-2 cursor-pointer">
                                            <FiFileText /> {resource.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{resource.uploader.name}</td>
                                    <td className="px-6 py-4 text-gray-300">{resource.subject}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => handleApprove(resource._id)} className="p-2 bg-transparent hover:bg-gray-700 rounded-full text-white transition-colors" title="Approve"><FiCheck /></button>
                                        <button onClick={() => handleReject(resource._id)} className="p-2 bg-transparent hover:bg-gray-700 rounded-full text-white transition-colors" title="Reject"><FiX /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboardPage;