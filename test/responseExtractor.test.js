const assert = require('assert');
const fetchMock = require('fetch-mock');
const withData = require('leche').withData;
const makeSvcClient = require('../lib/makeSvcClient');

const baseUrl = 'http://example.com';

// Does not work, idea is to build an image blob to test.
// function getImageBlob() {
//   const canvas = document.getElementById('canvas');
//   const ctx = canvas.getContext('2d');
//   ctx.fillStyle = 'green';
//   ctx.fillRect(10, 10, 100, 100);
//
//   return canvas.toDataURL('image/png');
// }

describe('responseExtractor', () => {
  /* eslint-disable max-nested-callbacks */
  afterEach(() => fetchMock.restore());

  describe('defaultExtractor', () => {
    withData({
      '204 NO CONTENT': [
        {status: 204},
        undefined
      ],
      'No Content-Type Header': [
        {body: {test: 'test.body'}},
        '{"test":"test.body"}'
      ],
      'JSON Body': [
        {body: {test: 'test.body'}, headers: {'Content-Type': 'application/json'}},
        {test: 'test.body'}
      ],
      // 'Blob': [
      //   new Response(new Blob([getImageBlob()], {type: 'image/png'}), {headers: {'Content-Type': 'image/png'}}),
      //   getImageBlob()
      // ]
      'Text body': [
        {body: 'test.text', headers: {'Content-Type': 'text/plain'}},
        'test.text'
      ]
    }, (res, expected) => {
      it('should extract response', () => {
        const svcDefinition = {
          testMethod: {endpoint: '/test'}
        };
        const client = makeSvcClient(baseUrl, svcDefinition);

        fetchMock.mock(`${baseUrl}/test`, res);

        return client
          .testMethod()
          .then(actual => {
            assert.deepEqual(actual, expected, 'made successful request');
          });
      });
    });
  });
});
