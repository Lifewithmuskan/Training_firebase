document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        userSelection: document.getElementById("user-selection"),
        adminSelection: document.getElementById("admin-selection"),
        options: document.querySelector(".options"),
        roleSelection: document.querySelector(".role-selection"),
        createAccount: document.getElementById("create-account"),
        existingUser: document.getElementById("existing-user"),
        formContainer: document.getElementById("form-container")
    };

    elements.userSelection.addEventListener("click", () => {
        toggleVisibility(elements.options, 'flex');
        toggleVisibility(elements.roleSelection, 'none');
    });

    elements.adminSelection.addEventListener("click", () => {
        showForm('login');
        toggleVisibility(elements.roleSelection, 'none');
    });

    elements.createAccount.addEventListener("click", () => showForm('create'));
    elements.existingUser.addEventListener("click", () => showForm('login'));

    function toggleVisibility(element, displayStyle) {
        element.style.display = displayStyle;
    }

    function showForm(type) {
        let formHTML = '';

        if (type === 'create') {
            formHTML = generateCreateAccountForm();
        } else if (type === 'login') {
            formHTML = generateLoginForm();
        }

        elements.formContainer.innerHTML = formHTML;
        toggleVisibility(elements.options, 'none');
        attachSwitchEventListeners();
    }

    function generateCreateAccountForm() {
        return `
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
                </label>
                <button class="submit btn" type="submit">Submit</button>
                <p class="sign-in">Already have an account? 
                    <a href="#" id="switch-to-existing">Existing User</a>
                </p>
            </form>
        `;
    }

    function generateLoginForm() {
        return `
            <form action="/login" method="POST" class="form">
                <h2 class="title">Existing User</h2>
                <label>
                    <input type="email" name="email" placeholder="Email" required>
                </label>
                <label>
                    <input type="password" id="login-password" name="password" placeholder="Password" required>
                </label>
                <button class="submit btn" type="submit">Submit</button>
                <p class="sign-in">Don't have an account? 
                    <a href="#" id="switch-to-create">Create Account</a>
                </p>
            </form>
        `;
    }

    function attachSwitchEventListeners() {
        const switchToExisting = document.getElementById('switch-to-existing');
        const switchToCreate = document.getElementById('switch-to-create');

        if (switchToExisting) {
            switchToExisting.addEventListener('click', (e) => {
                e.preventDefault();
                showForm('login');
            });
        }

        if (switchToCreate) {
            switchToCreate.addEventListener('click', (e) => {
                e.preventDefault();
                showForm('create');
            });
        }
    }
});
