import '@testing-library/jest-dom';
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const { ReadableStream } = require('stream/web');
global.ReadableStream = ReadableStream;

const { Request, Response, Headers, fetch } = require('undici');

global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.fetch = fetch;
