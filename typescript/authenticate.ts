const clientId: string = 'baa9013e4f5a497cb60185afdca3f2dd';
const redirectUri: string = 'http://localhost:8181/home.html';
const tokenUri: string = 'https://accounts.spotify.com/api/token';

function generateRandomString(length: number): string {
    const possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values: Uint8Array = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
    const encoder: TextEncoder = new TextEncoder();
    const data: Uint8Array = encoder.encode(codeVerifier);
    const digest: ArrayBuffer = await window.crypto.subtle.digest('SHA-256', data);
  
    return base64encode(digest);
}

function requestUserAuth(): void {
    let codeVerifier: string = generateRandomString(128);

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
        let state: string = generateRandomString(16);
        let scope: string = 'user-read-private user-read-email';

        localStorage.setItem('code_verifier', codeVerifier);

        let args: URLSearchParams = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
        });

        window.location = 'https://accounts.spotify.com/authorize?' + args;
    });
}

async function requestAccessToken(): Promise<void> {
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    let code: string = urlParams.get('code');

    // User didn't authorize with Spotify
    if (code == null || code.length <= 0) {
        window.location = '/index.html';
    }

    let codeVerifier: string = localStorage.getItem('code_verifier');

    let body: URLSearchParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
    });

    let authPromise: Promise<void> = fetch(tokenUri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    }).then(response => {
        if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
        }
        return response.json();
    }).then(data => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
    }).catch(error => {
        console.error('Error:', error);
    }).finally(() =>{
        localStorage.removeItem('code_verifier');
    });

    return authPromise;
}

// Technically won't return until the token is fullfilled
async function getAccessToken(): Promise<string> {
    await requestAccessToken();
    let token: string = localStorage.getItem('access_token');
    return token;
}

function refreshAcessToken(): void {
    const refreshToken = localStorage.getItem('refresh_token');

    let body: URLSearchParams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
    });

    fetch(tokenUri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    }).then(response => {
        if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
        }
        return response.json();
    }).then(data => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
    }).catch(error => {
        console.error('Error:', error);
    });
}

function redirectIfAuthorized(): void {
    if (localStorage.getItem('access_token') == null) {
        window.location = '/home.html';
    }
}