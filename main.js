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
    where,setDoc,deleteDoc,updateDoc 
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
    cookie: { secure: false }
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
        email: req.session.email || "",

        isAdmin: req.session.isAdmin || false // Pass isAdmin value
    });
});

import dayjs from 'dayjs'; // Import dayjs for date handling


// Fetch upcoming tests
app.get('/upcoming-tests', async (req, res) => {
    try {
        const testsCollection = collection(db, "tests");
        const testsSnapshot = await getDocs(testsCollection);
        const tests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get today's date
        const today = dayjs().startOf('day');

        // Filter for upcoming tests
        const upcomingTests = tests.filter(test => dayjs(test.date).isAfter(today)); // Ensure test.date is a valid date field

        // Check if the user is an admin
        const isAdmin = req.user && req.user.role === 'admin'; // Adjust based on your user management

        res.render('upcoming-tests', { tests: upcomingTests, isAdmin });
    } catch (err) {
        console.error('Error fetching tests:', err.message);
        res.render('upcoming-tests', { tests: [], isAdmin: false }); // Default isAdmin to false on error
    }
});


// Fetch previous tests
app.get('/previous-tests', async (req, res) => {
    try {
        const testsCollection = collection(db, "tests");
        const testsSnapshot = await getDocs(testsCollection);
        const tests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get today's date
        const today = dayjs().startOf('day');

        // Filter for previous tests
        const previousTests = tests.filter(test => dayjs(test.date).isBefore(today)); // Ensure test.date is a valid date field

        res.render('previous-tests', { tests: previousTests });
    } catch (err) {
        console.error('Error fetching tests:', err.message);
        res.render('previous-tests', { tests: [] });
    }
});


app.post('/delete-test/:testId', async (req, res) => {
    const testId = req.params.testId;
    
    try {
        const testsCollection = collection(db, "tests");
        await deleteDoc(doc(testsCollection, testId));

        req.session.message = { type: 'success', message: "Test deleted successfully!" };
        res.redirect('/upcoming-tests');
    } catch (err) {
        console.error('Error deleting test:', err.message);
        req.session.message = { type: 'danger', message: "Error deleting test. Please try again." };
        res.redirect('/upcoming-tests');
    }
});



app.get('/edit-test/:testId', async (req, res) => {
    const testId = req.params.testId;
    
    try {
        const testDoc = await getDoc(doc(collection(db, "tests"), testId));
        if (!testDoc.exists()) {
            req.session.message = { type: 'danger', message: "Test not found." };
            return res.redirect('/upcoming-tests');
        }

        const testData = testDoc.data();
        res.render('edit-test', { testId, testData });
    } catch (err) {
        console.error('Error loading test:', err.message);
        req.session.message = { type: 'danger', message: "Error loading test. Please try again." };
        res.redirect('/upcoming-tests');
    }
});

app.post('/update-test/:testId', async (req, res) => {
    const testId = req.params.testId;
    const { topic, subtopic, time, questions } = req.body;

    try {
        const testsCollection = collection(db, "tests");
        await updateDoc(doc(testsCollection, testId), {
            test_topic: topic,
            test_sub_topic: subtopic,
            test_time: time,
            questions
        });

        req.session.message = { type: 'success', message: "Test updated successfully!" };
        res.redirect('/upcoming-tests');
    } catch (err) {
        console.error('Error updating test:', err.message);
        req.session.message = { type: 'danger', message: "Error updating test. Please try again." };
        res.redirect(`/edit-test/${testId}`);
    }
});





// Fetch and display test submissions


