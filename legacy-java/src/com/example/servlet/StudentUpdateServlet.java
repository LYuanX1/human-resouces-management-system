package com.example.servlet;

import com.example.dao.StudentDao;
import com.example.domain.Student;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@WebServlet("/updateStudent")
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024 * 2,
        maxFileSize = 1024 * 1024 * 10,
        maxRequestSize = 1024 * 1024 * 50
)
public class StudentUpdateServlet extends HttpServlet {
    private StudentDao studentDao = new StudentDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");

        // 1. 接收基本参数
        int id = Integer.parseInt(req.getParameter("id"));
        String name = req.getParameter("name");
        int age = Integer.parseInt(req.getParameter("age"));
        String gender = req.getParameter("gender");

        // 接收旧头像路径 (如果用户没传新图，就用这个)
        String oldAvatar = req.getParameter("oldAvatar");

        // 2. 处理新头像上传
        String finalAvatar = oldAvatar; // 默认用旧的

        try {
            Part filePart = req.getPart("avatarFile");
            if (filePart != null && filePart.getSize() > 0 && filePart.getSubmittedFileName() != null && !filePart.getSubmittedFileName().isEmpty()) {
                String fileName = filePart.getSubmittedFileName();
                String ext = fileName.substring(fileName.lastIndexOf("."));
                String uniqueName = "avatar_" + UUID.randomUUID().toString() + ext;

                String uploadPath = getServletContext().getRealPath("/assets");
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) uploadDir.mkdir();

                filePart.write(uploadPath + File.separator + uniqueName);
                finalAvatar = "assets/" + uniqueName; // 更新为新路径
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 3. 封装对象 (注意：这里不设置 department，因为 DAO 的 updateInfo 方法也不更新 department)
        Student s = new Student();
        s.setId(id);
        s.setName(name);
        s.setAge(age);
        s.setGender(gender);
        s.setAvatar(finalAvatar);

        // 4. 调用专用的 updateInfo 方法
        studentDao.updateInfo(s);

        resp.sendRedirect(req.getContextPath() + "/listStudent");
    }
}