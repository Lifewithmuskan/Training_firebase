document.addEventListener('DOMContentLoaded', () => {
    const emailForm = document.getElementById('email-form');
    const questionsSection = document.getElementById('questions-section');
    const testForm = document.getElementById('test-form');

    emailForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;

        if (email) {
            localStorage.setItem('userEmail', email);
            emailForm.style.display = 'none';
            questionsSection.style.display = 'block';
        } else {
            alert('Please enter a valid email address.');
        }
    });

    if (testForm) {
        testForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(testForm);
            const testId = formData.get('testId'); // Retrieve testId from formData
            const answers = {};

            formData.forEach((value, key) => {
                if (key.startsWith('answers[')) {
                    const index = key.match(/\[(\d+)\]/)[1];
                    answers[index] = value;
                }
            });

            const email = localStorage.getItem('userEmail');

            try {
                const response = await fetch(`/submit-test/${testId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, answers, testId }) // Include testId in the body
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    window.location.href = '/home';
                } else {
                    alert(result.error);
                }
            } catch (err) {
                console.error('Error submitting test:', err);
                alert('An error occurred while submitting the test.');
            }
        });
    }
});
