// 第四境界 - 統合版
// GitHub Pages対応（/index.html不要）

let currentUser = null;
let currentView = 'console';
let sessionStartTime = Date.now();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    startSystemTime();
    checkUrlParams();
});

// GitHub Pages対応: URLから/index.htmlを除去
function normalizeUrl() {
    if (window.location.pathname.endsWith('/index.html')) {
        const newPath = window.location.pathname.replace('/index.html', '/');
        window.history.replaceState({}, '', newPath + window.location.search);
    }
}

// URLパラメータのチェック（メール認証、マジックリンク）
function checkUrlParams() {
    normalizeUrl();
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const page = urlParams.get('page');
    
    if (page === 'verify' && token) {
        verifyEmail(token);
    } else if (page === 'magic-login' && token) {
        magicLogin(token);
    }
}

function initializeApp() {
    // Check if user is already logged in
    const token = localStorage.getItem('boundary_token');
    const userData = localStorage.getItem('boundary_user');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        showDashboard();
    } else {
        showLoginContainer();
    }
    
    typeSubtitle('SECURE ACCESS TERMINAL');
}

function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Magic Link Form
    const magicForm = document.getElementById('magic-link-form');
    if (magicForm) {
        magicForm.addEventListener('submit', handleMagicLink);
    }
    
    // Register Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Password Strength
    const regPassword = document.getElementById('register-password');
    if (regPassword) {
        regPassword.addEventListener('input', updatePasswordStrength);
    }
    
    // Console Input
    const consoleInput = document.getElementById('console-input');
    if (consoleInput) {
        consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = e.target.value.trim();
                if (command) {
                    executeCommand(command);
                    e.target.value = '';
                }
            }
        });
    }
}

// Screen Navigation
function showLoginContainer() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('main-console').classList.remove('active');
    updateConnectionStatus('STANDBY');
}

function showDashboard() {
    if (!currentUser) return;
    
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('main-console').classList.add('active');
    
    // Update user info
    document.getElementById('user-name').textContent = currentUser.username;
    document.getElementById('user-level').textContent = currentUser.level || 1;
    document.getElementById('user-avatar').textContent = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('console-username').textContent = currentUser.username;
    
    updateDashConnectionStatus('CONNECTED');
    sessionStartTime = Date.now();
    startUptime();
}

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

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

// Auth Tab Switching
function showAuthTab(tabName) {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.auth-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.closest('.auth-tab').classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.classList.remove('show');
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('boundary_token', data.token);
            localStorage.setItem('boundary_user', JSON.stringify(data.user));
            currentUser = data.user;
            showDashboard();
        } else {
            showError(errorDiv, data.error || 'ログインに失敗しました');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorDiv, 'サーバーに接続できませんでした');
    }
}

// Handle Magic Link
async function handleMagicLink(e) {
    e.preventDefault();
    
    const email = document.getElementById('magic-email').value.trim();
    const errorDiv = document.getElementById('magic-error');
    const successDiv = document.getElementById('magic-success');
    
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/request-magic-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess(successDiv, data.message + ' メールを確認してください。');
            document.getElementById('magic-email').value = '';
        } else {
            showError(errorDiv, data.error || 'リクエストに失敗しました');
        }
    } catch (error) {
        console.error('Magic link error:', error);
        showError(errorDiv, 'サーバーに接続できませんでした');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    if (password !== confirm) {
        showError(errorDiv, 'パスワードが一致しません');
        return;
    }
    
    if (!validatePassword(password)) {
        showError(errorDiv, 'パスワードは8文字以上で、大文字、小文字、数字を含む必要があります');
        return;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (data.requiresVerification) {
                showSuccess(successDiv, 'アカウントが作成されました！メールアドレスを確認してください。');
                document.getElementById('register-form').reset();
                document.getElementById('strength-bar').style.width = '0%';
            } else {
                // Auto-login if email not configured
                localStorage.setItem('boundary_token', data.token);
                localStorage.setItem('boundary_user', JSON.stringify(data.user));
                currentUser = data.user;
                showDashboard();
            }
        } else {
            showError(errorDiv, data.error || 'アカウント作成に失敗しました');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError(errorDiv, 'サーバーに接続できませんでした');
    }
}

// Email Verification
async function verifyEmail(token) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('boundary_token', data.token);
            localStorage.setItem('boundary_user', JSON.stringify(data.user));
            currentUser = data.user;
            
            alert('メール認証が完了しました！第四境界へようこそ。');
            
            // Clear URL params
            window.history.replaceState({}, '', window.location.pathname);
            
            showDashboard();
        } else {
            alert('認証エラー: ' + data.error);
            showLoginContainer();
        }
    } catch (error) {
        console.error('Verification error:', error);
        alert('認証エラーが発生しました');
        showLoginContainer();
    }
}

