const _ = require('lodash');
const fetchUtil = require('./fetchUtil');

const apiMethodDefaults = {
  makeInit: _.noop,
  responseExtractor: fetchUtil.defaultExtractor
};

function makeMethod(baseUrl, initDefaults, methodDefinition) {
  const {
    endpoint,
    makeInit,
    responseExtractor,
    responseFormatter,
    errorFormatter
  } = Object.assign({}, apiMethodDefaults, methodDefinition);

  return params => {
    const url = baseUrl + _.template(endpoint)(params);
    const init = Object.assign({}, initDefaults, makeInit(params));

    const request = new Request(url, init);
    const responseHandler = _.partial(fetchUtil.handleErrors, errorFormatter);

    let promise = fetch(request)
      .then(responseHandler)
      .then(responseExtractor);

    if (responseFormatter) {
      promise = promise.then(responseFormatter);
    }

    return promise;
  };
}

function makeSvcClient(baseUrl, apiDefinition, initDefaults) {
  return _.mapValues(apiDefinition, obj => {
    if (_.has(obj, 'endpoint')) {
      return makeMethod(baseUrl, initDefaults, obj);
    }

    return _.mapValues(obj, _.partial(makeMethod, baseUrl, initDefaults));
  });
}

module.exports = makeSvcClient;
