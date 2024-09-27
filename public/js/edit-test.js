document.addEventListener('DOMContentLoaded', () => {
    // Initialize question index based on existing number of questions
    let questionIndex = document.querySelectorAll('.question').length;

    // Show question editing form when "Edit Test" is clicked
    document.getElementById('make-test').addEventListener('click', () => {
        document.getElementById('test-info-container').classList.add('hidden');
        document.getElementById('questions-container').classList.remove('hidden');
    });

    // Function to add a new question
    document.getElementById('add-new-question').addEventListener('click', () => {
        addNewQuestion();
    });

    // Function to delete a question
    window.deleteQuestion = (index) => {
        const questionElement = document.getElementById(`question-${index}`);
        questionElement.remove();
        updateQuestionCount();
    };

    // Function to add new question dynamically
    function addNewQuestion() {
        const questionList = document.getElementById('questions-list');
        const newQuestionHTML = `
            <div class="question" id="question-${questionIndex}">
                <h3>Question ${questionIndex + 1}</h3>
                <label for="question-${questionIndex}">Question:</label>
                <input type="text" id="question-${questionIndex}" name="questions[${questionIndex}][question]" required>
                
                <label for="question-type-${questionIndex}">Answer Type:</label>
                <select id="question-type-${questionIndex}" name="questions[${questionIndex}][type]" onchange="toggleAnswerType(${questionIndex})">
                    <option value="mcq">Multiple Choice</option>
                    <option value="word">One-word Answer</option>
                    <option value="image">Image Question</option>
                </select>

                <div id="options-container-${questionIndex}" class="options-container">
                    <div class="options">
                        <label>Options:</label>
                        <div id="options-${questionIndex}">
                            <input type="text" name="questions[${questionIndex}][options][]" placeholder="Option 1" required>
                            <input type="text" name="questions[${questionIndex}][options][]" placeholder="Option 2" required>
                        </div>
                    </div>
                    <button type="button" class="action-button" onclick="addOption(${questionIndex})">Add Option</button>
                </div>

                <div class="correct-answer">
                    <label for="correct-answer-${questionIndex}">Correct Answer:</label>
                    <input type="text" id="correct-answer-${questionIndex}" name="questions[${questionIndex}][correct_answer]" required>
                </div>

                <div id="image-upload-container-${questionIndex}" style="display:none">
                    <label for="image-upload-${questionIndex}">Upload Image:</label>
                    <input type="file" id="image-upload-${questionIndex}" accept="image/*" onchange="previewImage(this, ${questionIndex})">
                    <div id="image-preview-${questionIndex}" class="image-preview"></div>
                </div>

                <button type="button" class="action-button delete-button" onclick="deleteQuestion(${questionIndex})">Delete Question</button>
                <hr>
            </div>`;
        
        questionList.insertAdjacentHTML('beforeend', newQuestionHTML);
        questionIndex++;
        updateQuestionCount();
    }

    // Function to dynamically add an option to a question
    window.addOption = (index) => {
        const optionsContainer = document.getElementById(`options-${index}`);
        const optionCount = optionsContainer.querySelectorAll('input').length;
        const newOptionHTML = `<input type="text" name="questions[${index}][options][]" placeholder="Option ${optionCount + 1}" required>`;
        optionsContainer.insertAdjacentHTML('beforeend', newOptionHTML);
    };

    // Function to toggle answer type (show/hide options or image upload)
    window.toggleAnswerType = (index) => {
        const questionType = document.getElementById(`question-type-${index}`).value;
        const optionsContainer = document.getElementById(`options-container-${index}`);
        const imageUploadContainer = document.getElementById(`image-upload-container-${index}`);

        if (questionType === 'mcq') {
            optionsContainer.style.display = 'block';
            imageUploadContainer.style.display = 'none';
        } else if (questionType === 'image') {
            optionsContainer.style.display = 'none';
            imageUploadContainer.style.display = 'block';
        } else {
            optionsContainer.style.display = 'none';
            imageUploadContainer.style.display = 'none';
        }
    };

    // Function to update the total question count in the hidden input
    function updateQuestionCount() {
        document.getElementById('hidden-questions-count').value = document.querySelectorAll('.question').length;
    }

    // Image preview functionality for image questions
    window.previewImage = (input, index) => {
        const imagePreview = document.getElementById(`image-preview-${index}`);
        imagePreview.innerHTML = '';  // Clear previous preview
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.width = 150; // Set width
                img.height = 'auto'; // Keep aspect ratio
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // Modal Preview (if required)
    const modal = document.getElementById('preview-modal');
    const closeModalBtn = document.querySelector('.close-button');
    closeModalBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Optional preview functionality for testing (can be expanded as needed)
    document.getElementById('preview-test').addEventListener('click', () => {
        const previewContent = document.getElementById('preview-content');
        previewContent.innerHTML = generatePreviewHTML();
        modal.style.display = 'block';
    });

    function generatePreviewHTML() {
        let html = `<h2>${document.getElementById('test-topic').value}</h2>`;
        const questions = document.querySelectorAll('.question');
        questions.forEach((question, index) => {
            html += `<p><b>Question ${index + 1}:</b> ${question.querySelector(`input[name="questions[${index}][question]"]`).value}</p>`;
        });
        return html;
    }
});
