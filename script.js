// UI State Management
let currentScreen = 'welcome';
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    startSystemTime();
    typeSubtitle('SECURE ACCESS TERMINAL');
});

function initializeApp() {
    // Check if user is already logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        showDashboard();
        updateConnectionStatus('CONNECTED', true);
    } else {
        showWelcome();
        updateConnectionStatus('STANDBY', false);
    }
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Password strength indicator
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    currentScreen = screenId.replace('-screen', '');
}

function showWelcome() {
    showScreen('welcome-screen');
    updateConnectionStatus('STANDBY', false);
}

function showLogin() {
    showScreen('login-screen');
    document.getElementById('login-error').classList.remove('show');
}

function showRegister() {
    showScreen('register-screen');
    document.getElementById('register-error').classList.remove('show');
}

function showDashboard() {
    if (!currentUser) return;
    
    showScreen('dashboard-screen');
    updateConnectionStatus('CONNECTED', true);
    
    // Update dashboard data
    document.getElementById('user-name').textContent = currentUser.username;
    document.getElementById('dash-username').textContent = currentUser.username;
    document.getElementById('dash-level').textContent = currentUser.level || 1;
    
    if (currentUser.createdAt) {
        const date = new Date(currentUser.createdAt);
        document.getElementById('dash-joined').textContent = date.toLocaleDateString();
    }
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.classList.remove('show');
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and user data
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
            currentUser = data.user;
            
            // Show success animation
            showSuccessMessage('認証成功...');
            
            setTimeout(() => {
                showDashboard();
            }, 1000);
        } else {
            showError(errorDiv, data.error || '認証に失敗しました');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorDiv, 'サーバーに接続できませんでした');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const errorDiv = document.getElementById('register-error');
    
    errorDiv.classList.remove('show');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showError(errorDiv, 'パスワードが一致しません');
        return;
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
        showError(errorDiv, 'パスワードは8文字以上で、大文字、小文字、数字を含む必要があります');
        return;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and user data
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
            currentUser = data.user;
            
            // Show success animation
            showSuccessMessage('アイデンティティ作成完了...');
            
            setTimeout(() => {
                showDashboard();
            }, 1000);
        } else {
            showError(errorDiv, data.error || 'アカウント作成に失敗しました');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError(errorDiv, 'サーバーに接続できませんでした');
    }
}

async function logout() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (token) {
        try {
            await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    currentUser = null;
    
    // Show disconnect message
    showSuccessMessage('切断完了...');
    
    setTimeout(() => {
        showWelcome();
    }, 1000);
}

// Validation
function validatePassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
}

function updatePasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.getElementById('strength-bar');
    
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    strengthBar.style.width = strength + '%';
}

// UI Helpers
function showError(element, message) {
    element.textContent = '> ERROR: ' + message;
    element.classList.add('show');
}

function showSuccessMessage(message) {
    updateConnectionStatus(message, true);
}

function updateConnectionStatus(text, connected) {
    const statusText = document.querySelector('.status-text');
    const statusIndicator = document.querySelector('.status-indicator');
    
    if (statusText) {
        statusText.textContent = text;
    }
    
    if (statusIndicator) {
        statusIndicator.style.background = connected ? 'var(--primary-color)' : 'var(--text-dim)';
        statusIndicator.style.boxShadow = connected ? '0 0 8px var(--primary-color)' : 'none';
    }
}

function typeSubtitle(text) {
    const element = document.getElementById('subtitle');
    if (!element) return;
    
    let index = 0;
    element.textContent = '';
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, 50);
        }
    }
    
    setTimeout(type, 500);
}

function startSystemTime() {
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        const dateString = now.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        const timeElement = document.getElementById('system-time');
        if (timeElement) {
            timeElement.textContent = `${dateString} ${timeString}`;
        }
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

// Mission functionality (placeholder for ARG game logic)
function startMission() {
    alert('ミッション機能は現在開発中です。\n\nこの機能を実装することで、ARGゲームの謎解きやチャレンジを追加できます。');
}

// API Helper Functions
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (!token) {
        throw new Error('認証トークンがありません');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // If unauthorized, logout
    if (response.status === 401) {
        logout();
        throw new Error('セッションが無効です');
    }
    
    return response;
}

async function updateProgress(challenge, status, data) {
    try {
        const response = await fetchWithAuth(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROGRESS}`,
            {
                method: 'POST',
                body: JSON.stringify({ challenge, status, data })
            }
        );
        
        return await response.json();
    } catch (error) {
        console.error('Progress update error:', error);
        throw error;
    }
}
