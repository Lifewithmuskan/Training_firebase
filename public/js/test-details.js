document.addEventListener('DOMContentLoaded', () => {
    const testForm = document.getElementById('test-form');

    // Handle test submission
    if (testForm) {
        testForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(testForm);
            const testId = formData.get('testId'); // Retrieve testId from formData
            const answers = {};

            // Collect answers from the form
            formData.forEach((value, key) => {
                if (key.startsWith('answers[')) {
                    const index = key.match(/\[(\d+)\]/)[1];
                    answers[index] = value;
                }
            });

            try {
                // Submit the test results to the backend
                const response = await fetch(`/submit-test/${testId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers }) // No need to include email or testId
                });

                const result = await response.json();

                if (response.ok) {
                    // Successfully submitted, now remove the test from the list in user_allot.ejs
                    const userAllotContainer = document.getElementById('user-allot-container'); // Ensure this ID matches your HTML

                    if (userAllotContainer) { // Check if the container exists
                        const testElement = userAllotContainer.querySelector(`[data-test-id="${testId}"]`);
                        if (testElement) {
                            testElement.remove(); // Remove the completed test from the DOM
                        }
                    } else {
                        console.warn('User allot container not found. Cannot remove test element.');
                    }

                    alert(result.message || 'Test submitted successfully!');
                    window.location.href = '/home'; // Redirect the user to home
                } else {
                    alert(result.error || 'An error occurred while submitting the test.');
                }
            } catch (err) {
                console.error('Error submitting test:', err);
                alert('An error occurred while submitting the test.');
            }
        });
    }
});
