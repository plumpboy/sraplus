import Request from '../utils/requestSRA'
import Transformer from '../utils/transformer'

/**
 * fetch the current logged in user
 *
 * @returns {function(*)}
 */
export function fetchLogData(accessToken, params) {
  return Request.get('/timesheet-overview', {
      params,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    })
    .then(res => {
      const data = Transformer.fetch(res.data)

      return data;
    })
}

/**
 *
 * @returns {function(*)}
 */
export function getUserData(accessToken) {
  return Request.get('/users/current-user', {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    })
    .then(res => {
      const data = Transformer.fetch(res.data)

      return data;
    })
}

/**
 *
 * @returns {function(*)}
 */
export function postWorkLogs(accessToken, data) {
  return Request.post('/user/worklogs', data, {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    })
    .then(res => {
      const data = Transformer.fetch(res.data)

      return data;
    })
}

/**
 *
 * @returns {function(*)}
 */
export function getTypeOfWork(accessToken) {
  return Request.get('/timesheet/type-of-work', {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    })
    .then(res => {
      const data = Transformer.fetch(res.data)

      return data;
    })
}

/**
 *
 * @returns {function(*)}
 */
export function getProjects(accessToken, params) {
  return Request.get('/projects/all', {
      params,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    })
    .then(res => {
      const data = Transformer.fetch(res.data)

      return data;
    })
}