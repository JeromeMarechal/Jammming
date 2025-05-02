import React from 'react';
import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';
import './playBar.css'

function PlayBar({ songs, playlist, accessToken, toPlay, setToPlay }) {

    const [isPlaying, setIsPlaying] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [devicesToConnect, setDevicesToConnect] = useState([]);
    const [isDevicesToConnect, setIsDevicesToConnect] = useState(false);
    const [artistName, setArtistName] = useState('');
    const [trackName, setTrackName] = useState('');
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);


    useEffect(() => {
        console.log('Updated devices to connect:', devicesToConnect);
    }, [devicesToConnect]);

    useEffect(() => {
        if (accessToken) {
            const interval = setInterval(() => {
                getCurrentPlayingTrack();
            }, 3500);
            return () => clearInterval(interval);
        }
    }, [accessToken]);

    useEffect(() => {
        console.log(toPlay);
        if (toPlay.isActive == true) {
            loadList(toPlay.list, toPlay.position);
            getCurrentPlayingTrack();
            setIsPlaying(true);
            setToPlay({ isActive: false, list: null, position: 0 });
        }
    }, [toPlay]);

    const loadList = async (list, position) => {
        const tracks = list.slice(position);
        const trackToPlay = tracks.map((track) => track.uri);
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    uris: trackToPlay,
                    position_ms: 0
                })
            })

            if (!response) {
                const errorData = await response.json();
                console.error('Failed to loadList:', response.status, response.statusText, errorData);
            }
            
        } catch (error) {
            console.log('loadeList failed:', error)
        }
    };

    const connectDevice = async () => {
        const confirmation = window.confirm('Please make sure Spotify is is running on the device you would like to connect and have a premium access, confirm to proceed');
        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            console.log('Devices:', data);

            if (!data.devices || data.devices.length === 0) {
                console.error('No active devices found');
                alert('No device has been found, please make sure Spotify is running on your device and you have premimum access.');
                return;
            }

            setDevicesToConnect(data.devices);
            setIsDevicesToConnect(true);

        } catch (error) {
            console.log('connectDevice failed:', error);
        }
    };

    const getCurrentPlayingTrack = async () => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                console.error('Failed to get the current playing track details', response.status, response.statusText, data);
                return;
            }

            console.log('Successfully get the current playing track details', data);
            setArtistName(data.item.artists[0].name);
            setTrackName(data.item.name);
            setDuration(data.item.duration_ms);
            setProgress(data.progress_ms);

        } catch (error) {
            console.log('getCurrentPlayingTrack failed:', error);
        }
    };

    const skiptToPrevious = async () => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/previous`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.status === 204) {
                console.log('Successfully skipped to previous track');
            } else {
                const errorData = await response.json();
                console.error('Failed to skip to previous track', response.status, response.statusText, errorData);
            }

        } catch (error) {
            console.log('skipToPrevious failed:', error);
        }
    };

    const skiptToNext = async () => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/next`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.status === 204) {
                console.log('Successfully skip to next track');
            } else {
                const errorData = await response.json();
                console.error('Failed to skip to next track', response.status, response.statusText, errorData);
            }

        } catch (error) {
            console.log('skipToNext failed:', error);
        }
    };

    const handleDeviceSelection = async (deviceId) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    device_ids: [deviceId],
                    play: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to connect to the device', response.status, response.statusText, errorData);
                alert('Failed to connect to the device. Please try again.');
            }

            setIsConnected(true);
            setToPlay({ isActive: false, list: null, position: 0 });
            setIsPlaying(true);
            getCurrentPlayingTrack();
            console.log('Device connected successfully!');

        } catch (error) {
            console.log('handleDeviceSelection failed:', error);
        }
    };

    const playResume = async () => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })

            setIsPlaying(true);

        } catch (error) {
            console.log('PlayResume failed:', error);
        }
    };

    const pause = async () => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            setIsPlaying(false);

        } catch (error) {
            console.log('Pause failed:', error);
        }
    };

    const handleChangePosition = async (event) => {
        const positionValue = event.target.value;
        const newPosition = Math.floor((positionValue / 100) * duration);
        setProgress(newPosition);
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${newPosition}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                console.error('failed to seek track');
            }

        } catch (error) {
            console.log('handleChangePosition failed:', error);
        }
    };

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };


    return (
        <div className='play-bar'>
            {isConnected ? (
                <>
                    <div className='track-info'>
                        <h4>Track: {trackName ? trackName : ''}</h4>
                        <p>Artist: {artistName ? artistName : ''}</p>
                    </div>
                    <div className='controls'>
                        <FaStepBackward className='icon' onClick={skiptToPrevious} />
                        {isPlaying ? (
                            <FaPause className='icon' onClick={pause} />
                        ) : (
                            <FaPlay className='icon' onClick={playResume} />
                        )}
                        <FaStepForward className='icon' onClick={skiptToNext} />
                    </div>
                    <div className='progress-bar'>
                        <h6>{formatTime(progress)}</h6>
                        <input type="range" min='0' max='100' value={duration ? (progress / duration) * 100 : 0} onChange={handleChangePosition} />
                        <h6>{formatTime(duration)}</h6>
                    </div>
                </>
            ) : (
                <div className='connect-device'>
                    {!isDevicesToConnect ? (
                        <div className='btn'>
                            <button className='connect-btn' onClick={connectDevice} >Connect Device</button>
                        </div>
                    ) : (
                        <div className='devices'>
                            <h3>Please Choose a Device</h3>
                            {devicesToConnect.map((device) => (
                                <li key={device.id} name={device.name}>
                                    <button className='connect-btn' onClick={() => handleDeviceSelection(device.id)} >{device.name}</button>
                                </li>
                            ))}
                            <button className='connect-btn' onClick={() => setIsDevicesToConnect(false)}>X</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PlayBar; 