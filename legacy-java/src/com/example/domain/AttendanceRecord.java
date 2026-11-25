package com.example.domain;

public class AttendanceRecord {
    private Student student; // 包含头像、姓名、ID、部门
    private int days;        // 本月出勤天数
    private String status;   // 状态 (正常/异常/缺勤)

    public AttendanceRecord(Student student, int days) {
        this.student = student;
        this.days = days;
        // 简单逻辑：小于22天算异常
        this.status = (days >= 22) ? "正常" : "异常";
    }

    public Student getStudent() { return student; }
    public int getDays() { return days; }
    public String getStatus() { return status; }
}