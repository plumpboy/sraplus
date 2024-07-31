import { useEffect, useState } from 'react';
import React from 'react';
import logo from '../../assets/img/icon-34.png';
import './Popup.css';
import {
  getTypeOfWork,
  fetchLogData,
  postWorkLogs,
  getProjects,
} from '../../api/sra';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select'

const Popup = () => {
  const [localStorageData, setLocalStorageData] = useState(null);
  const [isOnSRAPage, setIsOnSRAPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [workType, setWorkType] = useState(null);
  const [projectData, setProjectData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workOption, setWorkOption] = useState([]);
  const customStyles = {
    control: (styles) => ({
      ...styles,
      height: 25,
      minHeight: 25,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    clearIndicator: (base) => ({
      ...base,
      paddingTop: 0,
      paddingBottom: 0,
    }),
  };
  const getCurrentMonth = (date) => {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
  };
  const [month, setMonth] = useState(getCurrentMonth(currentDate));
  let tabId;
  const setLocalStorage = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const fromPageLocalStore = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function() {
        return Object.entries(localStorage);
      },
    });
    const localStorageData = fromPageLocalStore?.[0]?.result?.reduce(
      (acc, [key, value]) => {
        // Check if value is a valid JSON
        try {
          const parsedValue = JSON.parse(value);
          return { ...acc, [key]: parsedValue };
        } catch (e) {
          // If not a valid JSON, return the original value
          return { ...acc, [key]: value };
        }
      },
      {},
    );
    console.log('localStorageData', localStorageData);
    setLocalStorageData(localStorageData);
    setErrorMessage('');
    setSuccessMessage('');
  };

  useEffect(() => {
    if (localStorageData && localStorageData?.accessToken) {
      chrome.tabs.query(
        { active: true, currentWindow: true },
        async function(tabs) {
          const fromPageLocalStore = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function() {
              return Object.entries(localStorage);
            },
          });

          const localStorageData = fromPageLocalStore?.[0]?.result?.reduce(
            (acc, [key, value]) => {
              // Check if value is a valid JSON
              try {
                const parsedValue = JSON.parse(value);
                return { ...acc, [key]: parsedValue };
              } catch (e) {
                // If not a valid JSON, return the original value
                return { ...acc, [key]: value };
              }
            },
            {},
          );
          console.log('localStorageData', localStorageData);
          setLocalStorageData(localStorageData);
        },
      );
    }
  }, []);

  useEffect(() => {
    if (localStorageData?.accessToken) {
      getTypeOfWork(localStorageData.accessToken).then((data) => {
        const workType = data.typeOfWorks
        const workTypeOption = workType.map((typeOfWork) => ({ value: typeOfWork.id, label: typeOfWork.name }))
        // workTypeOption.unshift(value: "", lab)
        setWorkOption(workTypeOption)
        setWorkType('');
      });

      getProjects(localStorageData.accessToken, {
        userId: localStorageData?.userData?.id,
        date: new Date().toISOString().split('T')[0],
      }).then((data) => {
        console.log(data);
        setProjectData(data);
      });
    }
  }, [localStorageData]);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, async function(tab) {
      const isOnSRAPage = tab[0].url.includes('sra.smartosc.com');
      tabId = tab[0].id;
      setIsOnSRAPage(isOnSRAPage);
    });
  }, []);

  useEffect(() => {
    if (isOnSRAPage) {
      setLocalStorage();
    }
  }, [isOnSRAPage]);


  const goToSRA = async () => {
    await chrome.tabs.update(tabId, { url: 'https://sra.smartosc.com/' });
    return new Promise(resolve => {
      chrome.tabs.onUpdated.addListener(function onUpdated(tabId, info) {
        if (info.status === 'complete') {
          setIsOnSRAPage(true);
        }
      });
    });
  };

  const handleClick = async () => {
    try {
      if (!localStorageData?.accessToken) {
        setErrorMessage('You must log in SRA');
        return;
      }
      if (workType === '') {
        setErrorMessage('You must select work type');
        return;
      }
      const date = new Date(`${month}-02T00:00:00`);
      console.log('date', date);
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 2);
      const now = new Date();
      console.log('firstDayOfMonth', firstDayOfMonth);
      // If you need the dates in 'yyyy-MM-dd' format
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      console.log('startDate', startDate);
      console.log('endDate', endDate);
      // TODO: Call API get timesheet overview
      const timesheetOverview = await fetchLogData(localStorageData.accessToken, {
        username: localStorageData?.userData?.username,
        startDate,
        endDate,
      });

      console.log('timesheetOverview', timesheetOverview);

      // TODO: Process data and create work logs list
      const workLogsList = timesheetOverview?.timesheetOverview.filter((log) => {
        return (
          !log.isWeekend &&
          !log.isHoliday &&
          log.allocated?.totalHours > 0 &&
          (!log.workLogs || log.workLogs?.totalHours < log.allocated?.totalHours)
        );
      });
      console.log('workLogsList', workLogsList);
      const workLogsListFilter = [];
      for (let i = 0; i < workLogsList.length; i++) {
        for (let j = 0; j < workLogsList?.[i]?.allocated?.detail?.length; j++) {
          workLogsListFilter.push({
            ...workLogsList[i].allocated.detail[j],
            logHours: workLogsList?.[i].workLogs ? Object.values(workLogsList?.[i]?.workLogs?.detail).find((data) => data.code === workLogsList[i].allocated.detail[j].code)?.hours: 0,
            date: workLogsList[i].date,
          });
        }
      }

      console.log('workLogsListFilter', workLogsListFilter);

      const workLogsData = workLogsListFilter.map((log) => {
        return {
          date: log.date,
          description: null,
          workHours: log.hours - log.logHours,
          typeOfWork: workType,
          projectId: projectData.find((project) => project.code === log.code).id,
        };
      });

      if (workLogsData.length) {
        // TODO: Call API post work logs
        await postWorkLogs(localStorageData.accessToken, {
          workLogs: workLogsData,
        }).then((data) => {
          console.log('data', data);
        });
      }
      setSuccessMessage('Log work successful!');
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
      });
    } catch (e) {
      setErrorMessage(e.message);
    }

  };

  const handleWorkTypeChange = (event) => {
    setWorkType(event.value);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleMonthChange = (date) => {
    setCurrentDate(date);
    setMonth(getCurrentMonth(date));
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div class="title">
          <img src={logo} className="logo" alt="logo" />
          <p class="text-title">SRA++</p>
        </div>
        {
          isOnSRAPage ?
            <div class="container">
              <div class="date-input">
                <label htmlFor="month">Month: </label>
                <br />
                <div class="date-picker">
                  <DatePicker selected={currentDate}
                              onChange={handleMonthChange}
                              showMonthYearPicker={true}
                              dateFormat="yyyy-MM"
                              maxDate={new Date()}
                  />
                </div>
              </div>
              <div class="option-input">
                <label htmlFor="workType">Type of Work: </label>
                <div class="select-option">
                  <Select options={workOption} onChange={handleWorkTypeChange} styles={customStyles}  className="react-select-container" placeholder="Select work type"/>
                </div>
              </div>
              <button className="log-button" type="button" onClick={handleClick}>
                Log work
              </button>
            </div>
            :
            <div class="go-to-sra">
              <button className="log-button" type="button" onClick={goToSRA}>Go to SRA</button>
              <br />
              <p> You need go to SRA to log work</p>
            </div>
        }
        {
          errorMessage !== '' &&
          <div class="error-message">
            <br />
            {errorMessage}
          </div>
        }

        {
          successMessage !== '' &&
          <div class="suceess-message">
            <br />
            {successMessage}
          </div>
        }
      </header>
    </div>
  );
};

export default Popup;
