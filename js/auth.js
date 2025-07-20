

// This event listener attaches the 'login/signup' function to the form on the login page.

document.addEventListener("DOMContentLoaded", () => {
    // Attach listener for the login form if it exists
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }

    // Attach listener for the signup form if it exists
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", signup);
    }
});

// This function dynamically builds the navbar links.
function updateNav() {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    // This targets the <ul> element in your navbar
    const navLinksContainer = document.querySelector(".navbar-nav");

    // If the container doesn't exist on the page, do nothing.
    if (!navLinksContainer) {
        return;
    }

    let navContent = '';

    if (token) {
        // --- USER IS LOGGED IN ---
        if (userRole === "ROLE_ADMIN") {
            // Admin links
            navContent = `
                <li class="nav-item">
                    <a class="nav-link" href="admin.html">Admin Dashboard</a>
                </li>
                <li class="nav-item">
                    <button class="btn btn-danger ms-2" onclick="logout()">Logout</button>
                </li>
            `;
        } else {
            // Customer links
            navContent = `
                <form class="d-flex" onsubmit="handleSearch(event)">
                    <input class="form-control me-2" type="search" id="search-input" placeholder="Search by name or category...">
                    <button class="btn btn-outline-success" type="submit">Search</button>
                </form>
                
                <li class="nav-item">
                    <a class="nav-link" href="cart.html" title="Cart">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-badge">0</span>
                    </a>
                </li>
                <li class="nav-item">
                    <button class="btn btn-danger ms-2" onclick="logout()">Logout</button>
                </li>
            `;
        }
    } else {
        // --- USER IS NOT LOGGED IN (GUEST) ---
        navContent = `
            <li class="nav-item">
                <a class="nav-link" href="login.html">Login / Signup</a>
            </li>
        `;
    }

    navLinksContainer.innerHTML = navContent;

    // After updating the navbar, also update the cart counter if it exists
    if(typeof updateCartCounter === 'function') {
        updateCartCounter();
    }
}


async function signup(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${BASE_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            alert("Signup failed! The email might already be in use.");
            return;
        }

        const data = await response.json();
        // The backend logs the user in immediately by returning a token
        localStorage.setItem("token", data.token);

        const payload = JSON.parse(atob(data.token.split('.')[1]));
        const roles = payload.authorities || [];
        
        const primaryRole = roles.length > 0 ? roles[0] : null;
        if(primaryRole) {
            localStorage.setItem("userRole", primaryRole);
        }

        // Redirect to the main page after successful registration
        window.location.href = "index.html";

    } catch (error) {
        console.error("Signup error:", error);
        alert("An error occurred during signup.");
    }
}


async function login(event) {
    event.preventDefault(); 
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${BASE_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            alert("Login failed! Please check your credentials.");
            return;
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);

        const payload = JSON.parse(atob(data.token.split('.')[1]));
        const roles = payload.authorities || [];
        
        const primaryRole = roles.length > 0 ? roles[0] : null;
        if(primaryRole) {
            localStorage.setItem("userRole", primaryRole);
        }

        if (roles.includes("ROLE_ADMIN")) {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } catch (error) {
        console.error("A critical error occurred during login:", error);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}