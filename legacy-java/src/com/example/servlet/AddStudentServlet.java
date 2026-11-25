package com.example.servlet;

import com.example.dao.StudentDao;
import com.example.domain.Student;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig; // 关键注解
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

// 1. 开启文件上传支持
@WebServlet("/addStudent")
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024 * 2, // 2MB
        maxFileSize = 1024 * 1024 * 10,      // 10MB
        maxRequestSize = 1024 * 1024 * 50    // 50MB
)
public class AddStudentServlet extends HttpServlet {
    private StudentDao studentDao = new StudentDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");

        // --- 1. 接收普通文本数据 ---
        // 注意：在 MultipartConfig 下，getParameter 依然可用
        String name = req.getParameter("name");
        String ageStr = req.getParameter("age");
        String gender = req.getParameter("gender");
        String department = req.getParameter("department");

        int age = 0;
        try { age = Integer.parseInt(ageStr); } catch (Exception e) { age = 0; }

        // --- 2. 处理头像上传 ---
        String avatarPath = "assets/avatar_default.png"; // 默认头像

        try {
            Part filePart = req.getPart("avatarFile"); // 获取页面上的 file 控件

            // 判断用户是否真的选了文件 (size > 0 且有文件名)
            if (filePart != null && filePart.getSize() > 0 && filePart.getSubmittedFileName() != null && !filePart.getSubmittedFileName().isEmpty()) {

                // 2.1 获取文件名和后缀
                String fileName = filePart.getSubmittedFileName();
                String ext = fileName.substring(fileName.lastIndexOf(".")); // 例如 .jpg

                // 2.2 生成唯一文件名 (绑定ID的核心：使用UUID防止重名混淆)
                String uniqueName = "avatar_" + UUID.randomUUID().toString() + ext;

                // 2.3 确定保存路径 (保存到 web/assets 目录下)
                String uploadPath = getServletContext().getRealPath("/assets");
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) uploadDir.mkdir(); // 如果目录不存在就创建

                // 2.4 执行保存
                filePart.write(uploadPath + File.separator + uniqueName);

                // 2.5 记录数据库路径
                avatarPath = "assets/" + uniqueName;
            }
        } catch (Exception e) {
            e.printStackTrace(); // 上传失败则保持默认头像
        }

        // --- 3. 封装对象并保存 ---
        Student s = new Student();
        s.setName(name);
        s.setAge(age);
        s.setGender(gender);
        s.setDepartment(department);
        s.setMajor("特勤组");
        s.setAvatar(avatarPath); // 设置刚才生成的唯一头像路径

        studentDao.addStudent(s);

        // --- 4. 跳转 ---
        resp.sendRedirect(req.getContextPath() + "/listStudent");
    }
}