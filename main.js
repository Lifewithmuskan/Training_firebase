const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const user = require('./models/user'); // Make sure this path is correct and matches your project structure

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');  // Optional if 'views' is in the root directory

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.render('test'); // Renders views/test.ejs
});

app.get('/item', (req, res) => {
    res.render('item'); // Renders views/item.ejs
});

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

        await newUser.save();

        req.session.message = {
            type: 'success',
            message: "Account created successfully!"
        };
    
        res.redirect('/item');
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message, type: 'danger' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userData = await user.findOne({ email });

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
        console.error(err.message);
        res.status(500).json({ message: err.message, type: 'danger' });
    }
});

const PORT=process.env.PORT||3000

app.listen(PORT,()=>{
    console.log(`server started at http://localhost:${PORT}`)
});
