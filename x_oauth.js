/* =========================
   X (Twitter) OAuth Integration
   
   OAuth 2.0 PKCE Flow
========================= */

// PKCE Helper Functions
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return base64Digest;
}

// X OAuth Login
async function loginWithX() {
  try {
    // Generate PKCE parameters
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(32);
    
    // Store in sessionStorage for callback
    sessionStorage.setItem('x_code_verifier', codeVerifier);
    sessionStorage.setItem('x_state', state);
    
    // OAuth parameters
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: X_OAUTH_CONFIG.CLIENT_ID,
      redirect_uri: X_OAUTH_CONFIG.REDIRECT_URI,
      scope: 'tweet.read users.read offline.access',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    
    // Redirect to X OAuth
    window.location.href = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    
  } catch (error) {
    console.error('X OAuth error:', error);
    alert('X認証の初期化に失敗しました');
  }
}

// Handle OAuth Callback
async function handleXCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  
  // Check for errors
  if (error) {
    console.error('X OAuth error:', error);
    alert('X認証がキャンセルされました');
    window.location.href = '/index.html';
    return;
  }
  
  // Verify state
  const savedState = sessionStorage.getItem('x_state');
  if (!state || state !== savedState) {
    console.error('State mismatch');
    alert('認証エラー: 不正なリクエストです');
    window.location.href = '/index.html';
    return;
  }
  
  // Exchange code for token
  if (code) {
    try {
      const codeVerifier = sessionStorage.getItem('x_code_verifier');
      
      // Send to backend
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/x/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          codeVerifier
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save token and user data
        localStorage.setItem('boundary_token', data.token);
        localStorage.setItem('boundary_user', JSON.stringify(data.user));
        
        // Cleanup
        sessionStorage.removeItem('x_code_verifier');
        sessionStorage.removeItem('x_state');
        
        // Redirect to console
        window.location.href = '/console.html';
      } else {
        throw new Error(data.error || 'X認証に失敗しました');
      }
      
    } catch (error) {
      console.error('X callback error:', error);
      alert(error.message || 'X認証に失敗しました');
      window.location.href = '/index.html';
    }
  }
}

// Check if this is an OAuth callback
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code') || urlParams.has('error')) {
    handleXCallback();
  }
}
