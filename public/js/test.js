// Function to display the form based on the type
function showForm(type) {
    const formContainer = document.getElementById("form-container");
    let formHTML = '';

    if (type === 'create') {
        formHTML = `
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
                <label>
                    <input type="password" id="create-password" name="password" placeholder="Password" required>
                    <input type="checkbox" id="show-create-password" style="margin-left: 8px;"> Show Password
                </label>
                <button class="submit" type="submit">Submit</button>
                <p class="sign-in">Already have an account? 
                    <a href="#" id="switch-to-existing" style="color: #43c7e8">Existing User</a>
                </p>
            </form>
        `;

        // Keep the buttons visible when a form is displayed
        document.querySelector(".options").style.display = 'flex';

        // Clean up and attach event listener for switching to the "Existing User" form
        attachSwitchListener("switch-to-existing", 'login');
    } else if (type === 'login') {
        formHTML = `
            <form action="/login" method="POST" class="form">
                <h2 class="title">Existing User</h2>
                <label>
                    <input type="email" name="email" placeholder="Email" required>
                </label>
                <label>
                    <input type="password" id="login-password" name="password" placeholder="Password" required>
                    <input type="checkbox" id="show-login-password" style="margin-left: 8px;"> Show Password
                </label>
                <button class="submit" type="submit">Submit</button>
                <p class="sign-in">Don't have an account? 
                    <a href="#" id="switch-to-create" style="color: #43c7e8">Create Account</a>
                </p>
            </form>
        `;

        // Keep the buttons visible when a form is displayed
        document.querySelector(".options").style.display = 'flex';

        // Clean up and attach event listener for switching to the "Create Account" form
        attachSwitchListener("switch-to-create", 'create');
    }

    formContainer.innerHTML = formHTML;

    // Initialize password visibility toggle
    initializePasswordToggle();
}

// Function to initialize password visibility toggle
function initializePasswordToggle() {
    const createPasswordField = document.getElementById('create-password');
    const showCreatePasswordCheckbox = document.getElementById('show-create-password');

    const loginPasswordField = document.getElementById('login-password');
    const showLoginPasswordCheckbox = document.getElementById('show-login-password');

    if (showCreatePasswordCheckbox) {
        showCreatePasswordCheckbox.addEventListener('change', function() {
            createPasswordField.type = this.checked ? 'text' : 'password';
        });
    }

    if (showLoginPasswordCheckbox) {
        showLoginPasswordCheckbox.addEventListener('change', function() {
            loginPasswordField.type = this.checked ? 'text' : 'password';
        });
    }
}

// Function to attach event listener for form switching
function attachSwitchListener(elementId, targetForm) {
    const link = document.getElementById(elementId);
    if (link) {
        link.removeEventListener('click', handleFormSwitch); // Clean up previous listener
        link.addEventListener('click', function(event) {
            event.preventDefault();
            showForm(targetForm);
        });
    }
}

// Initialize default form
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("create-account").addEventListener("click", function() {
        showForm('create');
    });

    document.getElementById("existing-user").addEventListener("click", function() {
        showForm('login');
    });
});