// Magic Link Login
async function magicLogin(token) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/magic-login?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('boundary_token', data.token);
            localStorage.setItem('boundary_user', JSON.stringify(data.user));
            currentUser = data.user;
            
            alert('ログインしました！第四境界へようこそ。');
            
            // Clear URL params
            window.history.replaceState({}, '', window.location.pathname);
            
            showDashboard();
        } else {
            alert('ログインエラー: ' + data.error);
            showLoginContainer();
        }
    } catch (error) {
        console.error('Magic login error:', error);
        alert('ログインエラーが発生しました');
        showLoginContainer();
    }
}

// Logout
async function logout() {
    const token = localStorage.getItem('boundary_token');
    
    if (token) {
        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    localStorage.removeItem('boundary_token');
    localStorage.removeItem('boundary_user');
    currentUser = null;
    
    showLoginContainer();
    showWelcome();
}

// Dashboard View Switching
function showDashboardView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(viewName + '-view').classList.add('active');
    event.target.classList.add('active');
    
    currentView = viewName;
}

// Console Commands
function executeCommand(cmd) {
    const display = document.getElementById('console-display');
    
    // Echo command
    const cmdLine = document.createElement('p');
    cmdLine.className = 'console-line';
    cmdLine.innerHTML = `&gt; <span style="color: var(--secondary)">${cmd}</span>`;
    display.appendChild(cmdLine);
    
    const command = cmd.toLowerCase().trim();
    
    switch (command) {
        case 'help':
            addConsoleMessage('> 利用可能なコマンド:', 'highlight');
            addConsoleMessage('  help     - このヘルプを表示', 'dim');
            addConsoleMessage('  status   - システム状態を表示', 'dim');
            addConsoleMessage('  clear    - コンソールをクリア', 'dim');
            addConsoleMessage('  whoami   - ユーザー情報を表示', 'dim');
            addConsoleMessage('  time     - 現在時刻を表示', 'dim');
            break;
            
        case 'status':
            addConsoleMessage('> システム状態: OPERATIONAL', 'success');
            addConsoleMessage('> 接続: SECURE', 'success');
            addConsoleMessage('> ユーザー: ' + (currentUser ? currentUser.username : 'UNKNOWN'), '');
            addConsoleMessage('> レベル: ' + (currentUser ? currentUser.level : '0'), '');
            break;
            
        case 'clear':
            display.innerHTML = '';
            addConsoleMessage('> コンソールをクリアしました', 'dim');
            break;
            
        case 'whoami':
            if (currentUser) {
                addConsoleMessage('> ユーザー名: ' + currentUser.username, '');
                addConsoleMessage('> メール: ' + currentUser.email, '');
                addConsoleMessage('> レベル: ' + currentUser.level, '');
                addConsoleMessage('> 認証状態: ' + (currentUser.verified ? 'VERIFIED' : 'UNVERIFIED'), '');
            } else {
                addConsoleMessage('> エラー: ユーザー情報がありません', 'error');
            }
            break;
            
        case 'time':
            const now = new Date();
            addConsoleMessage('> 現在時刻: ' + now.toLocaleString('ja-JP'), '');
            break;
            
        default:
            addConsoleMessage('> エラー: 不明なコマンド "' + cmd + '"', 'error');
            addConsoleMessage('> "help" でヘルプを表示', 'dim');
    }
    
    // Auto scroll
    display.scrollTop = display.scrollHeight;
}

function addConsoleMessage(msg, type = '') {
    const display = document.getElementById('console-display');
    const line = document.createElement('p');
    line.className = 'console-line' + (type ? ' ' + type : '');
    line.textContent = msg;
    display.appendChild(line);
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

function updateConnectionStatus(status) {
    const statusText = document.querySelector('#connection-status .status-text');
    const statusDot = document.querySelector('#connection-status .status-indicator');
    
    if (statusText) statusText.textContent = status;
    
    if (statusDot) {
        if (status === 'CONNECTED') {
            statusDot.style.background = 'var(--primary)';
            statusDot.style.boxShadow = '0 0 8px var(--primary)';
        } else {
            statusDot.style.background = 'var(--text-dimmer)';
            statusDot.style.boxShadow = 'none';
        }
    }
}

function updateDashConnectionStatus(status) {
    const statusText = document.querySelector('#dash-connection-status .status-text');
    const statusDot = document.querySelector('#dash-connection-status .status-dot');
    
    if (statusText) statusText.textContent = status;
    
    if (statusDot) {
        statusDot.style.background = 'var(--primary)';
        statusDot.style.boxShadow = '0 0 10px var(--primary)';
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
        
        const timeElement = document.getElementById('system-time');
        const dashTimeElement = document.getElementById('dash-system-time');
        
        if (timeElement) timeElement.textContent = timeString;
        if (dashTimeElement) dashTimeElement.textContent = timeString;
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

function startUptime() {
    function updateUptime() {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            uptimeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }
    
    updateUptime();
    setInterval(updateUptime, 1000);
}
