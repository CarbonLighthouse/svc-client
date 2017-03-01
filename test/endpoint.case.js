const baseUrl = 'http://example.com';

function staticEndpoint() {
  const methodConfig = {endpoint: '/foo'};
  const params = undefined;
  const compiledEndpoint = '/foo';
  return [baseUrl, methodConfig, params, compiledEndpoint];
}

function templateStringEndpoint() {
  const methodConfig = {endpoint: '/foo/<%= id %>'};
  const params = {id: 'bar'};
  const compiledEndpoint = '/foo/bar';
  return [baseUrl, methodConfig, params, compiledEndpoint];
}

module.exports = {
  'static endpoint': staticEndpoint(),
  'template string endpoint': templateStringEndpoint()
};
