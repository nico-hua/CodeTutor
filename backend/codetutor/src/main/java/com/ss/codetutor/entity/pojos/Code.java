package com.ss.codetutor.entity.pojos;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 代码提交记录表
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("code")
public class Code implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 用户id
     */
    @TableField("userId")
    private Integer userId;

    /**
     * 代码
     */
    @TableField("code")
    private String code;

    /**
     * 代码url
     */
    @TableField("url")
    private String url;

    /**
     * 提交时间
     */
    @TableField("submitted_at")
    private LocalDateTime submittedAt;

    public Code(Integer userId, String code, String url, LocalDateTime submittedAt) {
        this.userId = userId;
        this.code = code;
        this.url = url;
        this.submittedAt = submittedAt;
    }
}
