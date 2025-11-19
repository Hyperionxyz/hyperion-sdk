import request, { RequestDocument, Variables } from "graphql-request";

/**
 * Request module for handling GraphQL queries
 *
 * Manages communication with the indexer and official indexer endpoints
 */
export class RequestModule {
  /** Custom indexer URL */
  protected _indexerURL: string;

  /** Official indexer URL */
  protected _officialIndexerURL: string;

  /**
   * Constructor for RequestModule
   *
   * @param {Object} opt - Configuration options
   * @param {string} opt.indexerURL - Custom indexer endpoint URL
   * @param {string} opt.officialIndexerURL - Official indexer endpoint URL
   */
  constructor(opt: { indexerURL: string; officialIndexerURL: string }) {
    this._indexerURL = opt.indexerURL;
    this._officialIndexerURL = opt.officialIndexerURL;
  }

  /**
   * Query the custom indexer
   *
   * @param {Object} params - Query parameters
   * @param {RequestDocument} params.document - GraphQL query document
   * @param {Variables} [params.variables={}] - GraphQL query variables
   * @returns {Promise<any>} Query result
   */
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

  /**
   * Query the official indexer
   *
   * @param {Object} params - Query parameters
   * @param {RequestDocument} params.document - GraphQL query document
   * @param {Variables} [params.variables={}] - GraphQL query variables
   * @returns {Promise<any>} Query result
   */
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

  /**
   * Get the custom indexer URL
   *
   * @returns {string} The custom indexer URL
   */
  get indexerURL() {
    return this._indexerURL;
  }
}
