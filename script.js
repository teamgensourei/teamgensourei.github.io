// メール認証対応版
let pendingEmail = null;
let pendingScratchUsername = null;

document.addEventListener('DOMContentLoaded', () => {
    checkIfLoggedIn();
    setupEventListeners();
    startSystemTime();
    typeSubtitle('EMAIL VERIFICATION SYSTEM');
});

function checkIfLoggedIn() {
    const token = localStorage.getItem('boundary_token');
    if (token) {
        window.location.href = 'console.html';
    }
}

function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register Form - Step 1 (Email送信)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleSendCode);
    }
    
    // Verification Form - Step 2 (コード確認)
    const verifyForm = document.getElementById('verify-form');
    if (verifyForm) {
        verifyForm.addEventListener('submit', handleVerifyCode);
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

function showVerifyCodeScreen() {
    hideAllScreens();
    document.getElementById('verify-code-screen').classList.add('active');
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

// Login
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

// Step 1: 認証コードをメールに送信
async function handleSendCode(e) {
    e.preventDefault();
    
    const scratchUsername = document.getElementById('register-scratch').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    if (!scratchUsername || !email) {
        showError(errorDiv, 'すべてのフィールドを入力してください');
        return;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/register/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scratchUsername, email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            pendingEmail = email;
            pendingScratchUsername = scratchUsername;
            
            showSuccess(successDiv, '認証コードをメールに送信しました！');
            
            setTimeout(() => {
                document.getElementById('verify-email-display').textContent = email;
                showVerifyCodeScreen();
            }, 1000);
        } else {
            showError(errorDiv, data.error || '送信に失敗しました');
        }
    } catch (error) {
        console.error('Send code error:', error);
        showError(errorDiv, 'サーバーに接続できませんでした');
    }
}

// Step 2: 認証コード確認とアカウント作成
async function handleVerifyCode(e) {
    e.preventDefault();
    
    const code = document.getElementById('verify-code').value.trim();
    const password = document.getElementById('set-password').value;
    const confirm = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('verify-error');
    
    errorDiv.classList.remove('show');
    
    if (!code || !password || !confirm) {
        showError(errorDiv, 'すべてのフィールドを入力してください');
        return;
    }
    
    if (password !== confirm) {
        showError(errorDiv, 'パスワードが一致しません');
        return;
    }
    
    if (!validatePassword(password)) {
        showError(errorDiv, 'パスワードは8文字以上で、大文字、小文字、数字を含む必要があります');
        return;
    }
    
    if (!pendingEmail) {
        showError(errorDiv, 'セッションエラー。最初からやり直してください。');
        return;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/register/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: pendingEmail,
                code,
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
        console.error('Verify code error:', error);
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
