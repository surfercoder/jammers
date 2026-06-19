// jsdom doesn't expose the WHATWG `Request`/`Response`/`Headers` globals that
// `next/server` needs at import time. Polyfill them (and the primitives undici
// depends on) from Node's builtins so route handlers and middleware can be
// unit-tested in the default jsdom environment. Import this BEFORE importing
// `next/server`.
/* eslint-disable @typescript-eslint/no-require-imports */
import { TextEncoder, TextDecoder } from "node:util";
import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from "node:stream/web";
import { MessageChannel, MessagePort } from "node:worker_threads";

const g = globalThis as unknown as Record<string, unknown>;

const ensure = (key: string, value: unknown) => {
  if (!g[key]) g[key] = value;
};

// undici relies on these, which jsdom omits.
ensure("TextEncoder", TextEncoder);
ensure("TextDecoder", TextDecoder);
ensure("ReadableStream", ReadableStream);
ensure("WritableStream", WritableStream);
ensure("TransformStream", TransformStream);
ensure("MessageChannel", MessageChannel);
ensure("MessagePort", MessagePort);

const { Request, Response, Headers, fetch, FormData } = require("undici");

// Force the WHATWG fetch primitives to a single consistent implementation
// (undici). jsdom ships its own `Headers`/`fetch`, which `next/server`'s
// internal `instanceof Headers` checks reject when mixed with undici Requests.
g.Request = Request;
g.Response = Response;
g.Headers = Headers;
g.fetch = fetch;
g.FormData = FormData;

export {};
