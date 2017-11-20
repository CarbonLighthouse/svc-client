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

    // JSON stringify init.body if it's an object as a convenience.
    if (_.isPlainObject(init.body)) {
      init.body = JSON.stringify(init.body);
    }

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

function validateSvcDefinition(svcDefinition) {
  if (!_.isPlainObject(svcDefinition) || _.isEmpty(svcDefinition)) {
    throw new TypeError('svcDefinition must be an object');
  }

  _.forEach(svcDefinition, (value, key) => {
    if (!_.isPlainObject(value) || _.isEmpty(value)) {
      throw new TypeError(`svcDefinition invalid at ${key}`);
    }

    if (!_.has(value, 'endpoint')) {
      _.forEach(value, (subObj, subKey) => {
        if (!_.isPlainObject(subObj) || !_.has(subObj, 'endpoint')) {
          throw new TypeError(`svcDefinition invalid at ${key}.${subKey}`);
        }
      });
    }
  });
}

function makeSvcClient(baseUrl, svcDefinition, initDefaults) {
  validateSvcDefinition(svcDefinition);

  return _.mapValues(svcDefinition, obj => {
    if (_.has(obj, 'endpoint')) {
      return makeEndpointMethod(baseUrl, initDefaults, obj);
    }

    return _.mapValues(obj, _.partial(makeEndpointMethod, baseUrl, initDefaults));
  });
}

module.exports = makeSvcClient;
