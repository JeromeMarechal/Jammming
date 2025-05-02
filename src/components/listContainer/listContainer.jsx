import React, { useEffect } from 'react'; 
import { useState } from 'react'; 
import './listContainer.css'; 
import SearchResults from '../SearchResults/searchResults.jsx';
import Playlist from '../playlist/playlist.jsx';

function ListContainer({ songs, setSongs,  playlist, setPlaylist, playlistName, setPlaylistName, userId, accessToken, resultHeader, setResultHeader, userPlaylists, setUserPlaylists, playlistId, setPlaylistId, setToPlay }) { 

    const [screenSize, setScreenSize] = useState(window.innerWidth); 
    const [showPlaylist, setShowPlaylist] = useState(() => {
        if (screenSize >= 1024) {
            return true; 
        } else {
            return false; 
        }
    })
    const [showResultsList, setShowResultsList] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setScreenSize(window.innerWidth); 
        }

        window.addEventListener('resize', handleResize); 

        return () => {
            window.removeEventListener('resize', handleResize); 
        }
    }, []); 

    useEffect(() => {
        if (screenSize >= 1024) {
            setShowPlaylist(true); 
        } else {
            setShowPlaylist(false); 
        }
    }, [screenSize]); 

    return (
        <div className='list-container'>
            <SearchResults 
            songs={songs} 
            playlist={playlist} 
            setPlaylist={setPlaylist} 
            resultHeader={resultHeader}
            userPlaylists={userPlaylists}
            accessToken={accessToken}
            playlistName={playlistName}
            setPlaylistName={setPlaylistName}
            playlistId={playlistId}
            setPlaylistId={setPlaylistId}
            setToPlay={setToPlay}
            showPlaylist={showPlaylist}
            setShowPlaylist={setShowPlaylist}
            showResultsList={showResultsList}
            setShowResultsList={setShowResultsList}
            screenSize={screenSize}
            />

            <Playlist 
            playlist={playlist} 
            setPlaylist={setPlaylist} 
            playlistName={playlistName} 
            setPlaylistName={setPlaylistName} 
            userId={userId} 
            accessToken={accessToken} 
            setResultHeader={setResultHeader}
            userPlaylists={userPlaylists}
            setUserPlaylists={setUserPlaylists}
            setSongs={setSongs}
            playlistId={playlistId}
            setPlaylistId={setPlaylistId}
            setToPlay={setToPlay}
            showPlaylist={showPlaylist}
            setShowPlaylist={setShowPlaylist} 
            showResultsList={showResultsList}
            setShowResultsList={setShowResultsList}
            screenSize={screenSize}
            />
        </div>
    )
}

export default ListContainer; 