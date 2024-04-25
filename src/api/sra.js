import Request from '../utils/requestSRA'
import Transformer from '../utils/transformer'

/**
 * fetch the current logged in user
 *
 * @returns {function(*)}
 */
export function fetchLogData(params) {
  return Request.get('/timesheet-overview')
    .then(res => {
      const data = Transformer.fetch(res.data)

      return data;
    })
}

/**
 *
 * @returns {function(*)}
 */
export function getUserData() {
  return Request.get('/users/current-user')
    .then(res => {
      const data = Transformer.fetch(res.data)

      return data;
    })
}

/**
 *
 * @returns {function(*)}
 */
export function getRemoteReward(data) {
  return Request.post('/user/worklogs', data)
    .then(res => {
      const data = Transformer.fetch(res.data)

      return data;
    })
}