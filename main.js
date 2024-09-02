import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    db, 
    collection, 
    addDoc 
} from './firebase.js'; 

const app = express();


app.set('view engine', 'ejs');
app.set('views', './views');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));


app.get('/', (req, res) => {
    res.render('test', { message: req.session.message });
    req.session.message = null; 
});


app.get('/item', (req, res) => {
    res.render('item');
});


app.post('/user', async (req, res) => {
    const { first_name, last_name, email, education, department, position, password } = req.body;

    if (!first_name || !last_name || !email || !education || !department || !position || !password) {
        req.session.message = {
            type: 'danger',
            message: "All fields are required."
        };
        return res.redirect('/');
    }

    try {
       
        await createUserWithEmailAndPassword(auth, email, password);

        
        const usersCollection = collection(db, "users");
        await addDoc(usersCollection, {
            first_name,
            last_name,
            email,
            education,
            department,
            position
        });

        req.session.message = {
            type: 'success',
            message: "Account created successfully!"
        };
        console.log('Redirecting to /item');  // Add this line
        res.redirect('/item');
    } catch (err) {
        console.error('Error creating user:', err.message);

        let errorMessage;
        switch (err.code) {
            case 'auth/email-already-in-use':
                errorMessage = "Email is already in use. Please use a different email address.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Invalid email format. Please enter a valid email address.";
                break;
            case 'auth/weak-password':
                errorMessage = "Password is too weak. Please choose a stronger password.";
                break;
            default:
                errorMessage = "Error creating account. Please try again.";
        }

        req.session.message = {
            type: 'danger',
            message: errorMessage
        };
        res.redirect('/');
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.session.message = {
            type: 'danger',
            message: "Email and password are required."
        };
        return res.redirect('/');
    }

    try {
        
        await signInWithEmailAndPassword(auth, email, password);
        req.session.message = {
            type: 'success',
            message: "Login successful!"
        };
        res.redirect('/item');
    } catch (err) {
        console.error('Error during login:', err.message);

        let errorMessage;
        switch (err.code) {
            case 'auth/user-not-found':
                errorMessage = "User not found. Please check your email.";
                break;
            case 'auth/wrong-password':
                errorMessage = "Incorrect password. Please try again.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Invalid email format. Please enter a valid email address.";
                break;
            default:
                errorMessage = "Error during login. Please try again.";
        }

        req.session.message = {
            type: 'danger',
            message: errorMessage
        };
        res.redirect('/');
    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
