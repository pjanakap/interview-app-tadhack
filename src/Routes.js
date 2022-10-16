import React from 'react';
import {  Switch, Route, Redirect } from 'react-router-dom';
import CallPage from './Pages/CallPage';
import { CandiateDetails } from './Config';
import MainPage from './Pages/MainPage';

export default function Main({
  connect,
  makeCall,
  localStream,
  remoteStream,
  engageClient,
  endCall,
  session,
  connection,
}) {

  return (
    <div>
      <Switch>
        <Redirect exact from="/" to={`/candidate/${CandiateDetails.CandiateName}`} />
        <Route
          exact
          path="/candidate/:id"
          component={() => (
            <MainPage
              connect={connect}
              makeCall={makeCall}
              localStream={localStream}
              remoteStream={remoteStream}
              session={session}
              endCall={endCall}
              engageClient={engageClient}
              connection={connection}
            />
          )}
        />
        <Route
          exact
          path="/call"
          component={() => (
            <CallPage
              connect={connect}
              makeCall={makeCall}
              localStream={localStream}
              remoteStream={remoteStream}
              session={session}
              endCall={endCall}
              engageClient={engageClient}
              connection={connection}
            />
          )}
        />
      </Switch>
    </div>
  );
}
