// import { URLSearchParams } from "url";

const clientId: string = 'baa9013e4f5a497cb60185afdca3f2dd';
const redirectUri: string = 'http://localhost:8181/home.html';

function generateRandomString(length: number): string {
    let text: string = '';
    let possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i: number = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier): Promise<string> {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
  
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
            code_challenge: codeChallenge
        });

        window.location = 'https://accounts.spotify.com/authorize?' + args;
    });
}

function requestAccessToken(): void {
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    let code: string = urlParams.get('code');

    let codeVerifier: string = localStorage.getItem('code_verifier');

    let body: URLSearchParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
    });

    const response = fetch('https://accounts.spotify.com/api/token', {
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
    }).catch(error => {
        console.error('Error:', error);
    });
}

function getAccessToken(): string {
    return localStorage.getItem('access_token');
}