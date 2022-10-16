
import React, { useEffect, useState } from 'react';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { CandiateDetails } from '../Config';

export default function TimerComponent({ state, setState }) {
  const [countdownDate] = useState(new Date(CandiateDetails.timer).getTime());
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('xs'));

  /* eslint-disable */
  useEffect(() => {
    setInterval(() => setNewTime(), 1000);
  }, []);

  const setNewTime = () => {
    if (countdownDate) {
      const currentTime = new Date().getTime();
      const distanceToDate = countdownDate - currentTime;
      let days = Math.floor(distanceToDate / (1000 * 60 * 60 * 24));
      let hours = Math.floor((distanceToDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distanceToDate % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distanceToDate % (1000 * 60)) / 1000);
      const numbersToAddZeroTo = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      /* eslint-disable */
      days = days;
      if (days < 0 || hours < 0 || minutes < 0 || seconds < 0) {
        setState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        if (numbersToAddZeroTo.includes(hours)) {
          hours = hours;
        } else if (numbersToAddZeroTo.includes(minutes)) {
          minutes = minutes;
        } else if (numbersToAddZeroTo.includes(seconds)) {
          seconds = seconds;
        }
        setState({ days: days, hours: hours, minutes, seconds });
      }
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "table-column", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              // marginLeft: "35px",
            }}
          >
            <div style={{ marginLeft: "1.4rem" }}></div>
            <div style={{ marginRight: "2.5rem", fontSize: "23px" }}>
              {state.days || "00"}
            </div>
            <div style={{ marginRight: "2.5rem", fontSize: "23px" }}>
              {state.hours || "00"}
            </div>
            <div style={{ marginRight: "2.5rem", fontSize: "23px" }}>
              {state.minutes || "00"}
            </div>
            <div
              style={{
                marginRight: "10px",
                marginLeft: "2rem",
                fontSize: "23px",
              }}
            >
              {state.seconds || "00"}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginLeft: matches === true ? "1rem" : "2rem",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                marginRight: "5px",
                // background: "#E0F1FA",
                padding: "0px 10px 10px 10px",
                fontWeight: "bold",
              }}
            >
              Days
            </div>
            <div
              style={{
                marginRight: "5px",
                // background: "#E0F1FA",
                padding: "0px 10px 10px 10px",
                fontWeight: "bold",
              }}
            >
              Hours
            </div>
            <div
              style={{
                marginRight: "5px",
                // background: "#E0F1FA",
                padding: "0px 10px 10px 10px",
                fontWeight: "bold",
              }}
            >
              Minutes
            </div>
            <div
              style={{
                marginRight: "5px",
                // background: "#E0F1FA",
                padding: "0px 10px 10px 10px",
                fontWeight: "bold",
              }}
            >
              Seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
