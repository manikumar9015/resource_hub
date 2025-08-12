// server.js

// 1. IMPORT LIBRARIES
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js'); // We will create this file next

// 2. INITIALIZE AND CONFIGURE
dotenv.config(); // Load environment variables from .env file
const app = express(); // Create an instance of express
connectDB(); // Connect to MongoDB

// 3. MIDDLEWARE
// This allows your frontend to make requests to this backend
app.use(cors()); 
// This allows the server to accept and parse JSON in request bodies
app.use(express.json()); 
// This allows the server to accept and parse data from forms
app.use(express.urlencoded({ extended: true }));

// 4. API ROUTES
// We will create these route files later
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/resources', require('./routes/resource.routes.js'));
app.use('/api/users', require('./routes/user.routes.js'));
app.use('/api/admin', require('./routes/admin.routes.js'));


// A simple test route to make sure the server is working
app.get('/', (req, res) => {
    res.send('DocuMentor AI API is running...');
});

// 5. START THE SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});