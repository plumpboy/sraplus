import _ from 'lodash';

export default class Transformer {
  /**
   * Method used to transform action name to fulfill name
   *
   * @param param
   * @return {*}
   */
  static fulfill(name) {
    return name + '_FULFILL'
  }
  /**
   * Method used to transform action name to success name
   *
   * @param param
   * @return {*}
   */
  static success(name) {
    return name + '_SUCCESS'
  }
  /**
   * Method used to transform action name to fail name
   *
   * @param param
   * @return {*}
   */
  static fail(name) {
    return name + '_FAIL'
  }
  /**
   * Method used to transform a fetched data
   *
   * @param param
   * @return {*}
   */
  static fetch(param) {
    if (param && Array.isArray(param)) {
      return Transformer.fetchCollection(param);
    } else if (param && typeof param === 'object') {
      return Transformer.fetchObject(param);
    }
    return param
  }

  /**
   * Method used to transform a fetched collection
   *
   * @param param
   * @return [Array]
   */
  static fetchCollection(param) {
    return param.map(item => Transformer.fetch(item));
  }

  /**
   * Method used to transform a fetched object
   *
   * @param param
   * @return {{}}
   */
  static fetchObject(param) {
    const data = {};

    _.forOwn(param, (value, key) => {
      data[_.camelCase(key)] = Transformer.fetch(value);
    });
    return data;
  }

  /**
   * Method used to transform a send data
   *
   * @param param
   * @return {*}
   */
  static send(param) {
    if (param && Array.isArray(param)) {
      return Transformer.sendCollection(param);
    } else if (param && typeof param === 'object') {
      return Transformer.sendObject(param);
    }
    return param
  }

  /**
   * Method used to transform a collection to be send
   *
   * @param param
   * @return [Array]
   */
  static sendCollection(param) {
    return param.map(item => Transformer.send(item));
  }

  /**
   * Method used to transform a object to be send
   *
   * @param param
   * @returns {{}}
   */
  static sendObject(param) {
    const data = {};

    _.forOwn(param, (value, key) => {
      data[_.snakeCase(key)] = Transformer.send(value);
    });
    return data;
  }

  /**
   * Method used to transform a form errors
   *
   * @param errors The fetched data
   * @param replace Boolean
   * @param searchStr String
   * @param replaceStr String
   * @returns {{}}
   */
  static resetValidationFields({
    errors,
    replace = false,
    searchStr = '',
    replaceStr = ''
  }) {
    console.log(errors)
    const data = {};
    _.forOwn(errors, (value, key) => {
      let index = '';
      if (replace) {
        index = _.camelCase(key.replace(searchStr, replaceStr));
      } else {
        index = _.camelCase(key);
      }
      data[index] = _.head(value);
    });
    return data;
  }
}