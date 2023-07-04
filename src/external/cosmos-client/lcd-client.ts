import ok from "tiny-invariant";

const NUMIA_KEY = null;

export class LCDClient {
  _type = "lcd" as const;
  baseUrl: string;
  defaultHeaders: Record<string, string> = {};
  fetch: typeof innerFetch;
  constructor({
    baseUrl,
    headers,
  }: {
    baseUrl: string;
    headers?: Record<string, string>;
  }) {
    this.baseUrl = baseUrl;
    if (headers) {
      this.defaultHeaders = headers;
    }
    this.fetch = innerFetch.bind(this);
  }

  static create() {
    ok(NUMIA_KEY, "NUMIA_KEY is not set");
    const headers = {
      Authorization: `Bearer ${NUMIA_KEY}`,
    };
    const client = new LCDClient({
      baseUrl: `https://osmosis-lcd.numia.xyz`,
      headers,
    });

    return client;
  }
}

async function innerFetch(
  this: { baseUrl: string; defaultHeaders?: Record<string, string> },
  path: string,
  options?: RequestInit | undefined
) {
  const url = `${this.baseUrl}${path.startsWith("/") ? path : "/" + path}`;
  // logger.debug(`fetching ${url}`)
  const fullOptions = {
    ...options,
    headers: {
      ...this.defaultHeaders,
      ...options?.headers,
    },
  };
  const response = await fetch(url, fullOptions);
  if (response.status !== 200) {
    const rawBody = await response.text();
    const e = new Error("Pipe Cosmos Rest Error " + response.status);
    Object.assign(e, {
      status: response.status,
      body: rawBody,
      url,
    });
    throw e;
  }
  const rawBody = await response.text();
  try {
    const json = JSON.parse(rawBody);

    return json;
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.log(
        "Request Error Status:",
        response.status,
        // response.headers.has('x-source') ? response.headers.get('x-source') : '',
        "Raw Body:"
      );
      if (rawBody.length > 10) {
        console.log(
          "Raw Body Length",
          rawBody.length,
          response.headers.get("content-length")
        );
      } else {
        console.log(rawBody);
      }
    }
    throw e;
  }
}
