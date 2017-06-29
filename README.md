# svc-client

> Declarative web service client framework on top of the Fetch API

## Why?

To help easily build web service client libraries that utilize the
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

This project seeks to allow a user to define their web service endpoints
in an intuitive way that favors configuration over boilerplate code
(spoiler alert: not quite achieving that goal yet). The `svc-client` makes
requests, a user defines how those request should be made.

## Installation

```
npm install --save svc-client
```


You will also need a Promise polyfill for older browsers as well as a Fetch API
polyfill. We recommend [taylorhakes/promise-polyfill](https://github.com/taylorhakes/promise-polyfill)
for its small size and Promises/A+ compatibility. For fetch, we recommend either [whatwg-fetch](https://github.com/github/fetch)
or [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)

For use with webpack, you will also need to include add the fetch polyfill in the
entry configuration option before your application entry point:

```
entry: ['whatwg-fetch', ...]
```

or

```
entry: ['isomorphic-fetch', ...]
```

There are further instructions on the fetch project pages.

## Usage

Let's assume we have a web service running on `localhost:8000` which serves todos managed by a database.
It's enpoints are:

List Todos:

`GET /todos/` => `[{"id": string, "text": string, "isDone": boolean}...]`

Show Todo:

`GET /todos/:todoId` => `{"id": string, "text": string, "isDone": boolean}`

Create Todo:

Request Body: `{"text": string}`

`POST /todos/` => `{"id": string}`

Healthcheck:

`GET /healthcheck` => `{"status": "ok"}`

```js
const makeSvcClient = require('svc-client').makeSvcClient;

const baseUrl = 'http://localhost:8000';

const svcDefinition = {
  healthcheck: {endpoint: '/healthcheck'},
  todos: {
    list: {endpoint: '/todos/'},
    show: {endpoint: '/todos/<%- todoId %>'},
    create: {
      endpoint: '/todos/',
      makeInit(params) {
        return {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: {text: params.text}
        };
      }
    }
  }
};

const client = makeSvcClient(baseUrl, svcDefinition);

client
  .healthcheck()
  .then(res => console.log(res.status)) // "ok"


// Create a todo, and then use the response to call
// show to get all the information about that todo
// end by calling to get the entire list of stored todos
client
  .todos
  .create({text: 'write documentation'})
  .then((res) => client.todos.show({todoId: res.id}))
  .then(todo => console.log(todo)) // {id: "1", text: 'write documentation', isDone: false}
  .then(() => client.todos.list())
  .then(todos => console.log(todos); // [{id: "1", text: 'write documentation', isDone: false}, ...]
```

## Service Client Factory

*`makeSvcClient` :: (`baseUrl<String>`, `svcDefinition<Object>`) -> `client<Object>`*

**baseUrl**: `<String>`

Precedes all endpoint declarations when making service calls

**svcDefinition**: `<Object>`

Object which defines your Service Endpoints. See usage example above, and documentation below
for more information on defining your service with a service definition.

## Service Definition

A service definition is an object which defines endpoints that your client should make calls to.
You may group like endpoints one level under a key. See the usage example to see how "todos" endpoints
are grouped under `client.todos`.

Each enpoint in a service definition can have the following properties.

**endpoint** *Required* `<String>`:

A string or template string to define what URL of the service is called. The template string is templated by the `params` object passed in a service call.

**makeInit** `<Function>` :: `params<Object>` -> `init<Object>`

A function which takes the `params` passed in a service call and returns
a `init` object as defined by the [Fetch API Request Docs](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request).
This allows creation of custom request methods, bodies, headers, or anything else the Fetch API is capable of.
If the `makeInit` function is absent the request is assumed to be `GET` by default.

**responseExtractor** `<Function>` :: `Response` -> `Promise`

Needs more documentation, there is a `defaultExtractor` that is used. See `svc-client/fetchUtil` and [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
for more information.

**responseFormatter** `<Function>` :: `*` -> `*`

Optional function which can be provided to do extra formatting work on the data returned
by a service call. e.g. convert snake_case keys of data to camelCase.

**errorFormatter** `<Function>` :: `Response` -> `Promise || Response`

Needs more documentation, there is a `handleErrors` defautl that is used. See `svc-client/fetchUtil` and [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
for more information.
