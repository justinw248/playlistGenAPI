// import { URLSearchParams } from "url";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const clientId = 'baa9013e4f5a497cb60185afdca3f2dd';
const redirectUri = 'http://localhost:8181/home.html';
function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
function generateCodeChallenge(codeVerifier) {
    return __awaiter(this, void 0, void 0, function* () {
        function base64encode(string) {
            return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        }
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = yield window.crypto.subtle.digest('SHA-256', data);
        return base64encode(digest);
    });
}
function requestUserAuth() {
    let codeVerifier = generateRandomString(128);
    generateCodeChallenge(codeVerifier).then(codeChallenge => {
        let state = generateRandomString(16);
        let scope = 'user-read-private user-read-email';
        localStorage.setItem('code_verifier', codeVerifier);
        let args = new URLSearchParams({
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
function requestAccessToken() {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    let codeVerifier = localStorage.getItem('code_verifier');
    let body = new URLSearchParams({
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
function getAccessToken() {
    return localStorage.getItem('access_token');
}
