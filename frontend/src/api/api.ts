const baseUrl = 'http://47.116.195.16:8080/';

const api = {
  getCodeTrace: 'api/code/getCodeTrace',
  getCodeTraceByUrl: 'api/code/getCodeTraceByUrl',
  getAllCodeRecoder: 'api/code/getAllCodeRecoder',
  getCodeRecoderById: 'api/code/getCodeRecoderById'
  
}

type Response<T> = {
  code: number,
  errorMessage: string | null,
  data: T
}

export {
  baseUrl,
  api
}

export type {
  Response
}