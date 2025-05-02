import React from 'react';
import { useState, useEffect } from 'react';
import 'normalize.css';
import './App.css';
import Header from './components/Header/header.jsx';
import SearchBarSong from './components/SearchBar/searchBarSong.jsx';
import ListContainer from './components/listContainer/listContainer.jsx';
import PlayBar from './components/playBar/playBar.jsx';

function App() { 
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(''); 
  const [accessToken, setAccessToken] = useState(''); 
  const [resultHeader, setResultHeader] = useState('');
  const [songs, setSongs] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playlistName, setPlaylistName] = useState(''); 
  const [userPlaylists, setUserPlaylists] = useState([]); 
  const [playlistId, setPlaylistId] = useState(''); 
  const [toPlay, setToPlay] = useState({isActive: false, list: null, position: 0}); 

  return (
    <>
      <Header 
      profile={profile} 
      setProfile={setProfile} 
      setUserId={setUserId} 
      accessToken={accessToken}
      setAccessToken={setAccessToken} 
      />

      <SearchBarSong 
      songs={songs} 
      setSongs={setSongs} 
      accessToken={accessToken} 
      setResultHeader={setResultHeader}
      setUserPlaylists={setUserPlaylists}
      />

      <ListContainer 
      songs={songs} 
      setSongs={setSongs}
      playlist={playlist} 
      setPlaylist={setPlaylist} 
      playlistName={playlistName} 
      setPlaylistName={setPlaylistName} 
      userId={userId} 
      accessToken={accessToken} 
      resultHeader={resultHeader}
      setResultHeader={setResultHeader}
      userPlaylists={userPlaylists}
      setUserPlaylists={setUserPlaylists}
      playlistId={playlistId}
      setPlaylistId={setPlaylistId}
      setToPlay={setToPlay}
      />
      <PlayBar 
      accessToken={accessToken}
      songs={songs}
      playlist={playlist}
      toPlay={toPlay}
      setToPlay={setToPlay}
      />
    </>
  )
}

export default App
