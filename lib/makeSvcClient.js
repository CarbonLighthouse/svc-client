const _ = require('lodash');
const fetchUtil = require('./fetchUtil');

const apiMethodDefaults = {
  makeInit: _.noop,
  responseExtractor: fetchUtil.defaultExtractor
};

const makeSvcClient = (baseUrl, apiMethods, initDefaults) => (methodName, params) => {
  const apiMethod = Object.assign({}, apiMethodDefaults, apiMethods[methodName]);
  const {endpoint, makeInit, responseExtractor, responseFormatter, errorFormatter} = apiMethod;

  const url = baseUrl + _.template(endpoint)(params);
  const init = Object.assign({}, initDefaults, makeInit(params));

  const request = new Request(url, init);

  let promise = fetch(request)
    .then(fetchUtil.handleErrors.bind(null, errorFormatter))
    .then(responseExtractor);

  if (responseFormatter) {
    promise = promise.then(responseFormatter);
  }

  return promise;
};

module.exports = makeSvcClient;
