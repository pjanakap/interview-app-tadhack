import React, { useState, useEffect } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { Button, IconButton, makeStyles, TextField, Tooltip } from '@material-ui/core';
import { ClearAll } from '@material-ui/icons';

const useStyles = makeStyles(() => ({
  noBorder: {
    border: 'none',
  },
}));

export default function CodingDrawerComponent({ codingDrawer, setCodingDrawer }) {
  const classes = useStyles();
  const [input, setinput] = useState(localStorage.getItem('input') || ``);
  const [language_id, setlanguage_id] = useState(localStorage.getItem('language_Id') || 2);
  const [user_input] = useState(``);
  const [languageList, setLanguageList] = useState([]);

  const inputData = (event) => {
    event.preventDefault();
    setinput(event.target.value);
    localStorage.setItem('input', event.target.value);
  };

  const language = (event) => {
    event.preventDefault();
    setlanguage_id(event.target.value);
    localStorage.setItem('language_Id', event.target.value);
  };

  const submit = async (e) => {
    e.preventDefault();
    let outputText = document.getElementById('output');
    outputText.innerHTML = '';
    outputText.innerHTML += 'Creating Submission ...\n';

    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
      method: 'POST',
      // params: { base64_encoded: 'true', fields: '*' },
      headers: {
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'x-rapidapi-key': '1d88478936msha1c754506917a28p1e04f4jsnca126820265d', //api key
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        source_code: input,
        stdin: user_input,
        language_id: language_id,
      }),
    });
    outputText.innerHTML += 'Submission Created ...\n';
    const jsonResponse = await response.json();
    let jsonGetSolution = {
      status: { description: 'Queue' },
      stderr: null,
      compile_output: null,
      stdout: null,
      memory: null,
      time: null,
    };

    while (
      jsonGetSolution.status.description !== 'Accepted' &&
      jsonGetSolution.stderr == null &&
      jsonGetSolution.compile_output == null
    ) {
      outputText.innerHTML = `Creating Submission ... \nSubmission Created ...\nChecking Submission Status\nstatus : ${jsonGetSolution.status.description}`;
      if (jsonResponse.token) {
        let url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;

        const getSolution = await fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'x-rapidapi-key': '1d88478936msha1c754506917a28p1e04f4jsnca126820265d', //api key
            'content-type': 'application/json',
          },
        });

        jsonGetSolution = await getSolution.json();
      }
    }
    if (jsonGetSolution.stdout) {
      const output = atob(jsonGetSolution.stdout);
      outputText.innerHTML = '';
      outputText.innerHTML += `Results :\n${output}\nExecution Time : ${jsonGetSolution.time} Secs\nMemory used : ${jsonGetSolution.memory} bytes`;
    } else if (jsonGetSolution.stderr) {
      const error = atob(jsonGetSolution.stderr);
      outputText.innerHTML = '';
      outputText.innerHTML += `\n Error :${error}`;
    } else {
      const compilation_error = atob(jsonGetSolution.compile_output);
      outputText.innerHTML = '';
      outputText.innerHTML += `\n Error :${compilation_error}`;
    }
  };

  useEffect(() => {
    (async () => {
      const languageData = await fetch('https://judge0-ce.p.rapidapi.com/languages', {
        method: 'GET',
        // params: { base64_encoded: 'true', fields: '*' },
        headers: {
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          'x-rapidapi-key': '1d88478936msha1c754506917a28p1e04f4jsnca126820265d',
        },
      });
      const jsonResponse1 = await languageData.json();
      setLanguageList(jsonResponse1);
    })();
  }, []);

  const Reset = () => {
    setinput('');
  };

  const list = () => (
    <div
      style={{
        height: '90%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '50px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          // borderBottom: '2px solid black',
          background: 'white',
        }}
      >
        <div style={{}}>
          <TextField
            style={{ margin: '7px', width: '180px', marginLeft: '15px' }}
            variant="outlined"
            size="small"
            select
            value={language_id}
            onChange={(event) => language(event)}
            SelectProps={{
              native: true,
            }}
          >
            {languageList.map(({ id, name }, i) => (
              <option key={i} value={id}>
                {name}
              </option>
            ))}
          </TextField>
          <Tooltip arrow title="Reset">
            <IconButton onClick={() => Reset()}>
              <ClearAll />
            </IconButton>
          </Tooltip>
        </div>
        <div style={{}}>
          <Button
            onClick={(e) => submit(e)}
            color="inherit"
            style={{ borderRadius: '0px', margin: '7px' }}
            variant="outlined"
            size="small"
          >
            Run
          </Button>
          <Button
            onClick={() => setCodingDrawer(false)}
            color="inherit"
            style={{ borderRadius: '0px', margin: '7px' }}
            variant="outlined"
            size="small"
          >
            Close
          </Button>
        </div>
      </div>
      <div style={{ height: '60vh', width: '98%' }}>
        <TextField
          onChange={(event) => inputData(event)}
          className=" source"
          value={input}
          style={{ width: '100%', background: 'lightgrey', overflow: 'auto', marginTop: '2px' }}
          id="outlined-multiline-static"
          multiline
          rows={18}
          variant="outlined"
          InputProps={{
            classes: { notchedOutline: classes.noBorder },
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        {/* <div
          style={{
            width: '20vw',
            maxHeight: '25vh',
            textAlign: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
          }}
        >
          <textarea
            id="input"
            onChange={(event) => userInput(event)}
            style={{ minWidth: '55%', height: '25vh', marginTop: '2vh' }}
            placeholder="custom input"
          />
        </div> */}
        <div
          style={{
            width: '100vw',
            maxHeight: '25vh',
            textAlign: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
          }}
        >
          <textarea id="output" style={{ minWidth: '95%', height: '25vh', marginTop: '2vh' }} placeholder="Output" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Drawer
        PaperProps={{
          style: {
            width: '60%',
          },
        }}
        anchor="right"
        open={codingDrawer}
      >
        {list()}
      </Drawer>
    </div>
  );
}
