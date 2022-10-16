import { IconButton, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import AppbarComponent from '../Components/Appbar';
import { categories } from '../Utils';
import { CallEnd, CancelPresentation, Mic, MicOff, ScreenShare, Videocam, VideocamOff } from '@material-ui/icons';
import CodingDrawerComponent from './CodindDrawer';
import { useHistory } from 'react-router-dom';

const CallPage = ({ session, endCall, remoteStream, localStream, engageClient }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('WhiteBoard');
  const [codingDrawer, setCodingDrawer] = React.useState(false);
  const remoteStreamRef = useRef(null);
  const localStreamRef = useRef(null);
  const [setIsAudioCall] = useState(true);
  const [audioStatus, setAudioStatus] = useState(true);
  const [videoStatus, setVideoStatus] = useState(false);
  const [shareOption, setShare] = React.useState(false);
  const history = useHistory();

  React.useEffect(() => {
    if (selectedCategory === 'Coding') {
      setCodingDrawer(true);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (remoteStreamRef && remoteStreamRef.current) {
      if (remoteStream) {
        if (remoteStream.getVideoTracks().length > 0) {
          remoteStream.getVideoTracks()[0].enabled = false;
        }
        remoteStreamRef.current.onloadedmetadata = function () {
          const tracks = remoteStream.getVideoTracks();
          for (let i = 0; i < tracks.length; ++i) {
            tracks[i].enabled = true;
          }
        };
      }
      remoteStreamRef.current.srcObject = null;
      remoteStreamRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localStreamRef && localStreamRef.current) {
      localStreamRef.current.srcObject = null;
      localStreamRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const toggleVideo = () => {
    /*
     *   Local Mute the Video, the remote user will be receiving a blank screen
     */
    const { session: instance } = session;
    if (instance && instance.getCallState() === 'connected') {
      if (!instance.hasRemoteVideo()) {
        instance.addVideo();
      } else {
        try {
          instance.toggleVideo();
        } catch (e) {
          console.log('Toggle Video went into Exception', e.errorMessage);
        }
      }
    }
  };

  const toggleAudio = () => {
    const { session: instance } = session;
    if (instance && instance.getCallState() === 'connected') {
      try {
        instance.toggleAudio();
      } catch (e) {
        console.log('Toggle Audio went into Exception', e.errorMessage);
      }
    }
  };

  useEffect(() => {
    if (session.session === null) {
      history.push('/');
    }
    // eslint-disable-next-line
  }, [session]);

  const mutedEvent = ({ audio, video }) => {
    if (audio) {
      setAudioStatus(false);
    }
    if (video) {
      setVideoStatus(false);
    }
  };

  const unMutedEvent = ({ audio, video }) => {
    if (audio) {
      setAudioStatus(true);
    }
    if (video) {
      setVideoStatus(true);
    }
  };

  const localVideoAdded = ({ stream }) => {
    const localStreamRef = document.getElementById('localStream');
    if (localStreamRef) {
      localStreamRef.srcObject = null;
      localStreamRef.srcObject = stream;
    }
    //    setVideoStatus(true);
    setIsAudioCall(false);
  };

  const remoteVideoAdded = ({ stream }) => {
    console.log('*** Stream', stream);
    console.log('*** Stream:videoTrack', stream.getVideoTracks);
    const remoteStreamRef = document.getElementById('remoteStream');
    if (remoteStreamRef) {
      stream.getVideoTracks()[0].enabled = false;
      remoteStreamRef.onloadedmetadata = function () {
        const tracks = stream.getVideoTracks();

        for (let i = 0; i < tracks.length; ++i) {
          tracks[i].enabled = true;
        }
      };
      remoteStreamRef.srcObject = null;
      remoteStreamRef.srcObject = stream;
    }
  };

  const localVideoRemoved = ({ stream }) => {
    const localStreamRef = document.getElementById('localStream');
    if (localStreamRef) {
      localStreamRef.srcObject = null;
      localStreamRef.srcObject = stream;
    }
    setVideoStatus(false);
  };

  const remoteVideoRemoved = ({ stream }) => {
    const remoteStreamRef = document.getElementById('remoteStream');
    if (remoteStreamRef) {
      remoteStreamRef.srcObject = null;
      remoteStreamRef.srcObject = stream;
      setIsAudioCall(true);
    }
  };

  const screensharestarted = () => {
    setShare(true);
  };

  const screensharestopped = ({ stream }) => {
    setShare(false);
  };
  useEffect(() => {
    const { session: instance } = session;
    if (instance) {
      instance.addEventHandler('muted', mutedEvent);
      instance.addEventHandler('unmuted', unMutedEvent);
      instance.addEventHandler('localvideoadded', localVideoAdded);
      instance.addEventHandler('remotevideoadded', remoteVideoAdded);
      instance.addEventHandler('localvideoremoved', localVideoRemoved);
      instance.addEventHandler('remotevideoremoved', remoteVideoRemoved);
      instance.addEventHandler('screensharestarted', screensharestarted);
      instance.addEventHandler('screensharestopped', screensharestopped);
    }
    return () => {
      try {
        if (instance) {
          instance.removeEventHandler('muted', mutedEvent);
          instance.removeEventHandler('unmuted', unMutedEvent);
          instance.removeEventHandler('localvideoadded', localVideoAdded);
          instance.removeEventHandler('remotevideoadded', remoteVideoAdded);
          instance.removeEventHandler('localvideoremoved', localVideoRemoved);
          instance.removeEventHandler('remotevideoremoved', remoteVideoRemoved);
          instance.removeEventHandler('screensharestarted', screensharestarted);
          instance.removeEventHandler('screensharestopped', screensharestopped);
          instance.removeEventHandler('iceconnectionstatechanged', '');
        }
      } catch (e) {}
    };
    // eslint-disable-next-line
  }, []);

  const screenShare = () => {
    const { session: instance } = session;
    if (instance && instance.getCallState() === 'connected') {
      instance.screenShare();
    }
  };

  const stopShare = () => {
    const { session: instance } = session;
    if (instance && instance.getCallState() === 'connected') {
      instance.stopScreenShare();
    }
  };
  
  return (
    <div style={{ justifyContent: 'center', height: '100vh' }}>
      <AppbarComponent />
      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
        <div style={{ width: '12%', overflowY: 'auto', height: '90vh' }}>
          {categories.map((category) => {
            return (
              <List dense key={category.name}>
                <ListItem button onClick={() => setSelectedCategory(category.name)}>
                  <ListItemIcon>{category.icon}</ListItemIcon>
                  <ListItemText primary={category.name} />
                </ListItem>
              </List>
            );
          })}
        </div>
        <div
          style={{
            width: '88%',
            background: 'whitesmoke',
            height: '90vh',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div>
            <video
              ref={remoteStreamRef}
              autoPlay
              id="remoteStream"
              style={{
                objectFit:"fill",
                minHeight: '99.2%',
                minWidth: '99%',
                maxHeight: '99.2vh',
                maxWidth: '99%',
                justifyContent: 'center',
                marginTop: '1vh',
              }}
            />
          </div>

          <div
            style={{
              width: '30%',
              position: 'absolute',
              bottom: 10,
              display: 'flex',
              justifyContent: 'center',
              background: 'lightgrey',
            }}
          >
            {videoStatus ? (
              <IconButton onClick={() => toggleVideo()}>
                <Videocam style={{ fontSize: '34px' }} />
              </IconButton>
            ) : (
              <IconButton onClick={() => toggleVideo()}>
                <VideocamOff style={{ fontSize: '34px' }} />
              </IconButton>
            )}
            {audioStatus ? (
              <IconButton onClick={() => toggleAudio()}>
                <Mic style={{ fontSize: '34px' }} />
              </IconButton>
            ) : (
              <IconButton onClick={() => toggleAudio()}>
                <MicOff style={{ fontSize: '34px' }} />
              </IconButton>
            )}
            {shareOption === false ? (
              <IconButton onClick={() => screenShare()}>
                <ScreenShare style={{ fontSize: '34px' }} />
              </IconButton>
            ) : (
              <IconButton onClick={() => stopShare()}>
                <CancelPresentation style={{ fontSize: '34px' }} />
              </IconButton>
            )}

            <IconButton color="secondary" onClick={endCall}>
              <CallEnd style={{ fontSize: '34px' }} />
            </IconButton>
          </div>
        </div>
      </div>

      {codingDrawer && <CodingDrawerComponent codingDrawer={codingDrawer} setCodingDrawer={setCodingDrawer} />}
    </div>
  );
};

export default CallPage;
