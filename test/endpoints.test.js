const assert = require('assert');
const fetchMock = require('fetch-mock');
const makeSvcClient = require('../lib/makeSvcClient');

const baseUrl = 'http://example.com';

describe('svcClient', () => {
  afterEach(() => fetchMock.restore());

  it('should make request to static endpoint', () => {
    const apiDefinition = {
      foo: {endpoint: '/foo'}
    };
    const client = makeSvcClient(baseUrl, apiDefinition);

    fetchMock.mock(`${baseUrl}/foo`, {
      body: '{"result": "test.result"}',
      headers: {'Content-Type': 'application/json'}
    });

    return client
      .foo()
      .then(actual => {
        const expected = {result: 'test.result'};
        assert.deepEqual(actual, expected, 'made successful request');
      });
  });

  it('should make request to templated endpoint', () => {
    const apiDefinition = {
      foo: {endpoint: '/foo/<%- id %>'}
    };
    const client = makeSvcClient(baseUrl, apiDefinition);

    fetchMock.mock(`${baseUrl}/foo/42`, {
      body: '{"result": "test.result"}',
      headers: {'Content-Type': 'application/json'}
    });

    return client
      .foo({id: 42})
      .then(actual => {
        const expected = {result: 'test.result'};
        assert.deepEqual(actual, expected, 'made successful request');
      });
  });
});
