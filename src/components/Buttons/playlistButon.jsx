import React from 'react';
import './playlistButton.css'

function PlaylistButton({ label, onClick }) {
    return (
        <>
            <button onClick={onClick}>{label}</button>
        </>
    )
}

export default PlaylistButton;
