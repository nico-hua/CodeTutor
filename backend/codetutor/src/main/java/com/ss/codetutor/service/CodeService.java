package com.ss.codetutor.service;

import com.ss.codetutor.utils.ResponseResult;

public interface CodeService {
    ResponseResult getCodeTrace(String requestBody);

    ResponseResult getCodeTraceByUrl(String requestBody);

    ResponseResult getAllCodeRecorder(Integer interval);

    ResponseResult getCodeRecorderById(Integer id);

    ResponseResult deleteRecorderById(Integer id);
}
