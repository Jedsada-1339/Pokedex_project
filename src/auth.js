// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Load user data from sessionStorage if available
        this.loadUserFromStorage();
        this.updateUI();
    }

    loadUserFromStorage() {
        const stored = sessionStorage.getItem('currentUser');
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
                window.currentUser = this.currentUser;
            } catch (e) {
                console.error('Error parsing stored user data:', e);
                sessionStorage.removeItem('currentUser');
            }
        }
    }

    saveUser(userData) {
        this.currentUser = userData;
        window.currentUser = userData;
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        this.updateUI();
    }

    logout() {
        this.currentUser = null;
        window.currentUser = null;
        sessionStorage.removeItem('currentUser');
        
        // Sign out from Google if it was a Google login
        if (window.google && window.google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        
        // Redirect to login page
        window.location.href = './login.html';
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateUI() {
        const userSection = document.getElementById('userSection');
        if (!userSection) return;

        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            userSection.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                        ${user.picture ? 
                            `<img src="${user.picture}" alt="${user.name}" class="w-8 h-8 rounded-full">` : 
                            `<div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                ${user.name.charAt(0).toUpperCase()}
                            </div>`
                        }
                        <span class="text-sm font-medium text-gray-700">${user.name}</span>
                    </div>
                    <button id="logoutBtn" class="rounded-md bg-red-500 hover:bg-red-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors">
                        Logout
                    </button>
                </div>
            `;

            // Add logout functionality
            document.getElementById('logoutBtn').addEventListener('click', () => {
                this.logout();
            });
        } else {
            userSection.innerHTML = `
                <a class="rounded-md bg-indigo-500 hover:bg-indigo-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors" href="./login.html">
                    Login
                </a>
            `;
        }
    }

    // Method to check authentication before allowing certain actions
    requireAuth(callback) {
        if (this.isLoggedIn()) {
            callback();
        } else {
            alert('Please log in to access this feature');
            window.location.href = './login.html';
        }
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Utility functions for backward compatibility
function getUserData() {
    return window.authManager ? window.authManager.getCurrentUser() : null;
}

function saveUserData(userData) {
    if (window.authManager) {
        window.authManager.saveUser(userData);
    }
}