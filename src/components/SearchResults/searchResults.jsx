import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaBars, FaPlayCircle } from 'react-icons/fa';
import './searchResults.css';
import PlaylistButton from '../Buttons/playlistButon.jsx';

function SearchResults({ songs, playlist, setPlaylist, resultHeader, userPlaylists, accessToken, playlistName, setPlaylistName, playlistId, setPlaylistId, setToPlay, showPlaylist, setShowPlaylist, showResultsList, setShowResultsList, screenSize }) {

    const addToPlaylist = async (song, playlist_id, uri) => {
        const isInPlaylist = playlist.some(playlistSong => playlistSong.name === song.name && playlistSong.artist === song.artist);

        if (isInPlaylist) {
            const confirmation = window.confirm("This song is already part of that playlist, would you like to add it one more time?");
            if (!confirmation) {
                return;
            }
            setPlaylist(prevPlaylist => [...prevPlaylist, song]);
        }

        if (playlist_id) {
            try {
                const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        uris: [uri]
                    })
                })

                if (response.ok) {
                    setPlaylist(prevPlaylist => [...prevPlaylist, song]);
                    console.log('Song correctly added to playlist');
                } else {
                    const errorData = await response.json();
                    console.log('Failed to add song to playlist:', response.status, response.statusText, errorData);
                    alert('Failed to add song to playlist, please try again.');
                }

            } catch (error) {
                console.log('addToPlaylist failed:', error);
            }
        }
    };

    const editPlaylist = async (playlist_id, playlist_name) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setPlaylistName(playlist_name);
                setPlaylistId(playlist_id);
                setPlaylist(data.items.map(item => ({
                    id: item.track.id,
                    name: item.track.name,
                    uri: item.track.uri,
                    artist: item.track.artists[0]?.name,
                    album: item.track.album.name
                })));
                console.log(playlistName);
                console.log(playlist);
            } else {
                const errorData = await response.json();
                console.log('Failed to Access Playlist details:', response.status, response.statusText, errorData);
                alert("Failed to access playlist's details, please try again.");
            }

        } catch (error) {
            console.log('editPlaylist failed:', error);
        }
    };

    const playTrack = (position) => {
        setToPlay({ isActive: true, list: songs, position: position });
    };

    const showList = () => {
        if (showResultsList) {
            setShowResultsList(false);
        } else {
            setShowResultsList(true);
            setShowPlaylist(false);
        }
    };

    return (
        <div className='search-results-container'>
            <div className="results-header">
                {!showResultsList ? (
                    <FaBars className="header-burger" size={24} onClick={showList} />
                ) : (
                    screenSize < 1024 ? (
                        <FaPlayCircle className="header-burger" size={24} onClick={showList} />
                    ) : (
                        <FaPlayCircle className="header-burger" size={24} />
                    )
                )}
                <h2>{resultHeader}</h2>
            </div>
            {showResultsList ? (
                <div className='search-results'>
                    <div className='results-list'>
                        {songs.map((song, index) => (
                            <div className='track-list' key={song.id}>
                                <div className='info-track'>
                                    <p><strong>Artist:</strong> {song.artist}</p>
                                    <p><strong>Song:</strong> {song.name}</p>
                                    <p><strong>Album:</strong> {song.album}</p>
                                    <div className='btn'>
                                        <PlaylistButton onClick={() => addToPlaylist(song, playlistId, song.uri)} label='ADD' />
                                        <FaPlay className='icon-list' onClick={() => playTrack(index)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {userPlaylists.map((playlist) => (
                            <div className='playlist-list' key={playlist.id}>
                                <div className='playlist-info' >
                                    <p>{playlist.name}</p>
                                    <PlaylistButton onClick={() => editPlaylist(playlist.id, playlist.name)} label='EDIT' />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
}

export default SearchResults;