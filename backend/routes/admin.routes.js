// backend/routes/admin.routes.js
const express = require('express');
const router = express.Router();

// --- THIS IS THE CORRECTED LINE ---
// We need to import all the functions we plan to use from the controller.
const {
    getPendingResources,
    approveResource,
    rejectResource,
    getAllUsers,       // <-- This was missing
    updateUserRole,    // <-- This was also missing
} = require('../controllers/admin.controller.js');

// This import is now correct from the last fix.
const { protect, faculty, admin } = require('../middleware/auth.middleware.js');


// --- Routes for Faculty & Admins ---
router.get('/pending-resources', protect, faculty, getPendingResources);
router.put('/approve/:id', protect, faculty, approveResource);
router.delete('/reject/:id', protect, faculty, rejectResource);

// --- Routes for Admins ONLY ---
// These lines will now work because the functions are imported correctly.
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/update-role', protect, admin, updateUserRole);

module.exports = router;