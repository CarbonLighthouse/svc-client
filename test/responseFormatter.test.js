const assert = require('assert');
const fetchMock = require('fetch-mock');
const makeSvcClient = require('../lib/makeSvcClient');

const baseUrl = 'http://example.com';

describe('responseFormatter', () => {
  afterEach(() => fetchMock.restore());

  it('should be able to alter response before promise is resolved', () => {
    const svcDefinition = {
      testMethod: {
        endpoint: '/test',
        responseFormatter: data => ({testResult: data.result.toUpperCase()})
      }
    };
    const client = makeSvcClient(baseUrl, svcDefinition);

    fetchMock.mock(`${baseUrl}/test`, {
      body: '{"result": "test.result"}',
      headers: {'Content-Type': 'application/json'}
    });

    return client
      .testMethod()
      .then(actual => {
        const expected = {testResult: 'TEST.RESULT'};
        assert.deepEqual(actual, expected, 'responseFormatter alters response body');
      });
  });
});