app.get('/test-submissions', async (req, res) => {
    try {
        const submissionsCollection = collection(db, "test_submissions");
        const userCollection = collection(db, "users");
        const testsCollection = collection(db, "tests");
        let submissionsSnapshot;

        if (req.session.isAdmin) {
            // Admin: Fetch all test submissions
            submissionsSnapshot = await getDocs(submissionsCollection);
        } else {
            // Regular user: Fetch only their own submissions
            const userEmail = req.session.email;

            // Check if userEmail is defined
            if (!userEmail) {
                throw new Error("User email is undefined");
            }

            const q = query(submissionsCollection, where("email", "==", userEmail));
            submissionsSnapshot = await getDocs(q);
        }

        const submissions = [];

        // Loop through each submission
        for (const submissionDoc of submissionsSnapshot.docs) {
            const submissionData = submissionDoc.data();
            const userEmail = submissionData.email;

            // Check if userEmail is defined in the submission
            if (!userEmail) {
                console.warn(`Submission ${submissionDoc.id} has no email field`);
                continue; // Skip this submission
            }

            // Fetch user data from 'users' collection based on the email
            const userQuery = query(userCollection, where("email", "==", userEmail));
            const userSnapshot = await getDocs(userQuery);

            let userData = {};
            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                userData = userDoc.data(); // Extract user information
            }

            // Fetch test details from 'tests' collection based on the testId in submission
            let testData = {};
            if (submissionData.testId) {
                const testDocRef = doc(db, "tests", submissionData.testId);
                const testSnapshot = await getDoc(testDocRef);
                if (testSnapshot.exists()) {
                    testData = testSnapshot.data(); // Get test details (including test_topic)
                }
            }

            // Combine submission data with user and test data
            submissions.push({
                id: submissionDoc.id,
                ...submissionData,
                userInfo: {
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    department: userData.department || '',
                    education: userData.education || '',
                    position: userData.position || ''
                },
                testInfo: {
                    test_topic: testData.test_topic || 'Unknown'
                }
            });
        }

        // Render the 'test-submissions' page with the combined data
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

            // Get total questions from the corresponding test
            const totalQuestions = submission.testId ? await getTotalQuestionsFromTest(submission.testId) : 0;

            // Fetch the corresponding test details
            const testDocRef = doc(db, "tests", submission.testId);
            const testSnapshot = await getDoc(testDocRef);
            const test = testSnapshot.exists() ? testSnapshot.data() : {};

            // Debugging: Log fetched data
            console.log('Fetched Submission:', submission);
            console.log('Fetched Test:', test);

            // Render the details page with both submission and test data
            res.render('submission-details', { submission, test, totalQuestions });
        } else {
            res.status(404).send('Submission not found');
        }
    } catch (err) {
        console.error('Error fetching submission details:', err.message);
        res.status(500).send('Error fetching submission details');
    }
});


app.get('/user-allot', async (req, res) => {
    try {
        // Collection references
        const submissionsCollection = collection(db, "test_assignments");
        const testsCollection = collection(db, "tests");
        
        let submissionsSnapshot;
        let testsSnapshot;

        if (req.session.isAdmin) {
            // Admin: Fetch all submissions and tests
            submissionsSnapshot = await getDocs(submissionsCollection);
            testsSnapshot = await getDocs(testsCollection);
        } else {
            // Regular user: Fetch only their own submissions
            const userEmail = req.session.email;
            const submissionsQuery = query(submissionsCollection, where("emails", "array-contains", userEmail));
            submissionsSnapshot = await getDocs(submissionsQuery);

            const testsQuery = query(testsCollection, where("emails", "array-contains", userEmail));
            testsSnapshot = await getDocs(testsQuery);
        }

        // Mapping results from both collections
        const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const tests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Render the template with both submissions and tests data
        res.render('user-allot', { submissions, tests, userEmail: req.session.email, isAdmin: req.session.isAdmin });
    } catch (err) {
        console.error('Error fetching submissions:', err.message);
        res.render('user-allot', { submissions: [], tests: [], userEmail: null, isAdmin: false });
    }
});

