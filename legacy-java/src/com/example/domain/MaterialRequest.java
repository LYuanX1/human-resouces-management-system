package com.example.domain;

public class MaterialRequest {
    private String id;          // 单据编号 (MT-xxxx)
    private String applicantId; // 申请人ID
    private String name;        // 姓名
    private String avatar;      // 头像
    private String department;  // 部门
    private String reason;      // 申请事由
    private String materialType;// 申请物资类型 (新兵/标准/精锐...)

    public MaterialRequest(String id, String applicantId, String name, String avatar, String department, String reason, String materialType) {
        this.id = id;
        this.applicantId = applicantId;
        this.name = name;
        this.avatar = avatar;
        this.department = department;
        this.reason = reason;
        this.materialType = materialType;
    }

    // Getters
    public String getId() { return id; }
    public String getApplicantId() { return applicantId; }
    public String getName() { return name; }
    public String getAvatar() { return avatar; }
    public String getDepartment() { return department; }
    public String getReason() { return reason; }
    public String getMaterialType() { return materialType; }
}