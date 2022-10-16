//eslint-disable
import React, { useEffect, useRef, useState } from 'react';
import { CandiateDetails } from './Config';
import RoutesComponent from './Routes';

const App = () => {
  const engageClient = useRef(null);
  const engageRTCUtil = useRef(null);
  const ringingStatus = useRef(null);
  const transffered = useRef(null);

  const [remoteStream, _setRemoteStream] = useState(null);
  const [localStream, _setLocalStream] = useState(null);
  const localStreamRefApp = useRef(localStream);
  const remoteStreamRefApp = useRef(remoteStream);
  const [connection, setConnection] = useState({
    connection: null,
    status: 'Disconnected',
    identity: '',
    username: '',
  });
  const [session, setSession] = useState({
    session: null,
    remoteUser: 'XYZ',
    remoteUserName: 'ABC',
    incoming: false,
    ringing: false,
    constraints: { audio: true, video: true },
    upgrade: true,
  });
  const [readyEvent, setReadyEvent] = useState(false);
  const [setRemoteURI] = useState('');

  useEffect(() => {
    connect(CandiateDetails.CandiateName, CandiateDetails.Number);
  }, []);

  const setRemoteStream = (data) => {
    remoteStreamRefApp.current = data;
    _setRemoteStream(data);
  };

  const logoutClient = () => {
    /*
     *  Clean up the connection on disconnect.
     */
    if (engageClient.current !== null) {
      if (engageClient.current.isConnected()) {
        engageClient.current.disconnect();
        engageClient.current = null;
        setConnection({ ...connection, status: 'Disconnected' });
      }
    }
    sessionStorage.removeItem('upgrade');
    sessionStorage.removeItem('joinmuted');
  };

  const setLocalStreamHandler = (stream) => {
    const localStreamRef = document.getElementById('localStream');
    if (localStreamRef) {
      localStreamRef.srcObject = null;
      localStreamRef.srcObject = stream;
    } else {
      setLocalStream(stream);
    }
  };

  const setLocalStream = (data) => {
    localStreamRefApp.current = data;
    _setLocalStream(data);
  };

  const onSession = (engageSession) => {
    const constraints = engageSession._defaultCallParams.mediaConstraints;
    // audioPlayer.play("ringing");
    // ringingStatus.current = setInterval(() => {
    //   audioPlayer.play("ringing");
    // }, 3000);

    if (engageSession.getOriginator() === 'local') {
      console.log('Session: Outgoing Call in Progress');
      const constraints = engageSession.getCallParams()['mediaConstraints'];
      // Incoming Call
      setSession({
        ...session,
        session: engageSession,
        ringing: true,
        incoming: false,
        remoteUser: engageSession.getRemoteId()._uri._user,
        remoteUserName: engageSession.getRemoteId()._display_name,
        constraints: constraints,
      });
      // engageSession.addEventHandler('ringing', () => {
      //   // audioPlayer.play('ringing');
      //   const ringing = setInterval(() => {
      //     if (engageSession?._callState === null || engageSession?._callState === 'connected') {
      //       clearInterval(ringing);
      //       ringingStatus.current == null;
      //       return;
      //     }
      //     // audioPlayer.play('ringing');
      //   }, 3000);
      //   ringingStatus.current = ringing;

      //   console.log('Call: Ringing');
      // });
      return;
    }

    /*
     *  If an incoming sesson is already active, then if another use is trying the same
     *  user, then that user would be returned with a response as 486
     */

    if (session.session !== null) {
      engageSession.rejectCall({
        status_code: 486,
        reason_phrase: 'Busy Here',
      });
      return;
    }

    // This is an incoming call and we require to listen to the various events
    setSession({
      ...session,
      session: engageSession,
      incoming: true,
      ringing: true,
      remoteUser: engageSession.getRemoteId()._uri._user,
      remoteUserName: engageSession.getRemoteId()._display_name,
      constraints: constraints,
    });
    engageSession.addEventHandler('ringing', () => {
      // audioPlayer.play('ringing');
      const ringing = setInterval(() => {
        if (engageSession?._callState === null || engageSession?._callState === 'connected') {
          clearInterval(ringing);
          // ringingStatus.current == null;
          return;
        }
        // audioPlayer.play('ringing');
      }, 3000);
      // ringingStatus.current = ringing;

      console.log('Call: Ringing');
    });
  };

  const connect = (userName, userId) => {
    console.log(userName, userId);
    let engageDigital;
    try {
      engageDigital = new window.EngageDigital.EngageDigitalClient(
        // localStorage.getItem("identity"),
        userId,
        window.config.domainName, // AWS Setup Required
        {
          log: {
            blob: { enable: true, emptyAfterRetrieval: true },
            console: { enable: true },
          },
          needRegistration: true,
          // userName: localStorage.getItem("username"),
          userName: userName,
          ...window.config.connectionOptionsOverride,
        }
      );
    } catch (error) {
      console.log('Error:', error);
    }
    engageRTCUtil.current = engageDigital.getEngageDigitalRTCUtils();
    setConnection({ ...connection, identity: userId, username: userName });
    // Store the connection object for reference.
    engageClient.current = engageDigital;

    //failed event handling
    engageDigital.addEventHandler('failed', (error) => {
      console.log('Failed Event Called');
      console.error('failed_event', error);
    });

    engageDigital.addEventHandler('ready', () => {
      setReadyEvent(true);
      /*
       *   The Ready event is called as the SDK is initiatiazed successfully and is ready
       *   for operation. Ideally the first step taken is to call connect and register the
       *   the events
       */
      engageDigital.addEventHandler('errorinfo', (error) => {
        console.log('engageDegital - errorInfo:', error);
      });

      engageDigital.addEventHandler('connecting', () => {
        /*
         *  Event is being called when connectivity is being established for the first time.
         */
        setConnection({ ...connection, status: 'Connecting' });

        console.log('Connection: Connecting');
      });

      engageDigital.addEventHandler('connected', () => {
        /*
         *  Event is being called when connectivity is established for the first time.
         */
        setConnection({ ...connection, status: 'Connected' });

        console.log('Connection: Connected');
      });

      engageDigital.addEventHandler('disconnected', () => {
        /*
         *  Event is being called when connectivity is lost.
         */
        setConnection({ ...connection, status: 'Disconnected' });

        console.log('Connection: Disconnected');
      });

      engageDigital.addEventHandler('reconnecting', () => {
        /*
         *  Event is being called when connectivity is lost and the SDK tries to reconnect
         *  Note: The State of the connection will be connecting as we do not
         *  differentiate reconnecting/connecting in UI
         */
        setConnection({ ...connection, status: 'Connecting' });

        console.log('Connection: Re-connecting');
      });

      engageDigital.addEventHandler('reconnected', () => {
        /*
         *  Event is being called when connectivity is establish after an intermitent disconnection.
         *  Note: The state of the connection will be connected as we do not
         *  differentiate connected/reconnected
         */
        setConnection({ ...connection, status: 'Connected' });

        console.log('Connection: Re-connected');
      });

      engageDigital.addEventHandler('newRTCSession', onSession);

      engageDigital.connect();
    });
  };

  const makeCall = ({ audio, video, remoteURI }) => {
    console.log('Call: Call Make Action Triggered');

    if (remoteURI === '') {
      const calls = localStorage.getItem('history');
      if (calls) {
        const items = JSON.parse(calls);
        const reDialData = Object.values(items.Calllogs)[Object.keys(items.Calllogs).length - 1];
        remoteURI = reDialData[reDialData.length - 1]['uri'];
        console.log(`Redialling ${remoteURI}`);
        setRemoteURI(remoteURI);
      }
    }
    // This is an incoming call and we require to list
    if (engageClient.current !== null) {
      try {
        console.log(`Call: Making a ${video ? 'Video' : 'Audio'} Call ${remoteURI}`);

        engageClient.current.makeCall(remoteURI, {
          mediaConstraints: {
            audio,
            video,
          },
          rtcOfferConstraints: {
            offerToReceiveAudio: audio ? 1 : 0,
            offerToReceiveVideo: video ? 1 : 0,
          },
          joinWithVideoMuted: true,
        });
      } catch (e) {
        console.log('Call: Making Call went into Exception', e.errorMessage);
      }
    }
  };

  const endCall = () => {
    /*
     * Disconnect an ongoing or initiated call
     */
    console.log('Call: End Action Triggered');

    if (session.session) {
      if (session.incoming & session.ringing) {
        // When an incoming call is observed and the user wants to terminate
        console.log('Call: Rejected Initiated');
        session.session.rejectCall();
      } else {
        // When an call is ongoing either incoming or outgoing or outgoing call being made
        console.log('Call: DisconnectCall Initiated');
        session.session.disconnectCall();
      }
    }
    logoutClient();
  };

  useEffect(() => {
    if (session.session !== null) {
      const ongoingSession = session.session;
      /**
       * To Handle all the exception
       */

      ongoingSession.addEventHandler('errorinfo', (error) => {
        console.log('Session-errorInfo:', error);
      });

      ongoingSession.addEventHandler('connecting', () => {
        ringingStatus.current = 'connecting';
        console.log('Call: Connecting');
      });

      ongoingSession.addEventHandler('calltransferinitiated', ({ to }) => {
        const callTransfer = document.getElementById('message');
        if (callTransfer) {
          callTransfer.innerHTML = `Transferring Call to ${to}`;
          transffered.current = to;
        }
      });

      ongoingSession.addEventHandler('calltransfersucceeded', () => {
        const callTransfer = document.getElementById('message');
        if (callTransfer) {
          callTransfer.innerHTML = transffered.current;
          transffered.current = null;
        }
      });

      ongoingSession.addEventHandler('failed', (e) => {
        if (ringingStatus.current) {
          clearInterval(ringingStatus.current);
          ringingStatus.current = null;
        }

        console.log('Call: Failed', e);
        setSession({
          ...session,
          session: null,
          incoming: false,
          ringing: false,
        });
        sessionStorage.removeItem('videoFlag');
      });

      ongoingSession.addEventHandler('disconnected', () => {
        if (ringingStatus.current) {
          clearInterval(ringingStatus.current);
          ringingStatus.current = null;
        }

        console.log('Call: Disconnected');
        setLocalStream(null);
        setRemoteStream(null);
        setSession({
          ...session,
          session: null,
          incoming: false,
          ringing: false,
        });
        sessionStorage.removeItem('videoFlag');
      });

      ongoingSession.addEventHandler('peerdisconnected', () => {
        if (ringingStatus.current) {
          clearInterval(ringingStatus.current);
          ringingStatus.current = null;
        }

        console.log('Call: Peer Disconnected');
        setLocalStream(null);
        setRemoteStream(null);
        setSession({
          ...session,
          session: null,
          incoming: false,
          ringing: false,
        });
        sessionStorage.removeItem('videoFlag');
      });

      ongoingSession.addEventHandler('connected', () => {
        if (ringingStatus.current) {
          clearInterval(ringingStatus.current);
          ringingStatus.current = null;
        }

        console.log('Call: Connected');
        setSession({
          ...session,
          ringing: false,
        });
      });

      ongoingSession.addEventHandler('remotestream', ({ stream }) => {
        const remoteStreamRef = document.getElementById('remoteStream');
        if (remoteStreamRef) {
          if (remoteStreamRef.srcObject !== null) {
            if (stream.getVideoTracks().length > 0) {
              stream.getVideoTracks()[0].enabled = false;
            }
            remoteStreamRef.onloadedmetadata = function () {
              const tracks = stream.getVideoTracks();

              for (let i = 0; i < tracks.length; ++i) {
                tracks[i].enabled = true;
              }
            };

            remoteStreamRef.srcObject = null;
            remoteStreamRef.srcObject = stream;
          } else {
            setRemoteStream(stream);
          }
        } else {
          setRemoteStream(stream);
        }
      });

      ongoingSession.addEventHandler('localstream', ({ stream }) => {
        if (remoteStreamRefApp.current) {
          setLocalStreamHandler(stream);
        } else {
          setLocalStream(stream);
        }
      });

      ongoingSession.addEventHandler('upgradevideoaccessdenied', (event) => {
        /*
         *  When permission is not given, either remote or local party, then the event
         *  will be triggered
         */
      });
    }
    // eslint-disable-next-line
  }, [session.session]);

  return (
    <div>
      {/* {pathname === '/' ? <MainPage /> : null}
      {pathname !== '/' ? <RoutesComponent /> : null} */}
      <RoutesComponent
        connection={connection}
        connect={connect}
        makeCall={makeCall}
        endCall={endCall}
        localStream={localStream}
        remoteStream={remoteStream}
        session={session}
        engageClient={engageClient}
        readyEvent={readyEvent}
      />
    </div>
  );
};

export default App;
