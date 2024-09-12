document.addEventListener('DOMContentLoaded', () => {
    const makeTestButton = document.getElementById('make-test');
    const questionsContainer = document.getElementById('questions-container');
    const testInfoContainer = document.getElementById('test-info-container');
    const questionsForm = document.getElementById('questions-form');
    const previewTestButton = document.getElementById('preview-test');
    const saveTestButton = document.getElementById('save-test');
    const previewModal = document.getElementById('preview-modal');
    const previewContent = document.getElementById('preview-content');
    const closeModalButton = document.querySelector('.close-button');
    const addNewQuestionButton = document.getElementById('add-new-question');
    let questionCount = 0;

    // Handle "Make Test" button click
    makeTestButton.addEventListener('click', () => {
        const testTopic = document.getElementById('test-topic').value.trim();
        const testSubTopic = document.getElementById('test-sub-topic').value.trim();
        const testTime = document.getElementById('test-time').value.trim();
        const numberOfQuestions = document.getElementById('number-of-questions').value.trim();

        if (testTopic && testSubTopic && testTime && numberOfQuestions) {
            document.getElementById('hidden-topic').value = testTopic;
            document.getElementById('hidden-sub-topic').value = testSubTopic;
            document.getElementById('hidden-time').value = testTime;
            document.getElementById('hidden-questions-count').value = numberOfQuestions;

            testInfoContainer.classList.add('hidden');
            questionsContainer.classList.remove('hidden');

            for (let i = 0; i < numberOfQuestions; i++) {
                generateQuestionForm();
            }
        } else {
            alert('Please fill in all fields before generating the test.');
        }
    });

    // Function to generate a new question form
    function generateQuestionForm() {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.id = `question-${questionCount}`;

        questionDiv.innerHTML = `
            <h3>Question ${questionCount + 1}</h3>
            <label for="question-${questionCount}">Question:</label>
            <input type="text" id="question-${questionCount}" name="questions[${questionCount}][question]" required>

            <label for="question-type-${questionCount}">Answer Type:</label>
            <select id="question-type-${questionCount}" name="questions[${questionCount}][type]" onchange="toggleAnswerType(${questionCount})">
                <option value="mcq">Multiple Choice</option>
                <option value="word">One-word Answer</option>
            </select>

            <div id="options-container-${questionCount}">
                <div class="options">
                    <label>Options:</label>
                    <div id="options-${questionCount}">
                        <input type="text" name="questions[${questionCount}][options][]" placeholder="Option 1" required>
                        <input type="text" name="questions[${questionCount}][options][]" placeholder="Option 2" required>
                    </div>
                </div>
                <button type="button" class="action-button" onclick="addOption(${questionCount})">Add Option</button>
            </div>

            <div class="correct-answer">
                <label for="correct-answer-${questionCount}">Correct Answer:</label>
                <input type="text" id="correct-answer-${questionCount}" name="questions[${questionCount}][correct_answer]" required>
            </div>

            <label for="image-${questionCount}">Image URL:</label>
            <input type="text" id="image-${questionCount}" name="questions[${questionCount}][image]">

            <button type="button" class="action-button delete-button" onclick="deleteQuestion(${questionCount})">Delete Question</button>

            <hr>
        `;

        document.getElementById('questions-list').appendChild(questionDiv);
        questionCount++;
    }

    // Toggle between multiple-choice and one-word answer
    window.toggleAnswerType = function (questionIndex) {
        const questionType = document.getElementById(`question-type-${questionIndex}`).value;
        const optionsContainer = document.getElementById(`options-container-${questionIndex}`);

        if (questionType === 'word') {
            optionsContainer.style.display = 'none';
        } else {
            optionsContainer.style.display = 'block';
        }
    };

    // Add new option to a specific question
    window.addOption = function (questionIndex) {
        const optionsDiv = document.getElementById(`options-${questionIndex}`);
        const optionCount = optionsDiv.querySelectorAll('input').length + 1;
        const newOption = document.createElement('input');
        newOption.type = 'text';
        newOption.name = `questions[${questionIndex}][options][]`;
        newOption.placeholder = `Option ${optionCount}`;
        optionsDiv.appendChild(newOption);
    };

    // Delete a question
    window.deleteQuestion = function (questionIndex) {
        const questionDiv = document.getElementById(`question-${questionIndex}`);
        questionDiv.remove();
        updateQuestionNumbers();
    };

    // Function to update question numbers after deletion
    function updateQuestionNumbers() {
        const questionDivs = document.querySelectorAll('.question');
        questionDivs.forEach((div, index) => {
            const heading = div.querySelector('h3');
            heading.textContent = `Question ${index + 1}`;
        });
        questionCount = questionDivs.length;
    }

    // Preview test when "Preview" button is clicked
    previewTestButton.addEventListener('click', () => {
        showPreview();
    });

    // Show preview of test
    function showPreview() {
        previewContent.innerHTML = ''; // Clear existing content

        const testTopic = document.getElementById('hidden-topic').value;
        const testSubTopic = document.getElementById('hidden-sub-topic').value;
        const testTime = document.getElementById('hidden-time').value;

        previewContent.innerHTML += `
            <p><strong>Test Topic:</strong> ${testTopic}</p>
            <p><strong>Sub-Topic:</strong> ${testSubTopic}</p>
            <p><strong>Duration:</strong> ${testTime} minutes</p>
        `;

        Array.from(questionsForm.querySelectorAll('.question')).forEach((questionDiv, index) => {
            const questionText = questionDiv.querySelector(`input[name$="[question]"]`).value;
            const questionType = questionDiv.querySelector(`select[name$="[type]"]`).value;
            const correctAnswer = questionDiv.querySelector(`input[name$="[correct_answer]"]`).value;
            const imageURL = questionDiv.querySelector(`input[name$="[image]"]`).value;

            let options = '';
            if (questionType === 'mcq') {
                options = Array.from(questionDiv.querySelectorAll(`input[name$="[options][]"]`))
                    .map(option => option.value)
                    .filter(value => value.trim() !== '')
                    .map((option, idx) => `<li>Option ${idx + 1}: ${option}</li>`)
                    .join('');
            } else {
                options = '<p>One-word answer required.</p>';
            }

            const imagePreview = imageURL ? `<img src="${imageURL}" alt="Question Image" style="max-width: 100%; height: auto; margin-top: 10px;">` : '';

            previewContent.innerHTML += `
                <div class="preview-question">
                    <p><strong>Question ${index + 1}:</strong> ${questionText}</p>
                    ${imagePreview}
                    <p><strong>Correct Answer:</strong> ${correctAnswer}</p>
                    ${options}
                </div>
            `;
        });

        previewModal.style.display = 'block';
    }

    // Handle "Add New Question" button click
    addNewQuestionButton.addEventListener('click', () => {
        generateQuestionForm();
    });

    // Save test when "Save Test" button is clicked
    saveTestButton.addEventListener('click', () => {
        saveTest();
    });

    // Function to save the test
    function saveTest() {
        const formData = new FormData(questionsForm);
        const testDetails = {
            topic: document.getElementById('hidden-topic').value,
            subTopic: document.getElementById('hidden-sub-topic').value,
            time: document.getElementById('hidden-time').value,
            questions: []
        };

        formData.forEach((value, key) => {
            const match = key.match(/^questions\[(\d+)]\[(\w+)](?:\[(\d+)]?)?$/);
            if (match) {
                const [, index, field, optionIndex] = match;
                if (!testDetails.questions[index]) {
                    testDetails.questions[index] = {};
                }
                if (optionIndex !== undefined) {
                    if (!testDetails.questions[index].options) {
                        testDetails.questions[index].options = [];
                    }
                    testDetails.questions[index].options[optionIndex] = value;
                } else {
                    testDetails.questions[index][field] = value;
                }
            }
        });

        console.log(testDetails); // Replace this with your saving logic
        alert('Test saved successfully!');
    }

    // Close preview modal when "Close" button is clicked
    closeModalButton.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });
});



// Close the modal if the user clicks anywhere outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === previewModal) {
        previewModal.style.display = 'none';
    }
});
