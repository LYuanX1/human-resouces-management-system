package com.example.domain;

public class Reimbursement {
    private String id;          // 报销单号
    private String applicantId; // 申请人ID
    private String name;        // 申请人姓名
    private String avatar;      // 头像路径
    private String department;  // 部门
    private String reason;      // 申请事由
    private double amount;      // 金额

    // 构造方法
    public Reimbursement(String id, String applicantId, String name, String avatar, String department, String reason, double amount) {
        this.id = id;
        this.applicantId = applicantId;
        this.name = name;
        this.avatar = avatar;
        this.department = department;
        this.reason = reason;
        this.amount = amount;
    }

    // Getters
    public String getId() { return id; }
    public String getApplicantId() { return applicantId; }
    public String getName() { return name; }
    public String getAvatar() { return avatar; }
    public String getDepartment() { return department; }
    public String getReason() { return reason; }
    public double getAmount() { return amount; }
}