package com.ss.codetutor.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ss.codetutor.entity.pojos.Code;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CodeMapper extends BaseMapper<Code> {
}
