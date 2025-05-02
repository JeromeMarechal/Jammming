import React from "react";
import { useState } from "react";
import { FaPlay, FaBars, FaPlayCircle } from 'react-icons/fa';
import './playlist.css';
import PlaylistButton from "../Buttons/playlistButon.jsx";

function Playlist({ playlist, setPlaylist, playlistName, setPlaylistName, userId, accessToken, setResultHeader, setUserPlaylists, setSongs, playlistId, setPlaylistId, setToPlay, showPlaylist, setShowPlaylist, showResultsList, setShowResultsList, screenSize }) {

    const [importedPlaylist, setImportedPlaylist] = useState([]);

    const handleChange = async (e) => {
        const newPlaylistName = e.target.value;
        setPlaylistName(newPlaylistName);

        if (playlistId) {
            try {
                const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        "name": newPlaylistName,
                        "description": "Updated playlist description via Jammming App",
                        "public": false
                    })
                })

                if (response.ok) {
                    console.log("Playlist's details updated successfully");
                } else {
                    const errorData = await response.json();
                    console.error("Failed to update playlist's details ", response.status, response.statusText, errorData);
                }
                
            } catch (error) {
                console.log('handleChange failed:', error);
            }
        }
    };

    const removeFromPlaylist = async (index, playlist_id, uri) => {
        if (!playlist_id) {
            setPlaylist(playlist.filter((_, i) => i !== index));
        }

        if (playlist_id) {
            try {
                const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        tracks: [{ uri: uri }]
                    })
                })

                if (response.ok) {
                    setPlaylist(playlist.filter((_, i) => i !== index));
                    console.log('Song correctly removed from playlist.');
                } else {
                    const errorData = await response.json();
                    console.log('Failed to remove song from playlist:', response.status, response.statusText, errorData);
                    alert('Failed to remove song from playlist, please try again.');
                }

            } catch (error) {
                console.log('removeFromPlaylist failed:', error);
            }
        }
    };

    const addPlaylistContent = async (playlist_id) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    uris: playlist.map(song => song.uri),
                    position: 0
                })
            })

            if (response.ok) {
                const data = await response.json();
                console.log("Playlist content added", data);
            } else {
                const errorData = await response.json();
                console.error("Failed to add playlist content", response.status, response.statusText, errorData);
            }

        } catch (error) {
            console.log('addToPlaylist failed:', error);
        }
    };

    const createPlaylist = async () => {
        if (playlistId) {
            const confirmation = window.confirm("This playlist already exist, if you want to save changes, please use the 'save' button otherwise confirm to continue and create a new playlist from that one. ");
            if (!confirmation) {
                return;
            }
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    name: playlistName,
                    description: 'new playlist from Jammming App',
                    public: false
                })
            })

            if (response.ok) {
                const data = await response.json();
                console.log('Playlist Created:', data);
                await addPlaylistContent(data.id);
                setPlaylistId(data.id);
                setPlaylistName(playlistName);
            } else {
                const errorData = await response.json();
                console.error('Failed to create playlist:', response.status, response.statusText, errorData);
                alert('Failed to create playlist, please try again.');
            }

        } catch (error) {
            console.log('createPlaylist failed:', error);
        }
    };

    const importPlaylist = async () => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Playlist Imported:', data);
                setSongs([]);
                setUserPlaylists(data.items.map(item => ({
                    id: item.id,
                    name: item.name
                })));
                setResultHeader('Playlists');
            } else {
                const errorData = await response.json();
                console.error('Failed to import playlists:', response.status, response.statusText, errorData);
                alert('failed to import playlists, please try again.');
            }

        } catch (error) {
            console.log('importPlaylist failed:', error);
        }
    };

    const clearPlaylist = () => {
        const confirmation = window.confirm("Warning!! This action will clear the playlist window, confirm to proceed.");
        if (!confirmation) {
            return;
        } else {
            setPlaylistId('');
            setPlaylistName('');
            setPlaylist([]);
        }
    };

    const playTrack = (position) => {
        setToPlay({ isActive: true, list: playlist, position: position });
    };

    const showList = () => {
        if (showPlaylist) {
            setShowPlaylist(false);
        } else {
            setShowPlaylist(true);
            setShowResultsList(false);
        }
    };

    return (
        <div className="playlist-container">
            <div className="header-playlist">
                {!showPlaylist ? (
                    <FaBars className="header-burger" size={24} onClick={showList} />
                ) : (
                    screenSize < 1024 ? (
                        <FaPlayCircle className="header-burger" onClick={showList} />
                    ) : (
                        <FaPlayCircle className="header-burger" size={24} />
                    )
                )}
                <div className="hd-1">
                    <PlaylistButton className="playlist-btn" label='IMPORT' onClick={importPlaylist} />
                </div>
                <div className="hd-2">
                    <input type="text" placeholder="Playlist's name" onChange={handleChange} value={playlistName || ''} required />
                </div>
                <div className="hd-3">
                    <PlaylistButton className="playlist-btn" label='CREATE' onClick={createPlaylist} />
                    <PlaylistButton className="playlist-btn" label='CLEAR' onClick={clearPlaylist} />
                </div>
            </div>
            {showPlaylist ? (
                <div className="playlist">
                    <div className="songs">
                        {playlist.map((song, index) => (
                            <div className='track-list' key={song.id}>
                                <div className='info-track'>
                                    <p><strong>Artist:</strong> {song.artist}</p>
                                    <p><strong>Song:</strong> {song.name}</p>
                                    <p><strong>Album:</strong> {song.album}</p>
                                    <div className="btn">
                                        <PlaylistButton onClick={() => removeFromPlaylist(index, playlistId, song.uri)} label='REMOVE' />
                                        <FaPlay className="icon-list" onClick={() => playTrack(index)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <></>
            )}
        </div>
    )
}

export default Playlist;