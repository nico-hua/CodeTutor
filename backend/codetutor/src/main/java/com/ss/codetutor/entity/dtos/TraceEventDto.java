package com.ss.codetutor.entity.dtos;

import lombok.Data;

import java.util.Map;

@Data
public class TraceEventDto {
    private String event;
    private String func_name;
    private Object globals;
    private Object heap;
    private int line;
    private Object[] ordered_globals;
    private Object[] stack_to_render;
    private String stdout;
}
