package com.ss.codetutor.entity.dtos;

import lombok.Data;

@Data
public class CodeTraceDto {
    private String code;
    private TraceEventDto[] trace;
}
