document.addEventListener('DOMContentLoaded', () => {
    const userSelection = document.getElementById("user-selection");
    const adminSelection = document.getElementById("admin-selection");
    const options = document.querySelector(".options");
    const roleSelection = document.querySelector(".role-selection");
    const createAccount = document.getElementById("create-account");
    const existingUser = document.getElementById("existing-user");
    const formContainer = document.getElementById("form-container");

    userSelection.addEventListener("click", () => {
        options.style.display = 'flex';
        roleSelection.style.display = 'none';
    });

    adminSelection.addEventListener("click", () => {
        showForm('login');
        roleSelection.style.display = 'none';
    });

    createAccount.addEventListener("click", () => showForm('create'));
    existingUser.addEventListener("click", () => showForm('login'));

    function showForm(type) {
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
                    </label>
                    <button class="submit" type="submit">Submit</button>
                    <p class="sign-in">Already have an account? 
                        <a href="#" id="switch-to-existing">Existing User</a>
                    </p>
                </form>
            `;
        } else if (type === 'login') {
            formHTML = `
                <form action="/login" method="POST" class="form">
                    <h2 class="title">Existing User</h2>
                    <label>
                        <input type="email" name="email" placeholder="Email" required>
                    </label>
                    <label>
                        <input type="password" id="login-password" name="password" placeholder="Password" required>
                    </label>
                    <button class="submit" type="submit">Submit</button>
                    <p class="sign-in">Don't have an account? 
                        <a href="#" id="switch-to-create">Create Account</a>
                    </p>
                </form>
            `;
        }

        formContainer.innerHTML = formHTML;
        options.style.display = 'none';

        // Attach event listeners for form switching
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