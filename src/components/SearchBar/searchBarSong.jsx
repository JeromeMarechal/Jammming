import React from 'react';
import { useState, useEffect } from 'react';
import './searchBarSong.css';

function SearchBarSong({ songs, setSongs, accessToken, setResultHeader, setUserPlaylists }) {
    const [query, setQuery] = useState('');

    const handleChange = (e) => {
        setQuery(e.target.value);
    }

    const submitSearch = async (e) => {
        e.preventDefault();
        setSongs([]);
        setUserPlaylists([]);
        const searchResults = await fetchsongs(query);
        setSongs(searchResults.tracks.items.map(item => ({
            id: item.id,
            name: item.name,
            uri: item.uri,
            artist: item.artists[0].name,
            album: item.album.name
        })));
        setResultHeader('Search Results');
        console.log(songs);
        setQuery('');
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            submitSearch(e);
        }
    }

    const fetchsongs = async (query) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album%2Ctrack%2Cartist`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (response.ok) {
                const results = await response.json();
                console.log('API Response:', results);
                return results;
            } else {
                const errorData = await response.json();
                console.error('Error fetching songs:', response.status, response.statusText, errorData);
                return { tracks: { items: [] } };
            }

        } catch (error) {
            console.log('fetchSongs failed:', error);
        }
    }; 

    return (
        <div className='search-bar'>
            <input
                type="text"
                placeholder='Search for a song, artist ..... '
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                value={query}
            />
            <button className='search-btn' type='submit' onClick={submitSearch}>SEARCH</button>
        </div>
    )
}

export default SearchBarSong;