package com.example.dao;

import com.example.domain.Student;
import com.example.utils.DruidUtils;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class StudentDao {
    private QueryRunner runner = new QueryRunner(DruidUtils.getDataSource());

    /**
     * 1. 查询所有干员
     */
    public List<Student> findAll() {
        try {
            String sql = "SELECT * FROM student";
            return runner.query(sql, new BeanListHandler<>(Student.class));
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 2. 根据 ID 查询单个干员 (用于修改回显)
     */
    public Student findById(int id) {
        try {
            String sql = "SELECT * FROM student WHERE id = ?";
            return runner.query(sql, new BeanHandler<>(Student.class), id);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 3. 添加新干员
     * 注意：SQL里不写 id，让数据库自动生成 (AUTO_INCREMENT)
     */
    public void addStudent(Student s) {
        try {
            String sql = "INSERT INTO student(name, age, gender, major, department, avatar) VALUES(?, ?, ?, ?, ?, ?)";

            // 如果头像为空，设置默认值
            String avatarPath = (s.getAvatar() == null || s.getAvatar().trim().isEmpty())
                    ? "assets/avatar_default.png"
                    : s.getAvatar();

            // 如果专业为空，设置默认值
            String major = (s.getMajor() == null || s.getMajor().trim().isEmpty())
                    ? "特勤组"
                    : s.getMajor();

            runner.update(sql,
                    s.getName(),
                    s.getAge(),
                    s.getGender(),
                    major,             // 专业
                    s.getDepartment(), // 部门
                    avatarPath         // 头像
            );
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 4.1 修改基本信息 (含头像，但【排除】部门)
     */
    public void updateInfo(Student s) {
        try {
            // 如果头像没变（Servlet传过来是空），就不更新头像字段，保留原样
            // 这里为了简单，假设 Servlet 已经处理好逻辑，传过来的 s.avatar 是最终路径
            String sql = "UPDATE student SET name=?, age=?, gender=?, avatar=? WHERE id=?";
            runner.update(sql,
                    s.getName(),
                    s.getAge(),
                    s.getGender(),
                    s.getAvatar(), // 更新头像
                    s.getId()
            );
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 4.2 人事调动 (专管部门，其他不动)
     */
    public void transferStudent(int id, String newDepartment) {
        try {
            String sql = "UPDATE student SET department=? WHERE id=?";
            runner.update(sql, newDepartment, id);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 5. 解雇干员 (删除)
     */
    public void deleteStudent(int id) {
        try {
            String sql = "DELETE FROM student WHERE id=?";
            runner.update(sql, id);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 6. 多条件筛选查询 (已移除 StringUtils 依赖)
     * 使用 Java 原生写法判断空字符串
     */
    public List<Student> search(String department, String gender, String idStr, String ageStr) {
        try {
            StringBuilder sql = new StringBuilder("SELECT * FROM student WHERE 1=1 ");
            List<Object> params = new ArrayList<>();

            // --- 使用原生 Java 判断非空 ---

            // 1. 部门筛选
            if (department != null && !department.trim().isEmpty()) {
                sql.append(" AND department = ? ");
                params.add(department);
            }

            // 2. 性别筛选
            if (gender != null && !gender.trim().isEmpty()) {
                sql.append(" AND gender = ? ");
                params.add(gender);
            }

            // 3. ID 筛选
            if (idStr != null && !idStr.trim().isEmpty()) {
                sql.append(" AND id = ? ");
                params.add(Integer.parseInt(idStr));
            }

            // 4. 年龄筛选
            if (ageStr != null && !ageStr.trim().isEmpty()) {
                sql.append(" AND age = ? ");
                params.add(Integer.parseInt(ageStr));
            }

            return runner.query(sql.toString(), new BeanListHandler<>(Student.class), params.toArray());

        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }
}