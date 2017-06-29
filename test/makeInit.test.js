const _ = require('lodash');
const assert = require('assert');
const fetchMock = require('fetch-mock');
const makeSvcClient = require('../lib/makeSvcClient');

const baseUrl = 'http://example.com';

describe('makeInit', () => {
  afterEach(() => fetchMock.restore());

  it('should be able to define a JSON Body POST request', () => {
    const svcDefinition = {
      testMethod: {
        endpoint: '/test',
        makeInit(params) {
          return {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(params)
          };
        }
      }
    };
    const client = makeSvcClient(baseUrl, svcDefinition);

    const intercept = new Request(`${baseUrl}/test`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '{"body":"test.body"}'
    });
    fetchMock.mock(
      inReq => _.isEqual(inReq, intercept),
      {
        body: '{"result": "test.result"}',
        headers: {'Content-Type': 'application/json'}
      });

    return client
      .testMethod({body: 'test.body'})
      .then(actual => {
        const expected = {result: 'test.result'};
        assert.deepEqual(actual, expected, 'made successful request');
      });
  });

  it('should be able to make a CORS request', () => {
    const svcDefinition = {
      testMethod: {
        endpoint: '/test',
        makeInit: () => ({method: 'HEAD', mode: 'cors'})
      }
    };
    const client = makeSvcClient(baseUrl, svcDefinition);

    const intercept = new Request(`${baseUrl}/test`, {method: 'HEAD', mode: 'cors'});
    fetchMock.mock(inReq => _.isEqual(inReq, intercept), {
      body: '{"result": "test.result"}',
      headers: {'Content-Type': 'application/json'}
    });

    return client
      .testMethod()
      .then(actual => {
        const expected = {result: 'test.result'};
        assert.deepEqual(actual, expected, 'made successful request');
      });
  });
});
