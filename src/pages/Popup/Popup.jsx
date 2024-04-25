import { useEffect, useState } from 'react';
import React from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';
import { getUserData } from '../../api/sra';
const Popup = () => {
  const [localStorageData, setLocalStorageData] = useState(null);

  useEffect(() => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        console.log('tab', tabs);
        const fromPageLocalStore = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id, allFrames: true },
          function() {
            return localStorage['accessToken'];
          },
        });
        // const fromPageLocalStore = await chrome.tabs.executeScript(tabs[0].id, {
        //   code: `localStorage['accessToken']`,
        // });
        console.log('fromPageLocalStore', fromPageLocalStore);
        chrome.tabs.sendMessage(
          tabs[0].id,
          { method: 'getLocalStorage', key: 'accessToken' },
          function (response) {
            console.log('response', response);
            setLocalStorageData(response.data);
          }
        );
      }
    );
    getUserData().then((data) => console.log(data));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <p>SRA++</p>
        </div>
        <div>
          <fieldset>
            <legend>Log by</legend>
            <input
              type="radio"
              id="allocated"
              name="logType"
              value="allocated"
              defaultChecked={true}
            />
            <label htmlFor="allocated">Allocated</label>
            <br />
            <input
              type="radio"
              id="attendance"
              name="logType"
              value="attendance"
            />
            <label htmlFor="attendance">Attendance</label>
          </fieldset>
          {/* <fieldset>
            <legend>Log Range</legend>
            <input type="radio" id="week" name="logRange" value="week" />
            <label htmlFor="week">Week</label>
            <br />
            <input type="radio" id="month" name="logRange" value="month" />
            <label htmlFor="month">Month</label>
          </fieldset> */}
          <input className="log-button" type="button" value="Log" />
        </div>
      </header>
    </div>
  );
};

export default Popup;
