// backend/controllers/admin.controller.js
const Resource = require('../models/resource.model.js');
const User = require('../models/user.model.js');
const cloudinary = require('cloudinary').v2;

/**
 * @desc    Get all resources pending approval
 * @route   GET /api/admin/pending-resources
 * @access  Private/Faculty
 */
const getPendingResources = async (req, res) => {
    try {
        const resources = await Resource.find({ approved: false }).populate('uploader', 'name');
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Approve a resource
 * @route   PUT /api/admin/approve/:id
 * @access  Private/Faculty
 */
const approveResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        resource.approved = true;
        await resource.save();
        res.json({ message: 'Resource approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Reject (delete) a resource
 * @route   DELETE /api/admin/reject/:id
 * @access  Private/Faculty
 */
const rejectResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        // Delete from Cloudinary and MongoDB
        await cloudinary.uploader.destroy(resource.publicId);
        await resource.deleteOne();
        res.json({ message: 'Resource rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get all users (by Admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
    try {
        // Find all users and exclude the current admin from the list
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Update a user's role (by Admin)
 * @route   PUT /api/admin/users/:id/update-role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) { return res.status(404).json({ message: 'User not found' }); }

        user.role = req.body.role || user.role;
        await user.save();
        res.json({ message: 'User role updated successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getPendingResources,
    approveResource,
    rejectResource,
    getAllUsers,
    updateUserRole
};