app.get('/score', async (req, res) => {
    try {
        const submissionsCollection = collection(db, "test_submissions");
        const submissionsSnapshot = req.session.isAdmin 
            ? await getDocs(submissionsCollection) 
            : await getDocs(query(submissionsCollection, where("email", "==", req.session.email)));

        const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch all users in a single query if not admin
        const userMap = req.session.isAdmin 
            ? {}
            : await fetchAllUsers();

        const results = submissions.map(submission => {
            const scoreData = calculateScore(submission);
            const userEmail = submission.email;
            const userName = req.session.isAdmin ? userMap[userEmail]?.name || 'Unknown' : req.session.first_name + ' ' + req.session.last_name;

            return {
                userName,
                email: userEmail,
                score: scoreData.scorePercentage.toFixed(2),
                trainingLevel: scoreData.trainingLevel
            };
        });

        res.render('score', { results, userEmail: req.session.email, isAdmin: req.session.isAdmin });
    } catch (err) {
        console.error('Error fetching submissions:', err.message);
        res.render('score', { results: [], userEmail: null, isAdmin: false });
    }
});

async function fetchAllUsers() {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const users = usersSnapshot.docs.map(doc => ({ email: doc.data().email, name: `${doc.data().first_name} ${doc.data().last_name}` }));
    
    return users.reduce((acc, user) => {
        acc[user.email] = { name: user.name };
        return acc;
    }, {});
}

app.get('/score', async (req, res) => {
    try {
        const submissionsCollection = collection(db, "test_submissions");
        const submissionsSnapshot = req.session.isAdmin 
            ? await getDocs(submissionsCollection) 
            : await getDocs(query(submissionsCollection, where("email", "==", req.session.email)));

        const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch all users in a single query if not admin
        const userMap = req.session.isAdmin 
            ? {}
            : await fetchAllUsers();

        const results = submissions.map(submission => {
            const scoreData = calculateScore(submission);
            const userEmail = submission.email;
            const userName = req.session.isAdmin 
                ? userMap[userEmail]?.name || 'Unknown' 
                : `${req.session.first_name} ${req.session.last_name}`;

            return {
                userName,
                email: userEmail,
                score: scoreData.scorePercentage.toFixed(2),
                trainingLevel: scoreData.trainingLevel
            };
        });

        res.render('score', { results, userEmail: req.session.email, isAdmin: req.session.isAdmin });
    } catch (err) {
        console.error('Error fetching submissions:', err.message);
        res.render('score', { results: [], userEmail: null, isAdmin: false });
    }  
});

function calculateScore(submission) {
    // Ensure answers is an array, default to empty if not
    const userAnswers = Array.isArray(submission.answers) ? submission.answers : [];
    const correctAnswers = Array.isArray(submission.correctAnswers) ? submission.correctAnswers : [];
    const totalQuestions = userAnswers.length;

    const correctCount = userAnswers.filter((answer, index) => answer === correctAnswers[index]).length;
    const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0; // Avoid division by zero

    let trainingLevel;
    if (scorePercentage <= 50) {
        trainingLevel = "Level 3 training required";
    } else if (scorePercentage <= 70) {
        trainingLevel = "Level 2 training required";
    } else {
        trainingLevel = "Level 1 training required";
    }

    return { scorePercentage, trainingLevel };
}



// Helper function to get total questions from a test
async function getTotalQuestionsFromTest(testId) {
    const testDocRef = doc(db, "tests", testId);
    const testSnapshot = await getDoc(testDocRef);
    if (testSnapshot.exists()) {
        const testData = testSnapshot.data();   
        return testData.questions.length; // Assuming questions is an array
    }
    return 0; // Handle case where the test doesn't exist
}

// Helper function to fetch questions for a test
async function getTestQuestions(testId) {
    const testDocRef = doc(db, "tests", testId);
    const testSnapshot = await getDoc(testDocRef);
    if (testSnapshot.exists()) {
        const testData = testSnapshot.data();
        return testData.questions || []; // Return questions array
    }
    return []; // Handle case where the test doesn't exist
}
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

