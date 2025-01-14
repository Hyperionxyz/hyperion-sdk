import request, { RequestDocument, Variables } from "graphql-request";

export class RequestModule {
  protected _indexerURL: string;

  protected _officialIndexerURL: string;

  constructor(opt: { indexerURL: string; officialIndexerURL: string }) {
    this._indexerURL = opt.indexerURL;
    this._officialIndexerURL = opt.officialIndexerURL;
  }

  async queryIndexer({
    document,
    variables = {},
  }: {
    document: RequestDocument;
    variables?: Variables;
  }) {
    return await request({
      url: this._indexerURL,
      document,
      variables,
    });
  }

  async queryOfficialIndexer({
    document,
    variables = {},
  }: {
    document: RequestDocument;
    variables?: Variables;
  }) {
    return await request({
      url: this._officialIndexerURL,
      document,
      variables,
    });
  }

  get indexerURL() {
    return this._indexerURL;
  }
}
