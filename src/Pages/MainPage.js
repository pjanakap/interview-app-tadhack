import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { Paper, Button } from '@material-ui/core';
import { CandiateDetails } from '../Config';
import { Mic, MicOff, Videocam, VideocamOff } from '@material-ui/icons';
import AppbarComponent from '../Components/Appbar';
import TimerComponent from '../Components/TimerComponent';
const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#F1F5F8',
    height: '100vh',
    textAlign: 'center',
  },
  text: {
    fontSize: '22px',
    color: '#314b9f',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '15px',
    letterSpacing: '0px',
    opacity: 1,
    height: '28px',
  },
  join: {
    background: '#3087EC',
    color: 'white',
    '&:hover': {
      backgroundColor: '#3087EC',
      color: 'white',
    },
  },
}));

function MainPage({ makeCall, connection }) {
  const classes = useStyles();
  const [defaultAudioStatus, SetdefaultAudioStatus] = useState(false);
  const [defaultVideoStatus, SetdefaultVideoStatus] = useState(false);
  const [state, setState] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const history = useHistory();

  const join = async () => {
    // await connect(CandiateDetails.CandiateName, CandiateDetails.Number);
    await makeCall({
      audio: true,
      video: true,
      remoteURI: CandiateDetails.to,
    });
    history.push('/call');
  };
  return (
    <div className={classes.root}>
      <AppbarComponent />

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            style={{ fontSize: "22px", fontWeight: "bold" }}
          >{`Hi ${CandiateDetails.CandiateName}`}</Typography>
          <Typography
            style={{ fontSize: "16px" }}
          >{`Your interview is scheduled on
           ${CandiateDetails.CandiateDate} at ${CandiateDetails.CandiateTime}`}</Typography>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Paper
          style={{ width: "31%", justifyContent: "center", marginTop: "2vh" }}
          elevation={3}
        >
          <Typography
            style={{
              marginTop: "3vh",
              fontWeight: 600,
              fontSize: "16px",
              textAlign: "center",
            }}
          >
            {/* Starts in 00:20 */}
            <TimerComponent state={state} setState={setState} />
          </Typography>
          <div
            style={{
              display: "flex",
              marginTop: "1.5rem",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {defaultAudioStatus ? (
                <Mic
                  onClick={() => SetdefaultAudioStatus(false)}
                  style={{
                    color: "blue",
                    marginRight: "4px",
                    height: "22px",
                    width: "22px",
                  }}
                />
              ) : (
                <MicOff
                  onClick={() => SetdefaultAudioStatus(true)}
                  style={{
                    color: "gray",
                    marginRight: "4px",
                    height: "22px",
                    width: "22px",
                  }}
                />
              )}
              <Typography
                style={{
                  color: "#686868",
                  marginRight: "4px",
                }}
              >
                Audio
              </Typography>

              {defaultVideoStatus ? (
                <Videocam
                  onClick={() => SetdefaultVideoStatus(false)}
                  style={{
                    color: "blue",
                    marginRight: "4px",
                    height: "22px",
                    width: "22px",
                  }}
                />
              ) : (
                <VideocamOff
                  onClick={() => SetdefaultVideoStatus(true)}
                  style={{
                    color: "gray",
                    marginRight: "4px",
                    height: "22px",
                    width: "22px",
                  }}
                />
              )}
              <Typography
                style={{
                  color: "#686868",
                  marginRight: "4px",
                }}
              >
                Video
              </Typography>
            </div>
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", margin: "2vh" }}
          >
            <Button
              disabled={
                state.days !== 0 ||
                state.minutes !== 0 ||
                state.hours !== 0 ||
                state.seconds !== 0 ||
                connection.status !== "Connected"
              }
              onClick={join}
              size="small"
              variant="contained"
              className={classes.join}
            >
              Join
            </Button>
          </div>
        </Paper>
      </div>

      <p>
        {connection.status === "Connecting"
          ? "Interview Room is getting prepared. Please wait for a while..."
          : (connection.status === "Connected")
          ? "You are ready to Join"
          : null}
      </p>
    </div>
  );
}

export default MainPage;
