package com.example.domain;

public class Student {
    private int id;
    private String name;
    private int age;
    private String gender;
    private String major;      // 专业 (保留字段)
    private String department; // 新增：部门
    private String avatar;     // 新增：头像路径

    // 1. 无参构造方法 (必须有)
    public Student() {
    }

    // 2. 全参构造方法 (包含ID，查询/修改用)
    public Student(int id, String name, int age, String gender, String major, String department, String avatar) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.major = major;
        this.department = department;
        this.avatar = avatar;
    }

    // 3. 添加用构造方法 (不含ID)
    public Student(String name, int age, String gender, String major, String department, String avatar) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.major = major;
        this.department = department;
        this.avatar = avatar;
    }

    // --- Getter 和 Setter 方法 (这是解决报错的关键) ---

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }

    // ▼▼▼ 新增的 Getter/Setter ▼▼▼
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}