app.get('/test-details/:id', async (req, res) => {
    const { id } = req.params;
    const isAdmin = req.session.isAdmin; // Check if user is admin
    try {
        const testDocRef = doc(db, "tests", id);
        const testSnapshot = await getDoc(testDocRef);

        if (testSnapshot.exists()) {
            const testData = testSnapshot.data();
            if (isAdmin) {
                // Render view only for admin
                res.render('test-view', {
                    testContent: testData,
                    testId: id,
                    email: req.session.email || null,
                    topic: testData.test_topic,
                    subtopic: testData.test_sub_topic,
                    time: testData.test_time
                });
            } else {
                // Render test details for users
                res.render('test-details', {
                    testContent: testData,
                    testId: id,
                    email: req.session.email || null,
                    topic: testData.test_topic,
                    subtopic: testData.test_sub_topic,
                    time: testData.test_time
                });
            }
        } else {
            res.status(404).send('Test not found');
        }
    } catch (err) {
        console.error('Error fetching test details:', err.message);
        res.status(500).send('Error fetching test details');
    }
});




app.get('/questions', (req, res) => {
    res.render('questions'); // Make sure the .ejs file is named questions.ejs
});
app.get('/make-test', async (req, res) => {
    try {
        const questionsCollection = collection(db, "questionnaire"); // Adjust the collection name as necessary
        const questionsSnapshot = await getDocs(questionsCollection);
        const questions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Render the create-test EJS template and pass the questions
        res.render('questions', { questions });
    } catch (err) {
        console.error('Error fetching questions:', err.message);
        res.status(500).send('Error fetching questions');
    }
});



// Display Select Questions Page
app.get('/select-questions', async (req, res) => {
    try {
        // Fetch tests
        const testsCollection = collection(db, "tests");
        const testsSnapshot = await getDocs(testsCollection);
        const tests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Render the EJS template and pass the data
        res.render('select-questions', { tests });
    } catch (err) {
        console.error('Error fetching data for select questions:', err.message);
        res.status(500).send('Error fetching data for select questions');
    }
});


// Create test route (GET)
app.get('/create-test', (req, res) => {
    res.render('create-test');
});

// Create test route (POST)
app.post('/create-test', async (req, res) => {
    const { testTopic, testSubTopic, testTime, testDate, questions } = req.body;

    // Validate inputs
    if (!testTopic || !testSubTopic || !testTime || !testDate || !questions || !Array.isArray(questions)) {
        req.session.message = { type: 'danger', message: "All fields are required, and questions must be an array." };
        return res.redirect('/create-test');
    }

    try {
        const testsCollection = collection(db, "tests");
        await addDoc(testsCollection, {
            test_topic: testTopic,
            test_sub_topic: testSubTopic,
            test_time: testTime,
            test_date: new Date(testDate), // Save the date
            questions
        });

        req.session.message = { type: 'success', message: "Test created successfully!" };
        return res.redirect('/upcoming-tests');
    } catch (err) {
        console.error('Error creating test:', err.message);
        req.session.message = { type: 'danger', message: "Error creating test. Please try again." };
        return res.redirect('/create-test');
    }
});


app.post('/save-test', async (req, res) => {
    const { test_topic, test_sub_topic, test_time, number_of_questions } = req.body;
    const questions = req.body.questions || []; // Ensure this captures your selected questions

    try {
        // Reference to the tests collection in Firestore
        const testsCollection = collection(db, "tests");

        // Add the new test document
        await addDoc(testsCollection, {
            test_topic,
            test_sub_topic,
            test_time,
            questions: Array.isArray(questions) ? questions : [questions] // Ensure it's an array
        });

        // Redirect to the homepage after successful save
        res.redirect('/home');  // Replace '/home' with your actual homepage route if different
    } catch (err) {
        console.error('Error saving test:', err.message);
        res.redirect('/error');  // Replace '/error' with your error handling route if needed
    }
});


