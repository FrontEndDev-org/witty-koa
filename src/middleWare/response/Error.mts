export class ResponseError extends Error {
  data: ErrorResponseData;
  constructor({ code, message, status = 400 }: ErrorResponseData) {
    super();
    this.data = {
      code,
      message,
      status,
    };
  }
}

export interface ErrorResponseData {
  code: number;
  message: string;
  status?: number;
}

export enum ResponseErrorCode {
  PARAM,
  NOT_FOUND,
}
