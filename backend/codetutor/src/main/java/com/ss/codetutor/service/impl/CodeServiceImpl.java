package com.ss.codetutor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.github.difflib.DiffUtils;
import com.github.difflib.patch.AbstractDelta;
import com.github.difflib.patch.Patch;
import com.google.gson.Gson;
import com.ss.codetutor.config.WebConfig;
import com.ss.codetutor.entity.dtos.CodeTraceDto;
import com.ss.codetutor.entity.dtos.UrlDto;
import com.ss.codetutor.entity.pojos.Code;
import com.ss.codetutor.entity.pojos.User;
import com.ss.codetutor.mapper.CodeMapper;
import com.ss.codetutor.service.CodeService;
import com.ss.codetutor.utils.ResponseResult;
import com.ss.codetutor.utils.ThreadLocalUtil;
import com.ss.codetutor.utils.enums.WebHttpCodeEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class CodeServiceImpl extends ServiceImpl<CodeMapper, Code> implements CodeService {
    private static final Double THRESHOLD = 0.2;
    private static final Gson gson = new Gson();
    @Autowired
    private WebConfig webConfig;

    @Override
    public ResponseResult getCodeTrace(String requestBody) {
        // 创建RestTemplate对象
        RestTemplate restTemplate = new RestTemplate();
        //设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type","application/json");
        //创建HttpEntity对象
        HttpEntity requestEntity = new HttpEntity<>(requestBody,headers);
        //发送Post请求
        ResponseEntity<CodeTraceDto> responseEntity = restTemplate.exchange(webConfig.getCodeTraceUrl(), HttpMethod.POST,requestEntity, CodeTraceDto.class);
        // 获取响应结果
        CodeTraceDto responseResult = responseEntity.getBody();
        // 获取当前userId
        User user= ThreadLocalUtil.getUser();
        Integer userId = user.getId();
        // 获取用户最新提交的代码
        Code latestSubmittedCodecode = getLatestSubmittedCode(userId);
        //若无提交记录，直接保存
        if (latestSubmittedCodecode == null) {
            Code code=new Code(userId,responseResult.getCode(),"", LocalDateTime.now());
            save(code);
        }
        else{
            // 若相差时间大于30分钟，直接保存
            if (latestSubmittedCodecode.getSubmittedAt().isBefore(LocalDateTime.now().minusMinutes(30))) {
                Code code=new Code(userId,responseResult.getCode(),"", LocalDateTime.now());
                save(code);
            }
            else{
                // 比较差异性
                if (isSameCodeWithThreshold(latestSubmittedCodecode.getCode(),responseResult.getCode(),THRESHOLD)) {
                    // 更新记录
                    latestSubmittedCodecode.setCode(responseResult.getCode());
                    latestSubmittedCodecode.setSubmittedAt(LocalDateTime.now());
                    updateById(latestSubmittedCodecode);
                }
                else{
                    // 保存
                    Code code=new Code(userId,responseResult.getCode(),"", LocalDateTime.now());
                    save(code);
                }
            }
        }
        //返回
        return new ResponseResult().okResult(responseResult);
    }

    @Override
    public ResponseResult getCodeTraceByUrl(String requestBody) {
        // 解析requestBody获取url
        UrlDto urlDto = gson.fromJson(requestBody, UrlDto.class);
        String url = urlDto.getUrl();
        if(url.trim().equals("")){
            return new ResponseResult().errorResult(WebHttpCodeEnum.PARAM_REQUIRE);
        }
        // 创建RestTemplate对象
        RestTemplate restTemplate = new RestTemplate();
        //设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type","application/json");
        //创建HttpEntity对象
        HttpEntity requestEntity = new HttpEntity<>(requestBody,headers);
        //发送Post请求
        ResponseEntity<CodeTraceDto> responseEntity = restTemplate.exchange(webConfig.getCodeTraceByUrlUrl(), HttpMethod.POST,requestEntity, CodeTraceDto.class);
        // 获取响应结果
        CodeTraceDto responseResult = responseEntity.getBody();
        // 如果代码为空，返回错误信息
        if (responseResult != null && responseResult.getCode().trim().equals("")) {
            return new ResponseResult().errorResult(WebHttpCodeEnum.PARAM_INVALID);
        }
        // 获取当前userId
        User user= ThreadLocalUtil.getUser();
        Integer userId = user.getId();
        // 获取用户最新提交的代码
        Code latestSubmittedCodecode = getLatestSubmittedCode(userId);
        //若无提交记录，直接保存
        if (latestSubmittedCodecode == null) {
            Code code=new Code(userId,responseResult.getCode(),url, LocalDateTime.now());
            save(code);
        }
        else{
            // 若相差时间大于30分钟，直接保存
            if (latestSubmittedCodecode.getSubmittedAt().isBefore(LocalDateTime.now().minusMinutes(30))) {
                Code code=new Code(userId,responseResult.getCode(),url, LocalDateTime.now());
                save(code);
            }
            else{
                // 比较差异性
                if (isSameCodeWithThreshold(latestSubmittedCodecode.getCode(),responseResult.getCode(),THRESHOLD)) {
                    // 更新记录
                    latestSubmittedCodecode.setCode(responseResult.getCode());
                    latestSubmittedCodecode.setSubmittedAt(LocalDateTime.now());
                    latestSubmittedCodecode.setUrl(url);
                    updateById(latestSubmittedCodecode);
                }
                else{
                    // 保存
                    Code code=new Code(userId,responseResult.getCode(),url, LocalDateTime.now());
                    save(code);
                }
            }
        }
        //返回
        return new ResponseResult().okResult(responseResult);
    }

    @Override
    public ResponseResult getAllCodeRecorder(Integer interval) {
        // 获取当前userId
        User user= ThreadLocalUtil.getUser();
        Integer userId = user.getId();
        // 获取提交记录
        LambdaQueryWrapper<Code> queryWrapper = new LambdaQueryWrapper<>();
        if(interval!=0){
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startDateTime = now.minusDays(interval);
            queryWrapper.eq(Code::getUserId, userId)
                    .ge(Code::getSubmittedAt, startDateTime)
                    .orderByDesc(Code::getSubmittedAt);
        }
        // 获取全部记录
        else{
            queryWrapper.eq(Code::getUserId, userId)
                    .orderByDesc(Code::getSubmittedAt);
        }
        List<Code> codeList = list(queryWrapper);
        return new ResponseResult().okResult(codeList);
    }

    @Override
    public ResponseResult getCodeRecorderById(Integer id) {
        LambdaQueryWrapper<Code> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Code::getId, id);
        Code code = getOne(queryWrapper);
        if (code == null) {
            return new ResponseResult().errorResult(WebHttpCodeEnum.DATA_NOT_EXIST);
        }
        return new ResponseResult().okResult(code);
    }

    @Override
    public ResponseResult deleteRecorderById(Integer id){
        if (removeById(id)) {
            User user= ThreadLocalUtil.getUser();
            Integer userId = user.getId();
            LambdaQueryWrapper<Code> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Code::getUserId, userId)
                    .orderByDesc(Code::getSubmittedAt);
            List<Code> codeList = list(queryWrapper);
            return new ResponseResult().okResult(codeList);
        }
        else{
            return new ResponseResult().errorResult(WebHttpCodeEnum.DATA_NOT_EXIST);
        }
    }

    /**
     * 判断两个代码是否相似
     */
    public boolean isSameCodeWithThreshold(String code1, String code2, double threshold) {
        List<String> original = Arrays.asList(code1.split("\n"));
        List<String> revised = Arrays.asList(code2.split("\n"));
        Patch<String> patch = DiffUtils.diff(original, revised);
        int totalLines = Math.max(original.size(), revised.size());
        int changeLines;
        int sourceLines = 0;
        int targetLines = 0;
        for (AbstractDelta<String> delta : patch.getDeltas()) {
            sourceLines += delta.getSource().size();
            targetLines += delta.getTarget().size();
        }
        changeLines = Math.max(sourceLines, targetLines);
        double changeRatio = (double) changeLines / totalLines;
        return changeRatio <= threshold;
    }

    /**
     * 获取用户最新提交的代码
     */
    public Code getLatestSubmittedCode(Integer userId) {
        LambdaQueryWrapper<Code> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Code::getUserId, userId)
                .orderByDesc(Code::getSubmittedAt)
                .last("LIMIT 1");

        return getOne(queryWrapper);
    }
}
