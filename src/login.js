// Authentication functions
function saveUserData(userData) {
    window.currentUser = userData;
    // Also save to sessionStorage for persistence across page reloads
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
}

function getUserData() {
    if (window.currentUser) {
        return window.currentUser;
    }
    // Try to get from sessionStorage
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
        window.currentUser = JSON.parse(stored);
        return window.currentUser;
    }
    return null;
}

function redirectToIndex() {
    window.location.href = './index.html';
}

// Google OAuth callback
function handleCredentialResponse(response) {
    const userInfo = parseJwt(response.credential);
    
    const userData = {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        loginMethod: 'google'
    };
    
    saveUserData(userData);
    console.log('Google login successful:', userData);
    redirectToIndex();
}

// Parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Email form submission
document.getElementById('emailSignUpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (email && password) {
        // Simple validation
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        const userData = {
            id: 'email_' + Date.now().toString(),
            name: email.split('@')[0],
            email: email,
            picture: null,
            loginMethod: 'email'
        };
        
        saveUserData(userData);
        console.log('Email signup successful:', userData);
        redirectToIndex();
    }
});

// Check if already logged in
window.onload = function() {
    const currentUser = getUserData();
    if (currentUser) {
        redirectToIndex();
        return;
    }
    
    // Initialize Google Sign-In
    google.accounts.id.initialize({
        client_id: "143093462140-meut8ecm8h31ugs0fcb22cs615t14vna.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    
    // Auto-render the button
    google.accounts.id.renderButton(
        document.getElementById("g_id_onload"),
        { theme: "outline", size: "large" }
    );
};

// Initialize Google Sign-In when button is clicked
document.getElementById('googleSignInBtn').addEventListener('click', function() {
    google.accounts.id.prompt();
});