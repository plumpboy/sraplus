import { useEffect, useState } from 'react';
import React from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';
import {
  getTypeOfWork,
  fetchLogData,
  postWorkLogs,
  getProjects,
} from '../../api/sra';
const Popup = () => {
  const [localStorageData, setLocalStorageData] = useState(null);
  const [typeOfWorkData, setTypeOfWorkData] = useState([]);
  const [workType, setWorkType] = useState(null);
  const [projectData, setProjectData] = useState([]);
  const currentDate = new Date();
  const currentMonth =
    currentDate.getFullYear() +
    '-' +
    ('0' + (currentDate.getMonth() + 1)).slice(-2);
  console.log('currentMonth', currentMonth);
  const [month, setMonth] = useState(currentMonth);

  useEffect(() => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        console.log('tab', tabs);
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
          {}
        );
        console.log('localStorageData', localStorageData);
        setLocalStorageData(localStorageData);
      }
    );
  }, []);

  useEffect(() => {
    if (localStorageData?.accessToken) {
      getTypeOfWork(localStorageData.accessToken).then((data) => {
        setTypeOfWorkData(data.typeOfWorks);
        setWorkType(data.typeOfWorks[0].id);
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

  const handleClick = async () => {
    const date = new Date(`${month}-02T00:00:00`);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 2);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    console.log('firstDayOfMonth', firstDayOfMonth, lastDayOfMonth);
    // If you need the dates in 'yyyy-MM-dd' format
    const startDate = firstDayOfMonth.toISOString().split('T')[0];
    const endDate = lastDayOfMonth.toISOString().split('T')[0];
    // TODO: Call API get timesheet overview
    const timesheetOverview = await fetchLogData(localStorageData.accessToken, {
      username: localStorageData?.userData?.username,
      startDate,
      endDate,
    });

    console.log('timesheetOverview', timesheetOverview);

    // TODO: Process data and create work logs list
    const workLogsList = timesheetOverview.timesheetOverview.filter((log) => {
      return (
        log.isWeekend === false &&
        log.isHoliday === false &&
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
          date: workLogsList[i].date,
        });
      }
    }

    console.log('workLogsListFilter', workLogsListFilter);

    const workLogsData = workLogsListFilter.map((log) => {
      return {
        date: log.date,
        description: null,
        workHours: log.hours,
        typeOfWork: workType,
        projectId: projectData.find((project) => project.code === log.code).id,
      };
    });
    console.log('workLogsData', workLogsData);

    if (workLogsData.length) {
      // TODO: Call API post work logs
      postWorkLogs(localStorageData.accessToken, {
        workLogs: workLogsData,
      }).then((data) => {
        console.log('data', data);
      });
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    });
  };

  const handleWorkTypeChange = (event) => {
    setWorkType(event.target.value);
  };

  const handleMonthChange = (event) => {
    console.log('handleMonthChange', event.target.value);
    setMonth(event.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <p>SRA++</p>
        </div>
        <div>
          <label htmlFor="month">Month: </label>
          <input
            id="work-month"
            type="month"
            name="work-month"
            value={month}
            onChange={handleMonthChange}
          />
          <br />
          <br />
          <label htmlFor="workType">Type of Work: </label>
          <select
            id="workType"
            name="workType"
            value={workType}
            onChange={handleWorkTypeChange}
          >
            {typeOfWorkData.map((typeOfWork) => (
              <option key={typeOfWork.id} value={typeOfWork.id}>
                {typeOfWork.name}
              </option>
            ))}
          </select>
          <br />
          <button className="log-button" type="button" onClick={handleClick}>
            Log work
          </button>
        </div>
      </header>
    </div>
  );
};

export default Popup;
