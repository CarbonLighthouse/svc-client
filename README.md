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

`GET /todos/`
Lists Todos => `[{"id": string, "text": string, "isDone": boolean}...]`

`GET /todos/:todoId`
"Show a single todo by it's id" => `{"id": string, "text": string, "isDone": boolean}`

`POST /todos/`
POST Body: `{"text": string}`
"Create a new todo" => `{"id": string}`

```js
const makeSvcClient = require('svc-client').makeSvcClient;

const baseUrl = 'http://localhost:8000';

// Defines configuration of all the endpoints available in the todos service
const endpointConfig = {
  // Simple GET requires nothing more than an endpoint
  listTodos: {endpoint: '/todos/'}

  // Parameterized endpoints use EJS templates via lodash _.template
  showTodo: {endpoint: '/todos/<%- todoId %>'

  // Defining the makeInit function allows you to make request objects
  // as defined via the Fetch API Request documentation
  createTodo: {
    endpoint: '/todos/',
    makeInit(params) {
      return {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text: params.text})
      };
    }
  }
};

const todoSvc = makeSvcClient(baseUrl, endpointConfig);

// Making service calls

// Create a todo, and then use the response to make a 'showTodo' call
// to retrieve the full data for that todo.
todoSvc('createTodo', {text: 'write documentation'})
    .then(({id}) => {
        return todoSvc('showTodo', {todoId: id});
    })
    .then(console.log); // {id: string, text: 'write documentation', isDone: false}

todoSvc('listTodos').then(todos => {
  // do something with todos data returned from the server.
  console.log(todos); // [{}...]
})
```

## API

### `makeSvcClient` :: (`baseUrl<String>`, `methods<Object>`) -> (`methodName<String>`, `params<Object>`) -> `Promise`

Setup Function:

**baseUrl**: `<String>`

Precedes all endpoint declarations when making service calls

**methods**: `<Object>`

Key value object of methodName => methodDefinition (see below)

Service Call Function:

**methodName**: `<String>`

The name of the service method to call

**params**: `<Object>`

Object of params used in templating endpoints and making Request `init` definitions.



### Defining API Methods/Endpoints via configuration

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
