package com.edtech.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("parent_bindings")
public class ParentBinding implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long parentId;
    private Long studentId;
    private String status; // PENDING, ACTIVE, REJECTED
    private String permissions; // JSON
    private Integer dailyTimeLimit;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
