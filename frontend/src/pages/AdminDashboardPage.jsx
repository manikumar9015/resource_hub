// frontend/src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import adminService from '../api/admin';
import { FiLoader, FiUsers } from 'react-icons/fi';

const AdminDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: adminUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!adminUser?.token) return;
            try {
                const res = await adminService.getUsers(adminUser.token);
                setUsers(res.data);
            } catch (err) {
                setError('Could not fetch user list. You may not have access.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [adminUser?.token]);

    const handleRoleChange = async (userId, newRole) => {
        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            try {
                await adminService.updateUserRole(userId, newRole, adminUser.token);
                setUsers(users.map(u => (u._id === userId ? { ...u, role: newRole } : u)));
                alert('User role updated successfully.');
            } catch (err) {
                alert('Failed to update user role.');
                console.error(err);
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
            <div className="text-center mb-8">
                <FiUsers className="mx-auto text-5xl text-white mb-2" />
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">User Role Management</p>
            </div>

            <div className="overflow-x-auto bg-[#181818] rounded-lg border border-[#282828] shadow-lg">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-[#282828] text-xs text-gray-400 uppercase">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Current Role</th>
                            <th scope="col" className="px-6 py-3">Change Role To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="border-b border-[#282828] hover:bg-black/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                <td className="px-6 py-4 text-gray-300">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        user.role === 'Admin' ? 'bg-white text-black' : 
                                        user.role === 'Faculty' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)} 
                                        value={user.role} 
                                        className="bg-black border border-[#282828] rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Faculty">Faculty</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboardPage;