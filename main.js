import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import checkTestAnswers from './utils.js';
import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    db,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
} from './firebase.js';

const app = express();

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Home page route
app.get('/', (req, res) => {
    res.render('test', { message: req.session.message });
    req.session.message = null;
});

// Dashboard/Home after login
app.get('/home', (req, res) => {
    res.render('index', {
        first_name: req.session.first_name || "Guest",
        last_name: req.session.last_name || "",
    });
});

// Fetch upcoming tests
app.get('/upcoming-tests', async (req, res) => {
    try {
        const testsCollection = collection(db, "tests");
        const testsSnapshot = await getDocs(testsCollection);
        const tests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.render('upcoming-tests', { tests });
    } catch (err) {
        console.error('Error fetching tests:', err.message);
        res.render('upcoming-tests', { tests: [] });
    }
});

// Fetch and display test submissions
app.get('/test-submissions', async (req, res) => {
    try {
        const submissionsCollection = collection(db, "test_submissions");
        const submissionsSnapshot = await getDocs(submissionsCollection);
        const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.render('test-submissions', { submissions });
    } catch (err) {
        console.error('Error fetching submissions:', err.message);
        res.render('test-submissions', { submissions: [] });
    }
});



app.get('/submission-details/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch submission details
        const submissionDocRef = doc(db, "test_submissions", id);
        const submissionSnapshot = await getDoc(submissionDocRef);

        if (submissionSnapshot.exists()) {
            const submission = submissionSnapshot.data();

            // Fetch the corresponding test details
            const testDocRef = doc(db, "tests", submission.testId);
            const testSnapshot = await getDoc(testDocRef);
            const test = testSnapshot.exists() ? testSnapshot.data() : {};

            // Debugging: Log fetched data
            console.log('Fetched Submission:', submission);
            console.log('Fetched Test:', test);

            // Render the details page with both submission and test data
            res.render('submission-details', { submission, test });
        } else {
            res.status(404).send('Submission not found');
        }
    } catch (err) {
        console.error('Error fetching submission details:', err.message);
        res.status(500).send('Error fetching submission details');
    }
});




// Score page route
app.get('/score-page/:testId', async (req, res) => {
    const { testId } = req.params;

    // Fetch the score and other necessary details from the database
    // Assume fetchScoreDetails is a function you define to get the score and answers
    try {
        // Fetch email from session
        const email = req.session.email;

        if (!email) {
            return res.status(400).send('User email not found');
        }

        const scoreDetails = await fetchScoreDetails(testId, email);

        res.render('score-page', {
            totalQuestions: scoreDetails.totalQuestions,
            score: scoreDetails.score,
            percentage: (scoreDetails.score / scoreDetails.totalQuestions) * 100,
            userAnswers: scoreDetails.userAnswers
        });
    } catch (err) {
        console.error('Error fetching score details:', err.message);
        res.status(500).send('Error fetching score details');
    }
});

// Test details route
app.get('/test-details/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const testDocRef = doc(db, "tests", id);
        const testSnapshot = await getDoc(testDocRef);

        if (testSnapshot.exists()) {
            res.render('test-details', {
                testContent: testSnapshot.data(),
                testId: id,
                email: req.session.email || null  // Pass email from session
            });
        } else {
            res.status(404).send('Test not found');
        }
    } catch (err) {
        console.error('Error fetching test details:', err.message);
        res.status(500).send('Error fetching test details');
    }
});

// Create test page (GET)
app.get('/create-test', (req, res) => {
    res.render('create-test');
});

// Create test route (POST)
app.post('/create-test', async (req, res) => {
    const { testName, description, questions } = req.body;

    if (!testName || !description || !questions || !Array.isArray(questions)) {
        req.session.message = { type: 'danger', message: "All fields are required, and questions must be an array." };
        return res.redirect('/create-test');
    }

    try {
        const testsCollection = collection(db, "tests");
        await addDoc(testsCollection, { testName, description, questions });

        req.session.message = { type: 'success', message: "Test created successfully!" };
        return res.redirect('/upcoming-tests');
    } catch (err) {
        console.error('Error creating test:', err.message);
        req.session.message = { type: 'danger', message: "Error creating test. Please try again." };
        return res.redirect('/create-test');
    }
});

app.post('/save-test', async (req, res) => {
    const { test_topic, test_sub_topic, test_time, questions } = req.body;

    try {
        // Reference to the tests collection in Firestore
        const testsCollection = collection(db, "tests");

        // Add the new test document
        await addDoc(testsCollection, {
            test_topic,
            test_sub_topic,
            test_time,
            questions
        });

        // Redirect to the homepage after successful save
        res.redirect('/home');  // Replace '/home' with your actual homepage route if different
    } catch (err) {
        console.error('Error saving test:', err.message);
        
        // Optionally, you can redirect to an error page or show a message
        res.redirect('/error');  // Replace '/error' with your error handling route if needed
    }
});



app.post('/submit-test/:testId', async (req, res) => {
    const { testId } = req.params;
    const { email, answers } = req.body;
    console.log('Received submission:', { testId, email, answers }); // For debugging

    if (!answers || Object.keys(answers).length === 0 || !email || testId !== req.body.testId) {
        console.log('Missing data:', { answers, email });
        return res.status(400).json({ error: 'Missing answers, email, or test ID mismatch' });
    }

    try {
        const submissionRef = await addDoc(collection(db, "test_submissions"), {
            testId,
            email,
            answers,
            submittedAt: new Date()
        });

        console.log("Test submission saved with ID: ", submissionRef.id);
        res.json({ message: 'Test submitted successfully', testId, submissionId: submissionRef.id });
    } catch (err) {
        console.error('Error processing test submission:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});







// User registration route
app.post('/user', async (req, res) => {
    const { first_name, last_name, email, education, department, position, password } = req.body;

    if (!first_name || !last_name || !email || !education || !department || !position || !password) {
        req.session.message = { type: 'danger', message: "All fields are required." };
        return res.redirect('/');
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        const usersCollection = collection(db, "users");
        await addDoc(usersCollection, { first_name, last_name, email, education, department, position });

        req.session.message = { type: 'success', message: "Account created successfully!" };
        req.session.first_name = first_name;
        req.session.last_name = last_name;
        req.session.email = email; // Store email in session

        return res.redirect('/home');
    } catch (err) {
        console.error('Error creating user:', err.message);

        let errorMessage;
        switch (err.code) {
            case 'auth/email-already-in-use':
                errorMessage = "Email is already in use.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Invalid email format.";
                break;
            case 'auth/weak-password':
                errorMessage = "Password is too weak.";
                break;
            default:
                errorMessage = "Error creating account. Please try again.";
        }

        req.session.message = { type: 'danger', message: errorMessage };
        return res.redirect('/');
    }
});

// User login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.session.message = { type: 'danger', message: "Email and password are required." };
        return res.redirect('/');
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();

            req.session.first_name = userData.first_name;
            req.session.last_name = userData.last_name;
            req.session.email = email; // Store email in session

            req.session.message = { type: 'success', message: "Login successful!" };
            return res.redirect('/home');
        } else {
            throw new Error("User data not found in Firestore");
        }
    } catch (err) {
        console.error('Error during login:', err.message);

        let errorMessage;
        switch (err.code) {
            case 'auth/user-not-found':
                errorMessage = "User not found.";
                break;
            case 'auth/wrong-password':
                errorMessage = "Incorrect password.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Invalid email format.";
                break;
            default:
                errorMessage = "Error during login. Please try again.";
        }

        req.session.message = { type: 'danger', message: errorMessage };
        return res.redirect('/');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
