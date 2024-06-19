package com.ss.codetutor.controller;

import com.ss.codetutor.entity.pojos.Code;
import com.ss.codetutor.service.CodeService;
import com.ss.codetutor.utils.ResponseResult;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@Api(tags= "代码接口")
@RequestMapping("/api/code")
public class CodeController {
    @Autowired
    private CodeService codeService;

    @PostMapping("/getCodeTrace")
    @ApiOperation("根据代码获取代码跟踪")
    public ResponseResult getCodeTrace(@RequestBody String requestBody){
        return codeService.getCodeTrace(requestBody);
    }

    @PostMapping("/getCodeTraceByUrl")
    @ApiOperation("根据代码URL获取代码跟踪")
    public ResponseResult getCodeTraceByUrl(@RequestBody String requestBody){
        return codeService.getCodeTraceByUrl(requestBody);
    }

    @GetMapping("/getAllCodeRecorder")
    @ApiOperation("按照时间区间获取全部代码提交记录")
    public ResponseResult getAllCodeRecorder(@Param("interval") Integer interval){
        return codeService.getAllCodeRecorder(interval);
    }

    @GetMapping("/getCodeRecorderById")
    @ApiOperation("根据id获取代码提交记录")
    public ResponseResult getCodeRecorderById(@Param("id") Integer id){
        return codeService.getCodeRecorderById(id);
    }

    @DeleteMapping("/recorder/{id}")
    @ApiOperation("根据id删除代码提交记录")
    public ResponseResult deleteRecorderById(@PathVariable Integer id){
        return codeService.deleteRecorderById(id);
    }
}













