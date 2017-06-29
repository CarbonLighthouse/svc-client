const _ = require('lodash');
const fetchUtil = require('./fetchUtil');

const endpointDefinitionDefaults = {
  makeInit: _.noop,
  responseExtractor: fetchUtil.defaultExtractor
};

function makeEndpointMethod(baseUrl, initDefaults, endpointDefinition) {
  const {
    endpoint,
    makeInit,
    responseExtractor,
    responseFormatter,
    errorFormatter
  } = Object.assign({}, endpointDefinitionDefaults, endpointDefinition);

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

function makeSvcClient(baseUrl, svcDefinition, initDefaults) {
  return _.mapValues(svcDefinition, obj => {
    if (_.has(obj, 'endpoint')) {
      return makeEndpointMethod(baseUrl, initDefaults, obj);
    }

    return _.mapValues(obj, _.partial(makeEndpointMethod, baseUrl, initDefaults));
  });
}

module.exports = makeSvcClient;
