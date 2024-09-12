// Function to send data to the server
function sendTestSubmission(answers, testId) {
    const formAction = `/submit-test/${testId}`;  // Use dynamic test ID in the URL

    fetch(formAction, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),  // Convert the answers object to JSON
    })
    .then(response => {
        if (!response.ok) {
            // Handle HTTP errors
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Handle the response data
        console.log('Success:', data);
    })
    .catch(error => {
        // Handle errors with the fetch call
        console.error('Fetch error:', error);
    });
}

// Example usage with a form submission
document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Convert FormData to a plain object
    const answers = {};
    formData.forEach((value, key) => {
        answers[key] = value;
    });

    // Retrieve test ID from somewhere (e.g., a hidden input or a data attribute)
    const testId = document.querySelector('input[name="test-id"]').value;  // Example selector

    // Call the function to send the data
    sendTestSubmission(answers, testId);
});