app.post('/submit-test/:testId', async (req, res) => {
    const { testId } = req.params; // Comes from the URL
    const { answers } = req.body; // Answers should be sent in the body

    console.log('Received submission:', { testId, answers });

    // Log req.body to check the incoming data
    console.log('Request body:', req.body);

    if (!answers || Object.keys(answers).length === 0) {
        console.log('Missing data:', { answers, testId });
        return res.status(400).json({ error: 'Missing answers' });
    }

    // Ensure the user is logged in
    
    const email = req.session.email;
    const firstName = req.session.first_name; // Use first_name instead of firstName
    const lastName = req.session.last_name; 

    if (!email || !firstName || !lastName) {
        console.log('Missing user data in session:', { email, firstName, lastName });
        return res.status(400).json({ error: 'User must be logged in to submit tests' });
    }

    // Proceed with saving to the database
    try {
        const submissionRef = await addDoc(collection(db, "test_submissions"), {
            testId,
            email,
            firstName,
            lastName,
            answers,
            submittedAt: new Date()
        });

        // Optionally delete the test assignment if that's your logic
        await deleteDoc(doc(db, 'test_assignments', testId));

        console.log("Test submission saved with ID: ", submissionRef.id);
        res.json({ message: 'Test submitted successfully', testId, submissionId: submissionRef.id });
    } catch (err) {
        console.error('Error processing test submission:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Example endpoint to fetch tests
app.get('/api/tests', async (req, res) => {
    try {
        const testsSnapshot = await getDocs(collection(db, 'tests'));
        const tests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ message: 'Error fetching tests' });
    }
});




// Assuming you want to save questions to the "questionnaire" collection
app.post('/sa-test', async (req, res) => {
    const { testId } = req.body;
    
    try {
        // Assuming you want to get questions from "tests" collection based on testId
        const testRef = collection(db, 'tests'); // This gets the 'tests' collection
        const testSnapshot = await getDocs(testRef);
        const questions = [];

        testSnapshot.forEach(doc => {
            if (doc.id === testId) {
                // Assuming each test document has a 'questions' field that is an array
                questions.push(...doc.data().questions);
            }
        });

        // Save each question to the 'questionnaire' collection
        const questionnaireRef = collection(db, 'questionnaire');
        for (const question of questions) {
            await addDoc(questionnaireRef, { question });
        }

        res.status(201).json({ message: 'Questions saved successfully!' });
    } catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).json({ message: 'Error saving questions' });
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


// Display Assign Test Page
app.get('/assign-test', async (req, res) => {
    try {
        // Fetch tests
        const testsCollection = collection(db, "tests");
        const testsSnapshot = await getDocs(testsCollection);
        const tests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch users
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const users = usersSnapshot.docs.map(doc => doc.data());

        // Sample organizations data
        const organizations = [
            { id: '1', name: 'SSG' },
            { id: '2', name: 'Navy' },
            { id: '3', name: 'Army' },
            { id: '4', name: 'Air Force' },
            { id: '5', name: 'Marines' }
        ];

        // Render the EJS template and pass the data
        res.render('assign-test', { tests, users, organizations });
    } catch (err) {
        console.error('Error fetching data for assign test:', err.message);
        res.status(500).send('Error fetching data for assign test');
    }
});

// Handle Assign Test Form Submission
app.post('/assign-test', async (req, res) => {
    const { organizationName, testId, userEmails } = req.body; // Get organizationName

    try {
        // Query organization by name
        const organizationsQuery = query(
            collection(db, 'organizations'),
            where('name', '==', organizationName) // Query by organization name
        );
        const orgSnapshot = await getDocs(organizationsQuery);

        if (orgSnapshot.empty) {
            console.log('Organization not found:', organizationName);
            return res.status(400).send('Organization not found.');
        }

        // Get the first matching organization document
        const orgDoc = orgSnapshot.docs[0];
        const organizationId = orgDoc.id; // Get organizationId from the document

        // Verify test exists
        const testRef = doc(db, 'tests', testId);
        const testDoc = await getDoc(testRef);
        if (!testDoc.exists()) {
            console.log('Test not found:', testId);
            return res.status(400).send('Test not found.');
        }

        // Get current timestamp
        const currentTimestamp = new Date();

        // Query for existing assignments with the same testId and organizationId
        const existingAssignmentsQuery = query(
            collection(db, 'test_assignments'),
            where('organizationId', '==', organizationId),
            where('testId', '==', testId)
        );
        const existingAssignmentsSnapshot = await getDocs(existingAssignmentsQuery);

        let assignmentRef;

        if (existingAssignmentsSnapshot.empty) {
            // Create a new assignment if none exists
            assignmentRef = doc(collection(db, 'test_assignments'));
            await setDoc(assignmentRef, {
                organizationId: organizationId,
                testId: testId,
                assignedAt: currentTimestamp,
                emails: userEmails, // Array of emails
                names: [], // Array of user names
                assignerName: 'System' // Replace with dynamic assigner name if needed
            });
        } else {
            // Update the existing assignment
            const existingAssignmentDoc = existingAssignmentsSnapshot.docs[0].ref;
            const existingAssignmentData = (await getDoc(existingAssignmentDoc)).data();

            // Merge emails and names
            const updatedEmails = [...new Set([...existingAssignmentData.emails, ...userEmails])];
            const updatedNames = []; // Logic to combine names should be implemented

            await updateDoc(existingAssignmentDoc, {
                emails: updatedEmails,
                names: updatedNames
            });
            assignmentRef = existingAssignmentDoc;
        }

        // Redirect to a page showing all allotted tests
        res.redirect('/allotted-tests');
    } catch (error) {
        console.error('Error assigning test:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/allotted-tests', async (req, res) => {
    try {
        // Fetch tests
        const testsCollection = collection(db, "tests");
        const testsSnapshot = await getDocs(testsCollection);
        const tests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch allotted tests data (if any specific allocation data exists)
        // For simplicity, assuming all tests are allotted. Adjust as needed.
        const allottedTests = tests.map(test => ({
            ...test,
            allotted_count: Math.floor(Math.random() * 10) // Example random number for allotted_count
        }));

        res.render('allotted-tests', { allottedTests });
    } catch (err) {
        console.error('Error fetching allotted tests:', err.message);
        res.status(500).send('Error fetching allotted tests');
    }
});
// Route to get test details and assigned emails
app.get('/test-details/:id', async (req, res) => {
    const { id } = req.params;
    const isAdmin = req.session.isAdmin; // Check if user is admin
    try {
        const testDocRef = doc(db, "tests", id);
        const testSnapshot = await getDoc(testDocRef);

        if (testSnapshot.exists()) {
            const testData = testSnapshot.data();
            if (isAdmin) {
                // Render view only for admin
                res.render('test-view', {
                    testContent: testData,
                    testId: id,
                    email: req.session.email || null,
                    topic: testData.test_topic,
                    subtopic: testData.test_sub_topic,
                    time: testData.test_time
                });
            } else {
                // Render test details for users
                res.render('test-details', {
                    testContent: testData,
                    testId: id,
                    email: req.session.email || null,
                    topic: testData.test_topic,
                    subtopic: testData.test_sub_topic,
                    time: testData.test_time
                });
            }
        } else {
            res.status(404).send('Test not found');
        }
    } catch (err) {
        console.error('Error fetching test details:', err.message);
        res.status(500).send('Error fetching test details'); // Consider sending a more user-friendly message
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.session.message = { type: 'danger', message: "Email and password are required." };
        return res.redirect('/');
    }

    try {
        // Check if the user is the admin
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            req.session.isAdmin = true;
            req.session.first_name = "Admin";
            req.session.last_name = "";

            req.session.message = { type: 'success', message: "Welcome Admin!" };
            return res.redirect('/home'); // Redirect to admin dashboard
        }

        // For regular users, sign in using Firebase Authentication
        await signInWithEmailAndPassword(auth, email, password);

        // Query Firestore for the user data
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();

            // Store user data in the session
            req.session.first_name = userData.first_name || "";
            req.session.last_name = userData.last_name || "";
            req.session.email = email;
            req.session.isAdmin = false; // Set isAdmin to false for regular users

            req.session.message = { type: 'success', message: "Login successful!" };
            return res.redirect('/home'); // Redirect normal users to home
        } else {
            throw new Error("User data not found in Firestore");
        }
    } catch (err) {
        console.error('Error during login:', err.message);

        let errorMessage;
        if (err.code) {
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
        } else {
            errorMessage = err.message || "Error during login. Please try again.";
        }

        req.session.message = { type: 'danger', message: errorMessage };
        return res.redirect('/');
    }
});
app.get('/rank', async (req, res) => {
    try {
        const submissionsCollection = collection(db, "test_submissions");
        const submissionsSnapshot = await getDocs(submissionsCollection);
        const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate scores and training levels
        const results = await Promise.all(submissions.map(async (submission) => {
            const totalQuestions = submission.testId ? await getTotalQuestionsFromTest(submission.testId) : 0;
            const userAnswers = Object.values(submission.answers || {});
            const testQuestions = submission.testId ? await getTestQuestions(submission.testId) : [];

            const correctCount = userAnswers.filter((answer, index) => {
                const question = testQuestions[index];
                return question && answer === question.correct_answer;
            }).length;

            const scorePercentage = (correctCount / totalQuestions) * 100;

            let trainingLevel;
            if (scorePercentage <= 50) {
                trainingLevel = "Level 3 training required";
            } else if (scorePercentage <= 70) {
                trainingLevel = "Level 2 training required";
            } else {
                trainingLevel = "Level 1 training required";
            }

            // Fetch user details
            const userSnapshot = await getDocs(query(collection(db, "users"), where("email", "==", submission.email)));
            const userName = userSnapshot.empty ? 'Unknown' : `${userSnapshot.docs[0].data().first_name} ${userSnapshot.docs[0].data().last_name}`;

            // Fetch test details
            const testSnapshot = await getDoc(doc(db, "tests", submission.testId));
            const testName = testSnapshot.exists() ? testSnapshot.data().test_topic : 'Unknown';

            return {
                userName,
                testName,
                email: submission.email,
                score: scorePercentage.toFixed(2),
                trainingLevel
            };
        }));

        // Group results by testName
        const groupedResults = results.reduce((acc, result) => {
            if (!acc[result.testName]) {
                acc[result.testName] = [];
            }
            acc[result.testName].push(result);
            return acc;
        }, {});

        // Prepare final output with ranks
        const finalResults = [];
        for (const testName in groupedResults) {
            const group = groupedResults[testName];
            // Sort by score descending
            group.sort((a, b) => b.score - a.score);
            // Assign ranks
            group.forEach((result, index) => {
                result.rank = index + 1; // Start rank from 1
            });
            finalResults.push({ testName, candidates: group });
        }

        res.render('rank', { finalResults, userEmail: req.session.email, isAdmin: req.session.isAdmin });
    } catch (err) {
        console.error('Error fetching submissions:', err.message);
        res.render('rank', { finalResults: [], userEmail: null, isAdmin: false });
    }
});






// Route to display tests grouped by testId and test_time
app.get('/test-create-by-organization', async (req, res) => {
    try {
        // Fetch all tests
        const testsCollection = collection(db, "tests");
        const testsSnapshot = await getDocs(testsCollection);
        const tests = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Group tests by testId and test_time
        const groupedTests = tests.reduce((acc, test) => {
            const key = `${test.testId}_${test.test_time}`;
            if (!acc[key]) {
                acc[key] = {
                    testId: test.testId,
                    test_time: test.test_time,
                    tests: []
                };
            }
            acc[key].tests.push(test);
            return acc;
        }, {});

        res.render('test-create-by-organization', { groupedTests: Object.values(groupedTests) });
    } catch (err) {
        console.error('Error fetching grouped tests:', err.message);
        res.status(500).send('Error fetching grouped tests');
    }
});




// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
