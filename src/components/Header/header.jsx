import React, { useState, useEffect } from 'react';
import './header.css';
import { CLIENT_ID, REDIRECT_URI } from '../../services/spotify/config';


const Header = ({ profile, setProfile, setUserId, accessToken, setAccessToken }) => {

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code && !profile && !accessToken) {
            login();
        }
    }, [profile, accessToken]);


    async function login() {
        const clientId = CLIENT_ID;
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
            redirectToAuthCodeFlow(clientId);
        } else {
            try {
                const accessToken = await getAccessToken(clientId, code);
                setAccessToken(accessToken);
                const userProfile = await fetchProfile(accessToken);
                console.log("Fetched profile:", userProfile);
                setProfile(userProfile);
                setUserId(userProfile.id);
            } catch (error) {
                console.error("Error during login:", error);
            } finally {
                // Clear the code parameter from the URL
                const newUrl = new URL(window.location);
                newUrl.searchParams.delete("code");
                window.history.replaceState({}, document.title, newUrl.toString());
            }
        }
    }

    async function redirectToAuthCodeFlow(clientId) {
        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);

        localStorage.setItem("verifier", verifier);

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("response_type", "code");
        params.append("redirect_uri", REDIRECT_URI);
        params.append("scope", "user-read-private user-read-email playlist-modify-private playlist-modify-public playlist-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing");
        params.append("code_challenge_method", "S256");
        params.append("code_challenge", challenge);

        document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    function generateCodeVerifier(length) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    async function generateCodeChallenge(codeVerifier) {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    async function getAccessToken(clientId, code) {
        const verifier = localStorage.getItem("verifier");

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", REDIRECT_URI);
        params.append("code_verifier", verifier);

        const result = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

        if (!result.ok) {
            throw new Error(`Failed to get access token: ${result.statusText}`);
        }

        const { access_token } = await result.json();
        return access_token;
    }

    async function fetchProfile(token) {
        const result = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) {
            throw new Error(`Failed to fetch profile: ${result.statusText}`);
        }

        return await result.json();
    }

    return (
        <div className='header'>
            <div className='app-name'><h1>JAMMMING</h1></div>
            <div className='user-name'>{profile ? (<h3>{profile.display_name}</h3>) : (<h3>Please Login</h3>)}</div>
            {!profile ? (<div className='header-btn'><button className='login-btn' onClick={login}>Log In</button></div>) : (<div className='header-btn'><button className='switch-btn' onClick={login}>X</button></div>)  }
        </div>
    )
}

export default Header;