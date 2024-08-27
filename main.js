const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const user = require('./models/user'); // Ensure this path is correct
const mongoose = require('./db'); // Import the mongoose connection setup from db.js

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views'); // Optional if 'views' is in the root directory

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Route for the home page
app.get('/', (req, res) => {
    res.render('test'); // Renders views/test.ejs
});

// Route for the item page
app.get('/item', (req, res) => {
    res.render('item'); // Renders views/item.ejs
});

// Route to handle user creation
app.post('/user', async (req, res) => {
    try {
        const newUser = new user({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            education: req.body.education,
            department: req.body.department,
            position: req.body.position,
        });

        // Attempt to save the new user to the database
        await newUser.save();

        // Store a success message in the session
        req.session.message = {
            type: 'success',
            message: "Account created successfully!"
        };
        
        // Redirect to the item page
        res.redirect('/item');
    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).json({ message: "Internal server error", type: 'danger' });
    }
});

// Route to handle user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userData = await user.findOne({ email });

        // Check if user exists and password matches the first_name
        if (userData && userData.first_name === password) {
            req.session.message = {
                type: 'success',
                message: "Login successful!"
            };
            res.redirect('/item');
        } else {
            req.session.message = {
                type: 'danger',
                message: "Invalid email or password."
            };
            res.redirect('/');
        }
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ message: "Internal server error", type: 'danger' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
