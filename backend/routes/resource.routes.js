// backend/routes/resource.routes.js
const express = require('express');
const router = express.Router();

const {
    uploadResource,
    getAllResources,
    getResourceById,
    addCommentToResource,
    rateResource,
    getResourceComments,
    getMyResources,
    updateMyResource,
    deleteMyResource,
} = require('../controllers/resource.controller.js');

const { protect } = require('../middleware/auth.middleware.js');
const upload = require('../config/cloudinary.js');

// --- Main Resource Routes ---

// GET /api/resources/ -> Get all resources (also handles search)
router.get('/', getAllResources);

// POST /api/resources/upload -> Upload a new resource
router.post('/upload', protect, upload.single('file'), uploadResource);

router.get('/my-resources', protect, getMyResources);

// GET /api/resources/:id -> Get a single resource by its ID
router.route('/:id')
    .get(protect, getResourceById)      // GET /api/resources/:id
    .put(protect, updateMyResource)    // PUT /api/resources/:id
    .delete(protect, deleteMyResource);


// --- Sub-document Routes for a Specific Resource ---

// GET and POST routes for comments on a resource
router.route('/:id/comments')
    .get(getResourceComments)
    .post(protect, addCommentToResource);

// POST route for ratings on a resource
router.route('/:id/ratings')
    .post(protect, rateResource);

module.exports = router;