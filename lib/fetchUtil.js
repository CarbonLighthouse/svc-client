const contentType = require('content-type');

const arrayBufferExtractor = response => response.arrayBuffer();
const blobExtractor = response => response.blob();
const formDataExtractor = response => response.formData();
const jsonExtractor = response => response.json();
const textExtractor = response => response.text();

// I am covering some basics, but honestly there's like a billion mime-types
// I don't know what the rules are for when to use which extraction method.
// It should be up to people to use the exported extractors themselves, or
// provide their own custom extractors in their method description.
function defaultExtractor(response) {
  // 204 NO CONTENT
  if (response.status === 204) {
    return undefined;
  }

  const contentTypeHeader = response.headers.get('Content-Type');

  if (!contentTypeHeader) {
    // This is the correct thing to do based on my interpretation of the HTTP specification:
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec7.html#sec7.2.1
    // return arrayBufferExtractor(response);
    // But, not supported by fetch polyfill so I just send as text.
    return textExtractor(response);
  }

  const type = contentType.parse(contentTypeHeader).type;

  if (type.match(/^application\/json/)) {
    return jsonExtractor(response);
  }

  if (type.match(/^image\//)) {
    return blobExtractor(response);
  }

  // By default try to extract as text?
  return textExtractor(response);
}

function defaultErrorFormatter(response) {
  const contentTypeHeader = response.headers.get('Content-Type');

  if (contentTypeHeader && contentType.parse(contentTypeHeader).type.match(/^application\/json/)) {
    return response.json().then(body => {
      throw Error(`${response.statusText}: ${body.error}`);
    });
  }

  throw Error(response.statusText);
}

/**
 * If there is a custom errorFormatter use it, otherwise use the default
 * @param errorFormatter
 * @param response
 * @returns {*}
 */
function handleErrors(errorFormatter, response) {
  if (!response.ok) {
    if (errorFormatter) {
      return errorFormatter(response);
    }

    return defaultErrorFormatter(response);
  }
  return response;
}

module.exports = {
  handleErrors,
  arrayBufferExtractor,
  blobExtractor,
  formDataExtractor,
  jsonExtractor,
  textExtractor,
  defaultExtractor
};
