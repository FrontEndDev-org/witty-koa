export class ResponseError extends Error {
  data: ErrorResponseData;
  constructor(error: ErrorResponseData) {
    super();
    if (error.status === undefined) {
      error.status = 400;
    }
    this.data = error;
  }
}

export interface ErrorResponseData {
  error: ResponseErrorType | string;
  error_description?: string;
  /**
   * A URI identifying a human-readable web page with information about the error,
   * used to provide the client developer with additional information about the error.
   */
  error_uri?: string;
  /**
   * for oauth2.1
   * if a state parameter was present in the client authorization request.
   * The exact value received from the client.
   */
  state?: string;
  /**
   * for oauth2.1
   * The identifier of the authorization server
   */
  iss?: string;
  /**
   * response status
   */
  status?: number;
}

export enum ResponseErrorType {
  /**
   * The request is missing a required parameter,
   * includes an invalid parameter value,
   * includes a parameter more than once,
   * or is otherwise malformed.
   */
  INVALID_REQUEST = 'invalid_request',
  NOT_FOUND = 'not_found',
}
