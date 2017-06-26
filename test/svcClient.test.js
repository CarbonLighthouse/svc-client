const assert = require('assert');
const fetchMock = require('fetch-mock');
const withData = require('leche').withData;
const makeInitCase = require('./makeInit.case');
const makeSvcClient = require('../lib/makeSvcClient');

/* eslint-disable max-nested-callbacks */
describe('svcClient', () => {
  afterEach(() => fetchMock.restore());

  describe('makeInit config', () => {
    withData(makeInitCase, (baseUrl, methodConfig, params, matcher) => {
      it('should make requests with custom init', () => {
        const apiMethods = {testMethod: methodConfig};
        const client = makeSvcClient(baseUrl, apiMethods);

        fetchMock.mock(matcher, {
          body: '{"foo": "bar"}',
          headers: {'Content-Type': 'application/json'}
        });

        return client.testMethod(params)
          .then(actual => {
            const expected = {foo: 'bar'};
            assert.deepEqual(actual, expected, 'successful response');
          });
      });
    });
  });

  describe('responseFormatter config', () => {
    it('should be able to alter response before promise is resolved');
  });

  describe('responseExtractor config', () => {
    // TODO withData to go over all the available types of provided extractors,
    // and illustrate a custom one.
    // also, I think it would be nice if for the built-ins you could just do
    // responseExtractor: 'text' instead of providing a function. So it should be
    // a string or a function.
  });

  describe('error rejections', () => {
    it('should return a rejected promise with the response statusText in the error');
  });
});
