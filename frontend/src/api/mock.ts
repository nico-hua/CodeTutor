import Mock from 'mockjs'
import { api, baseUrl } from './api'
import data from '../assets/test/testcases/sum-list.py3.json'

export function init() {
  Mock.mock(baseUrl + api.getCodeTrace, 'post', (req) => {
    const { code } = JSON.parse(req.body)
    return {
      code: 200,
      errorMessage: null,
      data
    }
  })
}