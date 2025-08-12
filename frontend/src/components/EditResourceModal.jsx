// frontend/src/components/EditResourceModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import FormInput from './FormInput'; // Assuming FormInput is already styled correctly

Modal.setAppElement('#root');

const EditResourceModal = ({ isOpen, onRequestClose, resource, onUpdate }) => {
    const [formData, setFormData] = useState({ title: '', subject: '', semester: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (resource) {
            setFormData({
                title: resource.title,
                subject: resource.subject,
                semester: resource.semester,
            });
        }
    }, [resource]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onUpdate(resource._id, formData);
        setLoading(false);
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={{
                overlay: { backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 50 },
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#181818', // Standard dark gray card background
                    border: '1px solid #282828', // Standard dark gray border
                    borderRadius: '10px',
                    color: 'white',
                    maxWidth: '90%',
                    width: '500px',
                    padding: '2rem'
                },
            }}
            contentLabel="Edit Resource"
        >
            <h2 className="text-2xl font-bold mb-6 text-white">Edit Resource</h2>
            {/* Warning box with updated monochrome styling */}
            <p className="text-sm text-gray-400 bg-gray-900 border border-[#282828] p-3 rounded-lg mb-6">
                Note: Editing a resource will un-approve it and send it back for faculty review.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                />
                <FormInput
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                />
                <FormInput
                    label="Semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                />
                <div className="flex justify-end gap-4 mt-6">
                    {/* Secondary "ghost" button for Cancel */}
                    <button 
                        type="button" 
                        onClick={onRequestClose} 
                        className="px-6 py-2 bg-transparent border border-gray-700 hover:border-white rounded-full transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    {/* Primary action button for Save Changes */}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="px-6 py-2 bg-white hover:bg-gray-300 text-black font-bold rounded-full transition-colors disabled:bg-gray-700 disabled:text-gray-400 cursor-pointer"
                    >
                        {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditResourceModal;