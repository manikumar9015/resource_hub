// backend/controllers/resource.controller.js
const Resource = require('../models/resource.model.js');
const Comment = require('../models/comment.model.js'); // <-- 1. ADD THIS LINE TO IMPORT THE COMMENT MODEL
const cloudinary = require('cloudinary').v2;

/**
 * @desc    Upload a new resource
 * @route   POST /api/resources/upload
 * @access  Private (requires login)
 */
const uploadResource = async (req, res) => {
    // 1. Get the text data from the request body
    const { title, subject, semester } = req.body;

    try {
        // 2. Check if a file was uploaded. `req.file` is made available by the `multer` middleware.
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        // 3. Create a new resource document in the database
        const resource = new Resource({
            title,
            subject,
            semester,
            fileUrl: req.file.path,      // The secure URL provided by Cloudinary
            publicId: req.file.filename, // The public_id provided by Cloudinary (used for deletion)
            uploader: req.user._id,      // The user's ID, attached to the request by our `protect` middleware
        });

        // 4. Save the document to the database
        const createdResource = await resource.save();
        
        // 5. Send the created resource data back as a response
        res.status(201).json(createdResource);

    } catch (error) {
        console.error('Error uploading resource:', error);
        res.status(500).json({ message: 'Server error while uploading resource' });
    }
};

/**
 * @desc    Get all approved resources
 * @route   GET /api/resources
 * @access  Public
 */
/**
 * @desc    Get all approved resources, with optional search filter
 * @route   GET /api/resources
 * @access  Public
 */
const getAllResources = async (req, res) => {
     console.log('Search term from backend:', req.query.search); 
    try {
        // This part creates the search query object if a 'search' param exists
        const keyword = req.query.search
            ? {
                $or: [
                    { title: { $regex: req.query.search, $options: 'i' } },
                    { subject: { $regex: req.query.search, $options: 'i' } },
                ],
            }
            : {};

        // --- THIS IS THE CORRECTED LINE ---
        // We need to combine the 'approved: true' filter with our 'keyword' filter.
        // The '...' spread operator merges the two objects.
        const resources = await Resource.find({ approved: true, ...keyword }).populate(
            'uploader',
            'name email'
        );
        // ------------------------------------

        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Server error while fetching resources' });
    }
};

/**
 * @desc    Get a single resource by its ID
 * @route   GET /api/resources/:id
 * @access  Private (user must be logged in to start a chat)
 */
const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (resource) {
            res.json(resource);
        } else {
            // Use a 404 Not Found status if no resource matches the ID
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error) {
        // This will catch errors like an invalidly formatted ObjectId
        console.error('Error fetching resource by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


/**
 * @desc    Add a comment to a resource
 * @route   POST /api/resources/:id/comments
 * @access  Private
 */
const addCommentToResource = async (req, res) => {
    const { message } = req.body;
    const resourceId = req.params.id;

    try {
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        // This code now works because the Comment model is imported
        const comment = new Comment({
            message,
            user: req.user._id,
            resource: resourceId,
        });

        await comment.save();

        // Populate user details before sending back
        const populatedComment = await Comment.findById(comment._id).populate('user', 'name');

        res.status(201).json(populatedComment);

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Rate a resource
 * @route   POST /api/resources/:id/ratings
 * @access  Private
 */
const rateResource = async (req, res) => {
    const { rating } = req.body;
    const resourceId = req.params.id;

    try {
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if the user has already rated this resource
        const existingRatingIndex = resource.ratings.findIndex(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (existingRatingIndex > -1) {
            // If user already rated, update their rating
            resource.ratings[existingRatingIndex].rating = rating;
        } else {
            // If not, add a new rating
            resource.ratings.push({ user: req.user._id, rating });
        }

        // Recalculate the average rating
        const total = resource.ratings.reduce((acc, item) => acc + item.rating, 0);
        resource.averageRating = total / resource.ratings.length;

        await resource.save();
        res.status(200).json({ 
            // Send back the full resource so the frontend can update its state
            ratings: resource.ratings,
            averageRating: resource.averageRating 
        });

    } catch (error) {
        console.error('Error rating resource:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


/**
 * @desc    Get all comments for a resource
 * @route   GET /api/resources/:id/comments
 * @access  Public
 */
const getResourceComments = async (req, res) => {
    try {
        // This code now works because the Comment model is imported
        const comments = await Comment.find({ resource: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: 'desc' }); // Show newest comments first
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

/**
 * @desc    Get all resources uploaded by the logged-in user
 * @route   GET /api/resources/my-resources
 * @access  Private
 */
const getMyResources = async (req, res) => {
    try {
        const resources = await Resource.find({ uploader: req.user._id });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Update a resource uploaded by the user
 * @route   PUT /api/resources/:id
 * @access  Private
 */
const updateMyResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if the person trying to edit is the one who uploaded it
        if (resource.uploader.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Update fields
        resource.title = req.body.title || resource.title;
        resource.subject = req.body.subject || resource.subject;
        resource.semester = req.body.semester || resource.semester;
        
        // After editing, the resource should be un-approved and go back for faculty review
        resource.approved = false; 

        const updatedResource = await resource.save();
        res.json(updatedResource);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Delete a resource uploaded by the user
 * @route   DELETE /api/resources/:id
 * @access  Private
 */
const deleteMyResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        if (resource.uploader.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // 2. Delete the file from Cloudinary using its publicId
        await cloudinary.uploader.destroy(resource.publicId);
        
        // 3. Delete the resource from the database
        await resource.deleteOne();

        res.json({ message: 'Resource removed successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    uploadResource,
    getAllResources,
    getResourceById,
    addCommentToResource,
    rateResource,
    getResourceComments,
    getMyResources,
    updateMyResource,
    deleteMyResource,
};