const assert = require('assert');
const fetchMock = require('fetch-mock');
const makeSvcClient = require('../lib/makeSvcClient');

const baseUrl = 'http://example.com';

describe('error rejections', () => {
  afterEach(() => fetchMock.restore());

  describe('defaultErrorFormatter', () => {
    it('should return a rejected promise with the response statusText in the error', () => {
      const svcDefinition = {testMethod: {endpoint: '/test'}};
      const client = makeSvcClient(baseUrl, svcDefinition);

      fetchMock.mock(`${baseUrl}/test`, {status: 404});

      return client
        .testMethod()
        .then(() => assert.fail('Promise should have been rejected and was not'))
        .catch(err => {
          const actual = err.message;
          const expected = 'Not Found';
          assert.equal(actual, expected, 'should be rejected with err that has statusText message');
        });
    });

    // Can't get this to work correctly. The response from fetch-mock doesn't come back with headers
    // or a proper body.
    it.skip('should reject with the statusText and body for application/json responses', () => {
      const svcDefinition = {testMethod: {endpoint: '/test'}};
      const client = makeSvcClient(baseUrl, svcDefinition);

      fetchMock.mock(`${baseUrl}/test`, {
        status: 404,
        headers: {'Content-Type': 'application/json'},
        body: '{"error": "test.body.error.message"}'
      });

      return client
        .testMethod()
        .then(() => assert.fail('Promise should have been rejected and was not'))
        .catch(err => {
          const actual = err.message;
          const expected = 'Not Found: test.body.error.message';
          assert.equal(
            actual,
            expected,
            'should be rejected with err that has statusText and response.body.error'
          );
        });
    });
  });

  describe('custom errorFormatter', () => {
    it('should be able to throw custom error', () => {
      const svcDefinition = {
        testMethod: {
          endpoint: '/test',
          errorFormatter() {
            throw new Error('test.message');
          }
        }
      };
      const client = makeSvcClient(baseUrl, svcDefinition);

      fetchMock.mock(`${baseUrl}/test`, {status: 404});

      return client
        .testMethod()
        .then(() => assert.fail('Promise should have been rejected and was not'))
        .catch(err => {
          const actual = err.message;
          const expected = 'test.message';
          assert.equal(actual, expected, 'should be rejected with custom error');
        });
    });
  });
});
