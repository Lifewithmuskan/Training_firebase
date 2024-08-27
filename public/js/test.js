// Event listeners for the buttons
document.getElementById("create-account").addEventListener("click", function() {
    showCreateAccountForm();
});

document.getElementById("existing-user").addEventListener("click", function() {
    showExistingUserForm();
});

// Function to display the "Create Account" form
function showCreateAccountForm() {
    const formContainer = document.getElementById("form-container");
    formContainer.innerHTML = `
        <form action="/user" method="POST" class="form">
            <h2 class="title">Create Account</h2>
            <div class="flex">
                <label>
                    <input type="text" name="first_name" placeholder="First Name" required>
                </label>
                <label>
                    <input type="text" name="last_name" placeholder="Last Name" required>
                </label>
            </div>
            <label>
                <input type="email" name="email" placeholder="Email" required>
            </label>
            <label>
                <input type="text" name="education" placeholder="Education" required>
            </label>
            <label>
                <input type="text" name="department" placeholder="Department" required>
            </label>
            <label>
                <input type="text" name="position" placeholder="Position" required>
            </label>
            <button class="submit">Submit</button>
            <p class="sign-in">Already have an account? 
                <a href="#" id="switch-to-existing" style="color: #43c7e8">Existing User</a>
            </p>
        </form>
    `;

    // Attach the event listener for switching to the "Existing User" form
    document.getElementById("switch-to-existing").addEventListener("click", function(event) {
        event.preventDefault();
        showExistingUserForm();
    });
}

// Function to display the "Existing User" form
function showExistingUserForm() {
    const formContainer = document.getElementById("form-container");
    formContainer.innerHTML = `
        <form action="/login" method="POST" class="form">
            <h2 class="title">Existing User</h2>
            <label>
                <input type="email" name="email" placeholder="Email" required>
            </label>
            <label>
                <input type="password" name="password" placeholder="Password" required>
            </label>
            <button class="submit">Submit</button>
            <p class="sign-in">Don't have an account? 
                <a href="#" id="switch-to-create" style="color: #43c7e8">Create Account</a>
            </p>
        </form>
    `;

    // Attach the event listener for switching to the "Create Account" form
    document.getElementById("switch-to-create").addEventListener("click", function(event) {
        event.preventDefault();
        showCreateAccountForm();
    });
}
