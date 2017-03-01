const _ = require('lodash');

const baseUrl = 'http://example.com';
const endpoint = '/foo';

function postAndHeaders() {
  const headers = {'Content-Type': 'application/json'};
  const makeInit = x => ({method: 'POST', headers, body: JSON.stringify(x)});

  const methodConfig = {endpoint, makeInit};
  const params = {beep: 'boop'};

  const matcher = inReq => {
    const init = {method: 'POST', headers, body: JSON.stringify(params)};
    return _.isEqual(inReq, new Request(`${baseUrl}${endpoint}`, init));
  };

  return [baseUrl, methodConfig, params, matcher];
}

function headAndCors() {
  const init = {method: 'HEAD', mode: 'cors'};
  const makeInit = () => init;

  const methodConfig = {endpoint, makeInit};
  const params = undefined;

  const expectedRequest = new Request(`${baseUrl}${endpoint}`, init);
  const matcher = inReq => _.isEqual(inReq, expectedRequest);

  return [baseUrl, methodConfig, params, matcher];
}

module.exports = {
  'POST and Content-Type Header': postAndHeaders(),
  'HEAD and CORS mode': headAndCors()
};
