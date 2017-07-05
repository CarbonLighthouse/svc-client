const assert = require('assert');
const fetchMock = require('fetch-mock');
const makeSvcClient = require('../lib/makeSvcClient');

const baseUrl = 'http://example.com';

describe('endpoints', () => {
  afterEach(() => fetchMock.restore());

  it('should make request to static endpoint', () => {
    const svcDefinition = {
      testMethod: {endpoint: '/test'}
    };
    const client = makeSvcClient(baseUrl, svcDefinition);

    fetchMock.mock(`${baseUrl}/test`, {
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

  it('should make request to template endpoint', () => {
    const svcDefinition = {
      testMethod: {endpoint: '/test/<%- id %>'}
    };
    const client = makeSvcClient(baseUrl, svcDefinition);

    fetchMock.mock(`${baseUrl}/test/42`, {
      body: '{"result": "test.result"}',
      headers: {'Content-Type': 'application/json'}
    });

    return client
      .testMethod({id: 42})
      .then(actual => {
        const expected = {result: 'test.result'};
        assert.deepEqual(actual, expected, 'made successful request');
      });
  });

  it('should make requests to nested/grouped endpoint definitions', () => {
    const svcDefinition = {
      healthcheck: {endpoint: '/healthcheck'},
      todos: {
        list: {endpoint: '/todos/'},
        show: {endpoint: '/todos/<%- id %>'}
      }
    };
    const client = makeSvcClient(baseUrl, svcDefinition);

    fetchMock.mock(`${baseUrl}/healthcheck`, {
      body: {status: 'ok'},
      headers: {'Content-Type': 'application/json'}
    });

    fetchMock.mock(`${baseUrl}/todos/`, {
      body: [{id: 1}, {id: 2}],
      headers: {'Content-Type': 'application/json'}
    });

    fetchMock.mock(`${baseUrl}/todos/1`, {
      body: {id: 1, text: 'laundry', isDone: false},
      headers: {'Content-Type': 'application/json'}
    });

    return Promise.all([
      client.healthcheck(),
      client.todos.list(),
      client.todos.show({id: 1})
    ]).then(results => {
      const [health, todos, todo] = results;
      assert.deepEqual(health, {status: 'ok'}, 'top level endpoint successful');
      assert.deepEqual(todos, [{id: 1}, {id: 2}], 'todos.list endpoint successful');
      assert.deepEqual(
        todo,
        {id: 1, text: 'laundry', isDone: false},
        'todos.list endpoint successful'
      );
    });
  });
});
