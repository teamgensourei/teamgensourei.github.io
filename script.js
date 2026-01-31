// Scratch認証対応版
let verifiedScratch = null;
let verifiedEmail = null;

document.addEventListener('DOMContentLoaded', () => {
    checkIfLoggedIn();
    setupEventListeners();
    startSystemTime();
    typeSubtitle('SCRATCH VERIFICATION SYSTEM');
});

function checkIfLoggedIn() {
    const token = localStorage.getItem('boundary_token');
    if (token) {
        // Already logged in, redirect to console
        window.location.href = 'console.html';
    }
}

function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Verify Form (Step 1)
    const verifyForm = document.getElementById('verify-form');
    if (verifyForm) {
        verifyForm.addEventListener('submit', handleVerify);
    }
    
    // Password Form (Step 2)
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handleCompleteRegistration);
    }
    
    // Password Strength
    const setPassword = document.getElementById('set-password');
    if (setPassword) {
        setPassword.addEventListener('input', updatePasswordStrength);
    }
}

// Screen Navigation
function showWelcome() {
    hideAllScreens();
    document.getElementById('welcome-screen').classList.add('active');
}

function showLogin() {
    hideAllScreens();
    document.getElementById('login-screen').classList.add('active');
}

function showRegister() {
    hideAllScreens();
    document.getElementById('register-screen').classList.add('active');
}

function showPasswordScreen() {
    hideAllScreens();
    document.getElementById('password-screen').classList.add('active');
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const scratchUsername = document.getElementById('login-scratch').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.classList.remove('show');
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scratchUsername, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('boundary_token', data.token);
            localStorage.setItem('boundary_user', JSON.stringify(data.user));
            window.location.href = 'console.html';
        } else {
            showError(errorDiv, data.error || 'ログインに失敗しました');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorDiv, 'サーバーに接続できませんでした');
    }
}

// Handle Scratch Verification (Step 1)
async function handleVerify(e) {
    e.preventDefault();
    
    const scratchUsername = document.getElementById('verify-scratch').value.trim();
    const email = document.getElementById('verify-email').value.trim();
    const errorDiv = document.getElementById('verify-error');
    const successDiv = document.getElementById('verify-success');
    
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    if (!scratchUsername || !email) {
        showError(errorDiv, 'すべてのフィールドを入力してください');
        return;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/verify-scratch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scratchUsername, email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            verifiedScratch = data.scratchUser.username;
            verifiedEmail = email;
            
            showSuccess(successDiv, 'Scratchアカウントを確認しました！');
            
            setTimeout(() => {
                document.getElementById('verified-username').textContent = verifiedScratch;
                showPasswordScreen();
            }, 1000);
        } else {
            showError(errorDiv, data.error || 'Scratch認証に失敗しました');
        }
    } catch (error) {
        console.error('Verification error:', error);
        showError(errorDiv, 'サーバーに接続できませんでした');
    }
}

// Handle Complete Registration (Step 2)
async function handleCompleteRegistration(e) {
    e.preventDefault();
    
    const password = document.getElementById('set-password').value;
    const confirm = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('password-error');
    
    errorDiv.classList.remove('show');
    
    if (password !== confirm) {
        showError(errorDiv, 'パスワードが一致しません');
        return;
    }
    
    if (!validatePassword(password)) {
        showError(errorDiv, 'パスワードは8文字以上で、大文字、小文字、数字を含む必要があります');
        return;
    }
    
    if (!verifiedScratch || !verifiedEmail) {
        showError(errorDiv, 'セッションエラー。最初からやり直してください。');
        return;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/complete-registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                scratchUsername: verifiedScratch,
                email: verifiedEmail,
                password 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('boundary_token', data.token);
            localStorage.setItem('boundary_user', JSON.stringify(data.user));
            
            alert('アカウントが作成されました！コンソールへ移動します。');
            window.location.href = 'console.html';
        } else {
            showError(errorDiv, data.error || 'アカウント作成に失敗しました');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError(errorDiv, 'サーバーに接続できませんでした');
    }
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

function showSuccess(element, message) {
    element.textContent = '> ' + message;
    element.classList.add('show');
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
        
        const timeElement = document.getElementById('system-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}
