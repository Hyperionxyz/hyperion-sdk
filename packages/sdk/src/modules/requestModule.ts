type QueryParams = Record<string, boolean | number | string | undefined>;

function normalizeAPIHost(url: string) {
  return url.replace(/\/v1\/graphql\/?$/, "").replace(/\/$/, "");
}

export class RequestModule {
  protected _apiHost: string;

  constructor(opt: { indexerURL: string }) {
    this._apiHost = normalizeAPIHost(opt.indexerURL);
  }

  async get<T>(path: string, params: QueryParams = {}): Promise<T> {
    const url = new URL(path, `${this._apiHost}/`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value.toString());
      }
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Hyperion API request failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  get indexerURL() {
    return this._apiHost;
  }
}
