package com.ss.codetutor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ss.codetutor.entity.dtos.CodeTraceDto;
import com.ss.codetutor.entity.dtos.TraceEventDto;
import com.ss.codetutor.utils.ResponseResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class CodeServiceTest {
    @Autowired
    private CodeService codeService;

    @Test
    @DisplayName("代码\"a=1\"")
    public void testGetCodeTrace1() throws JsonProcessingException {
        // 测试数据
        String requestBody = "{\"code\":\"a=1\"}";
        int expectedCode=200;
        String expectedErrorMessage="操作成功";
        String expectedDataCode="a=1";
        ResponseResult responseResult=codeService.getCodeTrace(requestBody);
        // code
        assertEquals(expectedCode,responseResult.getCode());
        // errorMessage
        assertEquals(expectedErrorMessage,responseResult.getErrorMessage());
        // data
        CodeTraceDto actualCodeTraceDto= (CodeTraceDto) responseResult.getData();
        // 代码
        assertEquals(expectedDataCode,actualCodeTraceDto.getCode());
        // 第一步
        TraceEventDto traceItem1=new TraceEventDto();
        traceItem1.setEvent("step_line");
        traceItem1.setFunc_name("<module>");
        traceItem1.setGlobals(new ObjectMapper().readValue("{}", Object.class));
        traceItem1.setHeap(new ObjectMapper().readValue("{}", Object.class));
        traceItem1.setLine(1);
        traceItem1.setOrdered_globals(new String[]{});
        traceItem1.setStack_to_render(new String[]{});
        traceItem1.setStdout("");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem1));
        // 第二步
        TraceEventDto traceItem2=new TraceEventDto();
        traceItem2.setEvent("return");
        traceItem2.setFunc_name("<module>");
        traceItem2.setGlobals(new ObjectMapper().readValue("{\"a\": [\"REF\", 1]}", Object.class));
        traceItem2.setHeap(new ObjectMapper().readValue("{\"1\": [\"HEAP_PRIMITIVE\", \"int\", 1]}", Object.class));
        traceItem2.setLine(1);
        traceItem2.setOrdered_globals(new String[]{"a"});
        traceItem2.setStack_to_render(new String[]{});
        traceItem2.setStdout("");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem2));
    }

    @Test
    @DisplayName("代码为空")
    public void testGetCodeTrace2() throws JsonProcessingException {
        // 测试数据
        String requestBody = "{\"code\":\"\"}";
        int expectedCode=200;
        String expectedErrorMessage="操作成功";
        String expectedDataCode="";
        ResponseResult responseResult=codeService.getCodeTrace(requestBody);
        // code
        assertEquals(expectedCode,responseResult.getCode());
        // errorMessage
        assertEquals(expectedErrorMessage,responseResult.getErrorMessage());
        // data
        CodeTraceDto actualCodeTraceDto= (CodeTraceDto) responseResult.getData();
        // 代码
        assertEquals(expectedDataCode,actualCodeTraceDto.getCode());
        // 第一步
        TraceEventDto traceItem1=new TraceEventDto();
        traceItem1.setEvent("return");
        traceItem1.setFunc_name("<module>");
        traceItem1.setGlobals(new ObjectMapper().readValue("{}", Object.class));
        traceItem1.setHeap(new ObjectMapper().readValue("{}", Object.class));
        traceItem1.setLine(0);
        traceItem1.setOrdered_globals(new String[]{});
        traceItem1.setStack_to_render(new String[]{});
        traceItem1.setStdout("");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem1));
    }

    @Test
    @DisplayName("冒泡排序")
    public void testGetCodeTrace3() throws JsonProcessingException {
        // 测试数据
        String requestBody = "{\"code\": \"# -*- coding: utf-8 -*-\\n# @Time    : 2022/8/17 15:25\\n# @Author  : 曹世鸿\\n# @File    : BubbleSort.py\\n# @Description: 冒泡排序\\n\\n\\\"\\\"\\\"\\n冒泡排序:\\n只会操作相邻的两个数据。每次冒泡操作都会对相邻的两个元素进⾏⽐较，看是否满⾜⼤⼩关系要求。\\n如果不满⾜就让它俩互换。⼀次冒泡会让⾄少⼀个元素移动到它应该在的位置，重复n次，就完成了n个数据的排序⼯作。\\n优化点：\\n当某次冒泡操作已经没有数据交换时，说明已经达到完全有序，不⽤再继续执⾏后续的冒泡操作\\n\\\"\\\"\\\"\\n\\n\\nclass BubbleSort:\\n    def __init__(self, sort_list):\\n        self.sort_list = sort_list\\n\\n    def bubble(self):\\n        length = len(self.sort_list)\\n        bubble_flag = True\\n        while bubble_flag:\\n            is_bubble = False\\n            for i in range(length - 1):\\n                if self.sort_list[i] > self.sort_list[i+1]:\\n                    tmp = self.sort_list[i]\\n                    self.sort_list[i] = self.sort_list[i+1]\\n                    self.sort_list[i+1] = tmp\\n                    is_bubble = True\\n            if is_bubble is False:\\n                bubble_flag = False\\n        return self.sort_list\\n\\n\\nif __name__ == '__main__':\\n    list1 = BubbleSort([4, 16, 0, 2, 7, 3, 2, 10, 9, 8, 5])\\n    print(list1.bubble())\\n\"}";
        int expectedCode=200;
        String expectedErrorMessage="操作成功";
        String expectedDataCode="# -*- coding: utf-8 -*-\n# @Time    : 2022/8/17 15:25\n# @Author  : 曹世鸿\n# @File    : BubbleSort.py\n# @Description: 冒泡排序\n\n\"\"\"\n冒泡排序:\n只会操作相邻的两个数据。每次冒泡操作都会对相邻的两个元素进⾏⽐较，看是否满⾜⼤⼩关系要求。\n如果不满⾜就让它俩互换。⼀次冒泡会让⾄少⼀个元素移动到它应该在的位置，重复n次，就完成了n个数据的排序⼯作。\n优化点：\n当某次冒泡操作已经没有数据交换时，说明已经达到完全有序，不⽤再继续执⾏后续的冒泡操作\n\"\"\"\n\n\nclass BubbleSort:\n    def __init__(self, sort_list):\n        self.sort_list = sort_list\n\n    def bubble(self):\n        length = len(self.sort_list)\n        bubble_flag = True\n        while bubble_flag:\n            is_bubble = False\n            for i in range(length - 1):\n                if self.sort_list[i] > self.sort_list[i+1]:\n                    tmp = self.sort_list[i]\n                    self.sort_list[i] = self.sort_list[i+1]\n                    self.sort_list[i+1] = tmp\n                    is_bubble = True\n            if is_bubble is False:\n                bubble_flag = False\n        return self.sort_list\n\n\nif __name__ == '__main__':\n    list1 = BubbleSort([4, 16, 0, 2, 7, 3, 2, 10, 9, 8, 5])\n    print(list1.bubble())\n";
        ResponseResult responseResult=codeService.getCodeTrace(requestBody);
        // code
        assertEquals(expectedCode,responseResult.getCode());
        // errorMessage
        assertEquals(expectedErrorMessage,responseResult.getErrorMessage());
        // data
        CodeTraceDto actualCodeTraceDto= (CodeTraceDto) responseResult.getData();
        // 代码
        assertEquals(expectedDataCode,actualCodeTraceDto.getCode());
        // 第一步
        TraceEventDto traceItem1=new TraceEventDto();
        traceItem1.setEvent("step_line");
        traceItem1.setFunc_name("<module>");
        traceItem1.setGlobals(new ObjectMapper().readValue("{}", Object.class));
        traceItem1.setHeap(new ObjectMapper().readValue("{}", Object.class));
        traceItem1.setLine(7);
        traceItem1.setOrdered_globals(new String[]{});
        traceItem1.setStack_to_render(new String[]{});
        traceItem1.setStdout("");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem1));
        // 排序开始
        TraceEventDto traceItem2=new TraceEventDto();
        traceItem2.setEvent("call");
        traceItem2.setFunc_name("__init__");
        traceItem2.setGlobals(new ObjectMapper().readValue("{\"BubbleSort\": [\n" +
                "                        \"IMPORTED_FAUX_PRIMITIVE\",\n" +
                "                        \"imported class\"\n" +
                "                    ]}", Object.class));
        traceItem2.setHeap(new ObjectMapper().readValue("{\"1\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"BubbleSort\"\n" +
                "                    ],\n" +
                "                    \"10\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        9\n" +
                "                    ],\n" +
                "                    \"11\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        8\n" +
                "                    ],\n" +
                "                    \"12\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        5\n" +
                "                    ],\n" +
                "                    \"2\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            3\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            4\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            5\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            6\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            6\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            10\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            11\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            12\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"3\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        4\n" +
                "                    ],\n" +
                "                    \"4\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        16\n" +
                "                    ],\n" +
                "                    \"5\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        0\n" +
                "                    ],\n" +
                "                    \"6\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        2\n" +
                "                    ],\n" +
                "                    \"7\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        7\n" +
                "                    ],\n" +
                "                    \"8\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        3\n" +
                "                    ],\n" +
                "                    \"9\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        10\n" +
                "                    ]}", Object.class));
        traceItem2.setLine(17);
        traceItem2.setOrdered_globals(new String[]{"BubbleSort"});
        Object[] objects=new Object[1];
        objects[0]=new ObjectMapper().readValue("{ \"encoded_locals\": {\n" +
                "                            \"self\": [\n" +
                "                                \"REF\",\n" +
                "                                1\n" +
                "                            ],\n" +
                "                            \"sort_list\": [\n" +
                "                                \"REF\",\n" +
                "                                2\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 1,\n" +
                "                        \"func_name\": \"__init__\",\n" +
                "                        \"is_highlighted\": true,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": false,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \"self\",\n" +
                "                            \"sort_list\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"__init___f1\"}",Object.class);
        traceItem2.setStack_to_render(objects);
        traceItem2.setStdout("");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem2));
        // return
        TraceEventDto traceItem3=new TraceEventDto();
        traceItem3.setEvent("return");
        traceItem3.setFunc_name("<module>");
        traceItem3.setGlobals(new ObjectMapper().readValue("{\"BubbleSort\": [\n" +
                "                        \"IMPORTED_FAUX_PRIMITIVE\",\n" +
                "                        \"imported class\"\n" +
                "                    ],\n" +
                "                    \"list1\": [\n" +
                "                        \"REF\",\n" +
                "                        1\n" +
                "                    ]}", Object.class));
        traceItem3.setHeap(new ObjectMapper().readValue("{\"1\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"BubbleSort\",\n" +
                "                        [\n" +
                "                            [\n" +
                "                                \"REF\",\n" +
                "                                13\n" +
                "                            ],\n" +
                "                            [\n" +
                "                                \"REF\",\n" +
                "                                2\n" +
                "                            ]\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"10\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        9\n" +
                "                    ],\n" +
                "                    \"11\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        8\n" +
                "                    ],\n" +
                "                    \"12\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        5\n" +
                "                    ],\n" +
                "                    \"13\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"str\",\n" +
                "                        \"sort_list\"\n" +
                "                    ],\n" +
                "                    \"14\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"NoneType\",\n" +
                "                        null\n" +
                "                    ],\n" +
                "                    \"15\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        11\n" +
                "                    ],\n" +
                "                    \"17\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"bool\",\n" +
                "                        false\n" +
                "                    ],\n" +
                "                    \"2\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            5\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            6\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            6\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            3\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            12\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            11\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            10\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            4\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"3\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        4\n" +
                "                    ],\n" +
                "                    \"4\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        16\n" +
                "                    ],\n" +
                "                    \"5\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        0\n" +
                "                    ],\n" +
                "                    \"6\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        2\n" +
                "                    ],\n" +
                "                    \"7\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        7\n" +
                "                    ],\n" +
                "                    \"8\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        3\n" +
                "                    ],\n" +
                "                    \"9\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        10\n" +
                "                    ]}", Object.class));
        traceItem3.setLine(38);
        traceItem3.setOrdered_globals(new String[]{ "BubbleSort", "list1"});
        Object[] objects1=new Object[2];
        objects1[0]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                14\n" +
                "                            ],\n" +
                "                            \"self\": [\n" +
                "                                \"REF\",\n" +
                "                                1\n" +
                "                            ],\n" +
                "                            \"sort_list\": [\n" +
                "                                \"REF\",\n" +
                "                                2\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 1,\n" +
                "                        \"func_name\": \"__init__\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \"self\",\n" +
                "                            \"sort_list\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"__init___f1_z\"}",Object.class);
        objects1[1]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                2\n" +
                "                            ],\n" +
                "                            \"bubble_flag\": [\n" +
                "                                \"REF\",\n" +
                "                                17\n" +
                "                            ],\n" +
                "                            \"i\": [\n" +
                "                                \"REF\",\n" +
                "                                10\n" +
                "                            ],\n" +
                "                            \"is_bubble\": [\n" +
                "                                \"REF\",\n" +
                "                                17\n" +
                "                            ],\n" +
                "                            \"length\": [\n" +
                "                                \"REF\",\n" +
                "                                15\n" +
                "                            ],\n" +
                "                            \"self\": [\n" +
                "                                \"REF\",\n" +
                "                                1\n" +
                "                            ],\n" +
                "                            \"tmp\": [\n" +
                "                                \"REF\",\n" +
                "                                7\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 2,\n" +
                "                        \"func_name\": \"bubble\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \"self\",\n" +
                "                            \"length\",\n" +
                "                            \"bubble_flag\",\n" +
                "                            \"is_bubble\",\n" +
                "                            \"i\",\n" +
                "                            \"tmp\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"bubble_f2_z\"}",Object.class);
        traceItem3.setStack_to_render(objects1);
        traceItem3.setStdout("[0, 2, 2, 3, 4, 5, 7, 8, 9, 10, 16]\n");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem3));
    }

    @Test
    @DisplayName("动态规划")
    public void testGetCodeTrace4() throws JsonProcessingException {
        // 测试数据
        String requestBody = "{\"code\": \"def Lcs_length(x,y):#定义一个Lcs_length函数\\n    m = len(x)#m=获取传进来x的长度\\n    n = len(y)#n=获取传进来y的长度\\n    c = [[0 for _ in range(n+1)] for _ in range (m+1)]#定义一个二维列表c 长度为m+1，n+1 多一个空序列的位置\\n    for i  in range(1,m+1):#i从1开始，因为i=0是空序列 到最后一个位置\\n        for j in range(1,n+1):#j从1开始，因为j=0是空序列 到最后一个位置\\n            if x[i-1] == y[j-1]:#当x[i-1]和y[j-1]位置上字符匹配的时候\\n                c[i][j] = c[i-1][j-1] +1#二维列表当前位置的值等于左上方的值+1\\n            else:#当x[i-1]和y[j-1]位置上字符不匹配的时候\\n                c[i][j] = max(c[i-1][j],c[i][j-1])#二维列表当前位置的值等于左方和上方的最大的值\\n    for _ in c:#打印二维列表\\n        print(_)#打印二维列表\\n    return c[m][n]#返回c[m][n]\\nprint(Lcs_length('ABCBDAB','BDCABA'))\\ndef Lcs(x,y):#定义一个Lcs函数\\n    m = len(x)#m=获取传进来x的长度\\n    n = len(y)#n获取传进来y的长度\\n    c = [[0 for _ in range(n+1)] for _ in range (m+1)]#定义一个二维列表c 长度为m+1，n+1 多一个空序列的位置\\n    b = [[0 for _ in range(n+1)] for _ in range (m+1)]#定义一个二维列表b 长度为m+1，n+1 多一个空序列的位置\\n    for i  in range(1,m+1):#i从1开始，因为i=0是空序列 到最后一个位置\\n        for j in range(1,n+1):#j从1开始，因为j=0是空序列 到最后一个位置\\n            if x[i-1] == y[j-1]:# i j位置上字符匹配的时候，来自于左上方+1\\n                c[i][j] = c[i-1][j-1] +1##二维列表当前位置的值等于左上方的值+1\\n                b[i][j] = 1 #二维列表当前位置的值等于1 来自左上方为1 来自上方为2 来自左方为3\\n            elif c[i-1][j] > c[i][j-1]:#i位置上字符匹配的时候，来自于左方\\n                c[i][j] = c[i-1][j]#二维列表当前位置的值等于上方的值\\n                b[i][j] = 2#二维列表当前位置的值等于2 来自上方\\n            else:# j位置上字符匹配的时候，来自于上方\\n                c[i][j] = c[i][j-1]#二维列表当前位置的值等于左方的值\\n                b[i][j] = 3#二维列表当前位置的值等于3 来自左方\\n    return c[m][n],b#返回c[m][n]和b\\ndef Lcs_trackback(x,y):#定义一个Lcs_trackback函数 回溯来自左上的的值\\n    c,b = Lcs(x,y)#调用Lcs函数\\n    i = len(x)#i=获取传进来x的长度\\n    j = len(y)#j获取传进来y的长度\\n    res = []#定义一个空列表 来存储回溯的值\\n    while i > 0 and j > 0:#当i或j不等于0的时候\\n        if b[i][j] == 1:# i j位置上字符匹配的时候，来自于左上方\\n            res.append(x[i-1])#把当前位置匹配的字符左上的的值添加到res列表中\\n            i -= 1#i减1 移动到左上\\n            j -= 1#j减1 移动到左上\\n        elif b[i][j] == 2:# i位置上字符匹配的时候，来自于上方\\n            i -= 1#i减1 移动到上方\\n        else:# j位置上字符匹配的时候，来自于左方\\n            j -= 1#j减1 移动到左方\\n    return \\\"\\\".join(reversed(res))#返回res列表 ，反转后的字符串\\nprint(Lcs_trackback('ABCBDAB','BDCABA'))\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\\n\"}";
        int expectedCode=200;
        String expectedErrorMessage="操作成功";
        String expectedDataCode="def Lcs_length(x,y):#定义一个Lcs_length函数\n    m = len(x)#m=获取传进来x的长度\n    n = len(y)#n=获取传进来y的长度\n    c = [[0 for _ in range(n+1)] for _ in range (m+1)]#定义一个二维列表c 长度为m+1，n+1 多一个空序列的位置\n    for i  in range(1,m+1):#i从1开始，因为i=0是空序列 到最后一个位置\n        for j in range(1,n+1):#j从1开始，因为j=0是空序列 到最后一个位置\n            if x[i-1] == y[j-1]:#当x[i-1]和y[j-1]位置上字符匹配的时候\n                c[i][j] = c[i-1][j-1] +1#二维列表当前位置的值等于左上方的值+1\n            else:#当x[i-1]和y[j-1]位置上字符不匹配的时候\n                c[i][j] = max(c[i-1][j],c[i][j-1])#二维列表当前位置的值等于左方和上方的最大的值\n    for _ in c:#打印二维列表\n        print(_)#打印二维列表\n    return c[m][n]#返回c[m][n]\nprint(Lcs_length('ABCBDAB','BDCABA'))\ndef Lcs(x,y):#定义一个Lcs函数\n    m = len(x)#m=获取传进来x的长度\n    n = len(y)#n获取传进来y的长度\n    c = [[0 for _ in range(n+1)] for _ in range (m+1)]#定义一个二维列表c 长度为m+1，n+1 多一个空序列的位置\n    b = [[0 for _ in range(n+1)] for _ in range (m+1)]#定义一个二维列表b 长度为m+1，n+1 多一个空序列的位置\n    for i  in range(1,m+1):#i从1开始，因为i=0是空序列 到最后一个位置\n        for j in range(1,n+1):#j从1开始，因为j=0是空序列 到最后一个位置\n            if x[i-1] == y[j-1]:# i j位置上字符匹配的时候，来自于左上方+1\n                c[i][j] = c[i-1][j-1] +1##二维列表当前位置的值等于左上方的值+1\n                b[i][j] = 1 #二维列表当前位置的值等于1 来自左上方为1 来自上方为2 来自左方为3\n            elif c[i-1][j] > c[i][j-1]:#i位置上字符匹配的时候，来自于左方\n                c[i][j] = c[i-1][j]#二维列表当前位置的值等于上方的值\n                b[i][j] = 2#二维列表当前位置的值等于2 来自上方\n            else:# j位置上字符匹配的时候，来自于上方\n                c[i][j] = c[i][j-1]#二维列表当前位置的值等于左方的值\n                b[i][j] = 3#二维列表当前位置的值等于3 来自左方\n    return c[m][n],b#返回c[m][n]和b\ndef Lcs_trackback(x,y):#定义一个Lcs_trackback函数 回溯来自左上的的值\n    c,b = Lcs(x,y)#调用Lcs函数\n    i = len(x)#i=获取传进来x的长度\n    j = len(y)#j获取传进来y的长度\n    res = []#定义一个空列表 来存储回溯的值\n    while i > 0 and j > 0:#当i或j不等于0的时候\n        if b[i][j] == 1:# i j位置上字符匹配的时候，来自于左上方\n            res.append(x[i-1])#把当前位置匹配的字符左上的的值添加到res列表中\n            i -= 1#i减1 移动到左上\n            j -= 1#j减1 移动到左上\n        elif b[i][j] == 2:# i位置上字符匹配的时候，来自于上方\n            i -= 1#i减1 移动到上方\n        else:# j位置上字符匹配的时候，来自于左方\n            j -= 1#j减1 移动到左方\n    return \"\".join(reversed(res))#返回res列表 ，反转后的字符串\nprint(Lcs_trackback('ABCBDAB','BDCABA'))\n\n\n\n\n\n\n\n\n\n\n\n";
        ResponseResult responseResult=codeService.getCodeTrace(requestBody);
        // code
        assertEquals(expectedCode,responseResult.getCode());
        // errorMessage
        assertEquals(expectedErrorMessage,responseResult.getErrorMessage());
        // data
        CodeTraceDto actualCodeTraceDto= (CodeTraceDto) responseResult.getData();
        // 代码
        assertEquals(expectedDataCode,actualCodeTraceDto.getCode());
        // 第一步
        TraceEventDto traceItem1=new TraceEventDto();
        traceItem1.setEvent("step_line");
        traceItem1.setFunc_name("<module>");
        traceItem1.setGlobals(new ObjectMapper().readValue("{ \"Lcs_length\": [\n" +
                "                        \"IMPORTED_FAUX_PRIMITIVE\",\n" +
                "                        \"imported object\"]}", Object.class));
        traceItem1.setHeap(new ObjectMapper().readValue("{}", Object.class));
        traceItem1.setLine(14);
        traceItem1.setOrdered_globals(new String[]{"Lcs_length"});
        traceItem1.setStack_to_render(new String[]{});
        traceItem1.setStdout("");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem1));
        // 打印结果
        TraceEventDto traceItem2=new TraceEventDto();
        traceItem2.setEvent("return");
        traceItem2.setFunc_name("Lcs_length");
        traceItem2.setGlobals(new ObjectMapper().readValue("{\"Lcs_length\": [\n" +
                "                        \"IMPORTED_FAUX_PRIMITIVE\",\n" +
                "                        \"imported object\"\n" +
                "                    ]}", Object.class));
        traceItem2.setHeap(new ObjectMapper().readValue("{\"1\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"str\",\n" +
                "                        \"ABCBDAB\"\n" +
                "                    ],\n" +
                "                    \"10\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        3\n" +
                "                    ],\n" +
                "                    \"11\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        4\n" +
                "                    ],\n" +
                "                    \"13\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"14\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"range_iterator\"\n" +
                "                    ],\n" +
                "                    \"15\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"16\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"range_iterator\"\n" +
                "                    ],\n" +
                "                    \"17\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"18\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"range_iterator\"\n" +
                "                    ],\n" +
                "                    \"19\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"2\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"str\",\n" +
                "                        \"BDCABA\"\n" +
                "                    ],\n" +
                "                    \"20\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"range_iterator\"\n" +
                "                    ],\n" +
                "                    \"21\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            10\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            10\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"22\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"range_iterator\"\n" +
                "                    ],\n" +
                "                    \"23\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            10\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            10\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"24\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"range_iterator\"\n" +
                "                    ],\n" +
                "                    \"25\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            10\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            10\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            11\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"26\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"range_iterator\"\n" +
                "                    ],\n" +
                "                    \"27\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            7\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            8\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            9\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            10\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            11\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            11\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"28\": [\n" +
                "                        \"LIST\",\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            13\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            15\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            17\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            19\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            21\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            23\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            25\n" +
                "                        ],\n" +
                "                        [\n" +
                "                            \"REF\",\n" +
                "                            27\n" +
                "                        ]\n" +
                "                    ],\n" +
                "                    \"3\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        7\n" +
                "                    ],\n" +
                "                    \"4\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        6\n" +
                "                    ],\n" +
                "                    \"5\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"range_iterator\"\n" +
                "                    ],\n" +
                "                    \"6\": [\n" +
                "                        \"INSTANCE\",\n" +
                "                        \"range_iterator\"\n" +
                "                    ],\n" +
                "                    \"7\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        0\n" +
                "                    ],\n" +
                "                    \"8\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        1\n" +
                "                    ],\n" +
                "                    \"9\": [\n" +
                "                        \"HEAP_PRIMITIVE\",\n" +
                "                        \"int\",\n" +
                "                        2\n" +
                "                    ]}", Object.class));
        traceItem2.setLine(13);
        traceItem2.setOrdered_globals(new String[]{"Lcs_length"});
        Object[] objects=new Object[10];
        objects[0]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                27\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                11\n" +
                "                            ],\n" +
                "                            \"c\": [\n" +
                "                                \"REF\",\n" +
                "                                28\n" +
                "                            ],\n" +
                "                            \"i\": [\n" +
                "                                \"REF\",\n" +
                "                                3\n" +
                "                            ],\n" +
                "                            \"j\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"m\": [\n" +
                "                                \"REF\",\n" +
                "                                3\n" +
                "                            ],\n" +
                "                            \"n\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"x\": [\n" +
                "                                \"REF\",\n" +
                "                                1\n" +
                "                            ],\n" +
                "                            \"y\": [\n" +
                "                                \"REF\",\n" +
                "                                2\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 1,\n" +
                "                        \"func_name\": \"Lcs_length\",\n" +
                "                        \"is_highlighted\": true,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": false,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \"x\",\n" +
                "                            \"y\",\n" +
                "                            \"m\",\n" +
                "                            \"c\",\n" +
                "                            \"i\",\n" +
                "                            \"j\",\n" +
                "                            \"_\",\n" +
                "                            \"n\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"Lcs_length_f1\"}",Object.class);
        objects[1]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \".0\": [\n" +
                "                                \"REF\",\n" +
                "                                5\n" +
                "                            ],\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                3\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                28\n" +
                "                            ],\n" +
                "                            \"n\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 2,\n" +
                "                        \"func_name\": \"<listcomp>\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \".0\",\n" +
                "                            \"_\",\n" +
                "                            \"n\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"<listcomp>_f2_z\"}",Object.class);
        objects[2]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \".0\": [\n" +
                "                                \"REF\",\n" +
                "                                6\n" +
                "                            ],\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                13\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 3,\n" +
                "                        \"func_name\": \"<listcomp>\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \".0\",\n" +
                "                            \"_\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"<listcomp>_f3_z\"}",Object.class);
        objects[3]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \".0\": [\n" +
                "                                \"REF\",\n" +
                "                                14\n" +
                "                            ],\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                15\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 4,\n" +
                "                        \"func_name\": \"<listcomp>\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \".0\",\n" +
                "                            \"_\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"<listcomp>_f4_z\"}",Object.class);
        objects[4]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \".0\": [\n" +
                "                                \"REF\",\n" +
                "                                16\n" +
                "                            ],\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                17\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 5,\n" +
                "                        \"func_name\": \"<listcomp>\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \".0\",\n" +
                "                            \"_\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"<listcomp>_f5_z\"}",Object.class);
        objects[5]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \".0\": [\n" +
                "                                \"REF\",\n" +
                "                                18\n" +
                "                            ],\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                19\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 6,\n" +
                "                        \"func_name\": \"<listcomp>\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \".0\",\n" +
                "                            \"_\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"<listcomp>_f6_z\"}",Object.class);
        objects[6]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \".0\": [\n" +
                "                                \"REF\",\n" +
                "                                20\n" +
                "                            ],\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                21\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 7,\n" +
                "                        \"func_name\": \"<listcomp>\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \".0\",\n" +
                "                            \"_\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"<listcomp>_f7_z\"}",Object.class);
        objects[7]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \".0\": [\n" +
                "                                \"REF\",\n" +
                "                                22\n" +
                "                            ],\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                23\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 8,\n" +
                "                        \"func_name\": \"<listcomp>\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \".0\",\n" +
                "                            \"_\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"<listcomp>_f8_z\"}",Object.class);
        objects[8]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \".0\": [\n" +
                "                                \"REF\",\n" +
                "                                24\n" +
                "                            ],\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                25\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 9,\n" +
                "                        \"func_name\": \"<listcomp>\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \".0\",\n" +
                "                            \"_\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"<listcomp>_f9_z\"}",Object.class);
        objects[9]=new ObjectMapper().readValue("{\"encoded_locals\": {\n" +
                "                            \".0\": [\n" +
                "                                \"REF\",\n" +
                "                                26\n" +
                "                            ],\n" +
                "                            \"_\": [\n" +
                "                                \"REF\",\n" +
                "                                4\n" +
                "                            ],\n" +
                "                            \"__return__\": [\n" +
                "                                \"REF\",\n" +
                "                                27\n" +
                "                            ]\n" +
                "                        },\n" +
                "                        \"frame_id\": 10,\n" +
                "                        \"func_name\": \"<listcomp>\",\n" +
                "                        \"is_highlighted\": false,\n" +
                "                        \"is_parent\": false,\n" +
                "                        \"is_zombie\": true,\n" +
                "                        \"ordered_varnames\": [\n" +
                "                            \".0\",\n" +
                "                            \"_\",\n" +
                "                            \"__return__\"\n" +
                "                        ],\n" +
                "                        \"parent_frame_id_list\": [],\n" +
                "                        \"unique_hash\": \"<listcomp>_f10_z\"}",Object.class);
        traceItem2.setStack_to_render(objects);
        traceItem2.setStdout("[0, 0, 0, 0, 0, 0, 0]\n[0, 0, 0, 0, 1, 1, 1]\n[0, 1, 1, 1, 1, 2, 2]\n[0, 1, 1, 2, 2, 2, 2]\n[0, 1, 1, 2, 2, 3, 3]\n[0, 1, 2, 2, 2, 3, 3]\n[0, 1, 2, 2, 3, 3, 4]\n[0, 1, 2, 2, 3, 4, 4]\n");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem2));
    }

    @Test
    @DisplayName("代码异常")
    public void testGetCodeTrace5() throws JsonProcessingException {
        // 测试数据
        String requestBody = "{\"code\": \"# -*- coding: utf-8 -*-\\n# @Time    : 2022/8/9 11:19\\n# @Author  : 曹世鸿\\n# @File    : 链表栈.py\\n# @Description: 单链表实现栈\\n\\nfrom linkList import singleLinkList as Sll\\n\\n\\nclass LinkStack(Sll.SingleLinkList):\\n    def __init__(self, length=5, node=None):  # 默认长度5\\n        super(LinkStack, self).__init__(node)\\n        self.length = length\\n\\n    def push(self, data):\\n        if self.__get_len__() >= self.length:\\n            print(\\\"栈满了，入栈失败\\\")\\n            return False\\n        else:\\n            self.add_node(data)\\n\\n    def pop(self):\\n        if self.__get_len__() == 0:\\n            print(\\\"无数据可出栈\\\")\\n            return False\\n        else:\\n            self.delete_node(0)\\n\\n\\nif __name__ == '__main__':\\n    my_link_stack = LinkStack()\\n    my_link_stack.push(1)\\n    my_link_stack.push(2)\\n    my_link_stack.push(3)\\n    my_link_stack.push(4)\\n    my_link_stack.push(5)\\n    my_link_stack.__repr__()\\n    my_link_stack.push(6)\\n    my_link_stack.pop()\\n    my_link_stack.__repr__()\\n    my_link_stack.pop()\\n    my_link_stack.__repr__()\\n    my_link_stack.pop()\\n    my_link_stack.__repr__()\\n    my_link_stack.pop()\\n    my_link_stack.__repr__()\\n    my_link_stack.pop()\\n    my_link_stack.__repr__()\\n    my_link_stack.pop()\\n    my_link_stack.__repr__()\"}";
        int expectedCode=200;
        String expectedErrorMessage="操作成功";
        String expectedDataCode="# -*- coding: utf-8 -*-\n# @Time    : 2022/8/9 11:19\n# @Author  : 曹世鸿\n# @File    : 链表栈.py\n# @Description: 单链表实现栈\n\nfrom linkList import singleLinkList as Sll\n\n\nclass LinkStack(Sll.SingleLinkList):\n    def __init__(self, length=5, node=None):  # 默认长度5\n        super(LinkStack, self).__init__(node)\n        self.length = length\n\n    def push(self, data):\n        if self.__get_len__() >= self.length:\n            print(\"栈满了，入栈失败\")\n            return False\n        else:\n            self.add_node(data)\n\n    def pop(self):\n        if self.__get_len__() == 0:\n            print(\"无数据可出栈\")\n            return False\n        else:\n            self.delete_node(0)\n\n\nif __name__ == '__main__':\n    my_link_stack = LinkStack()\n    my_link_stack.push(1)\n    my_link_stack.push(2)\n    my_link_stack.push(3)\n    my_link_stack.push(4)\n    my_link_stack.push(5)\n    my_link_stack.__repr__()\n    my_link_stack.push(6)\n    my_link_stack.pop()\n    my_link_stack.__repr__()\n    my_link_stack.pop()\n    my_link_stack.__repr__()\n    my_link_stack.pop()\n    my_link_stack.__repr__()\n    my_link_stack.pop()\n    my_link_stack.__repr__()\n    my_link_stack.pop()\n    my_link_stack.__repr__()\n    my_link_stack.pop()\n    my_link_stack.__repr__()";
        ResponseResult responseResult=codeService.getCodeTrace(requestBody);
        // code
        assertEquals(expectedCode,responseResult.getCode());
        // errorMessage
        assertEquals(expectedErrorMessage,responseResult.getErrorMessage());
        // data
        CodeTraceDto actualCodeTraceDto= (CodeTraceDto) responseResult.getData();
        // 代码
        assertEquals(expectedDataCode,actualCodeTraceDto.getCode());
        // 第一步
        TraceEventDto traceItem1=new TraceEventDto();
        traceItem1.setEvent("step_line");
        traceItem1.setFunc_name("<module>");
        traceItem1.setGlobals(new ObjectMapper().readValue("{}", Object.class));
        traceItem1.setHeap(new ObjectMapper().readValue("{}", Object.class));
        traceItem1.setLine(7);
        traceItem1.setOrdered_globals(new String[]{});
        traceItem1.setStack_to_render(new String[]{});
        traceItem1.setStdout("");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem1));
        TraceEventDto traceItem2=new TraceEventDto();
        traceItem2.setEvent("exception");
        traceItem2.setFunc_name("<module>");
        traceItem2.setGlobals(new ObjectMapper().readValue("{}", Object.class));
        traceItem2.setHeap(new ObjectMapper().readValue("{}", Object.class));
        traceItem2.setLine(7);
        traceItem2.setOrdered_globals(new String[]{});
        traceItem2.setStack_to_render(new String[]{});
        traceItem2.setStdout("");
        assertTrue(Arrays.asList(actualCodeTraceDto.getTrace()).contains(traceItem1));
    }



}













