document.addEventListener('DOMContentLoaded', () => {
    const makeTestButton = document.getElementById('make-test');
    const questionsContainer = document.getElementById('questions-container');
    const testInfoContainer = document.getElementById('test-info-container');
    const saveTestButton = document.getElementById('save-test');
    const addNewQuestionButton = document.getElementById('add-new-question');
    let questionCount = 0;

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
    addNewQuestionButton.addEventListener('click', () => {
        generateQuestionForm();
    });
    

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
                <option value="image">Image Question</option>
            </select>

            <div id="options-container-${questionCount}" class="options-container">
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

            <div id="image-upload-container-${questionCount}" style="display: none;">
                <label for="image-upload-${questionCount}">Upload Image:</label>
                <input type="file" id="image-upload-${questionCount}" accept="image/*" onchange="previewImage(this, ${questionCount})">
                <div id="image-preview-${questionCount}" class="image-preview"></div>
            </div>

            <button type="button" class="action-button delete-button" onclick="deleteQuestion(${questionCount})">Delete Question</button>
            <hr>
        `;

        document.getElementById('questions-list').appendChild(questionDiv);
        questionCount++;
    }

    window.toggleAnswerType = function (questionIndex) {
        const questionType = document.getElementById(`question-type-${questionIndex}`).value;
        const optionsContainer = document.getElementById(`options-container-${questionIndex}`);
        const imageUploadContainer = document.getElementById(`image-upload-container-${questionIndex}`);

        if (questionType === 'mcq') {
            optionsContainer.style.display = 'block';
            imageUploadContainer.style.display = 'none';
            enableOptions(questionIndex); // Enable options fields for MCQ
        } else if (questionType === 'image') {
            optionsContainer.style.display = 'none';
            imageUploadContainer.style.display = 'block';
            disableOptions(questionIndex); // Disable options fields for image questions
        } else {
            optionsContainer.style.display = 'none';
            imageUploadContainer.style.display = 'none';
            disableOptions(questionIndex); // Disable options fields for one-word answers
        }
    };

    window.addOption = function (questionIndex) {
        const optionsDiv = document.getElementById(`options-${questionIndex}`);
        const optionCount = optionsDiv.querySelectorAll('input').length + 1;
        const newOption = document.createElement('input');
        newOption.type = 'text';
        newOption.name = `questions[${questionIndex}][options][]`;
        newOption.placeholder = `Option ${optionCount}`;
        newOption.required = true;
        optionsDiv.appendChild(newOption);
    };

    window.deleteQuestion = function (questionIndex) {
        const questionDiv = document.getElementById(`question-${questionIndex}`);
        questionDiv.remove();
        updateQuestionNumbers();
    };

    function updateQuestionNumbers() {
        const questionDivs = document.querySelectorAll('.question');
        questionDivs.forEach((div, index) => {
            const heading = div.querySelector('h3');
            heading.textContent = `Question ${index + 1}`;
        });
        questionCount = questionDivs.length;
    }

    window.previewImage = function(input, questionIndex) {
        const previewContainer = document.getElementById(`image-preview-${questionIndex}`);
        const file = input.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = `Preview of image for Question ${questionIndex + 1}`;
                img.style.width = '150px';
                img.style.height = 'auto';
                previewContainer.innerHTML = '';
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        } else {
            previewContainer.innerHTML = '';
        }
    };

    saveTestButton.addEventListener('click', (event) => {
        const testData = {
            topic: document.getElementById('hidden-topic').value,
            subTopic: document.getElementById('hidden-sub-topic').value,
            time: document.getElementById('hidden-time').value,
            questions: []
        };

        const questionsDivs = document.querySelectorAll('.question');
        let valid = true;

        questionsDivs.forEach((div, index) => {
            const question = {
                text: div.querySelector(`input[name$="[question]"]`).value,
                type: div.querySelector(`select[name$="[type]"]`).value,
                options: [],
                correctAnswer: div.querySelector(`input[name$="[correct_answer]"]`).value,
            };

            // Check for required fields
            if (!question.text || !question.correctAnswer) {
                valid = false;
                alert(`Please fill in the question and correct answer for Question ${index + 1}.`);
            }

            // Check options only if the question type is MCQ
            if (question.type === 'mcq') {
                const optionInputs = div.querySelectorAll(`input[name$="[options][]"]`);
                let hasValidOption = Array.from(optionInputs).some(optionInput => optionInput.value.trim() !== '');
                if (!hasValidOption) {
                    valid = false;
                    alert(`Please fill in at least one option for Question ${index + 1}.`);
                } else {
                    optionInputs.forEach(optionInput => {
                        question.options.push(optionInput.value);
                    });
                }
            }

            // Handle one-word answer and image types
            if (question.type === 'word') {
                question.options = []; // Clear options for one-word questions
            } else if (question.type === 'image') {
                const imageInput = div.querySelector(`input[type="file"]`);
                if (imageInput.files.length === 0) {
                    valid = false;
                    alert(`Please upload an image for Question ${index + 1}.`);
                }
            }

            testData.questions.push(question);
        });

        if (valid) {
            console.log('Test Data:', testData);
            // Submit the form if validation passes
            // document.getElementById('test-form').submit();
        } else {
            event.preventDefault();
        }
    });

    function enableOptions(questionIndex) {
        const optionInputs = document.querySelectorAll(`#options-${questionIndex} input`);
        optionInputs.forEach(input => input.disabled = false);
    }

    function disableOptions(questionIndex) {
        const optionInputs = document.querySelectorAll(`#options-${questionIndex} input`);
        optionInputs.forEach(input => {
            input.value = ''; // Clear value
            input.disabled = true; // Disable field
        });
    }
});
