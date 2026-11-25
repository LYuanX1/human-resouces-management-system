package com.example.servlet;

import com.example.dao.StudentDao;
import com.example.domain.Student;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/preUpdateStudent")
public class StudentPreUpdateServlet extends HttpServlet {
    private StudentDao studentDao = new StudentDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 1. 获取要修改的干员 ID
        String idStr = req.getParameter("id");
        if (idStr != null && !idStr.isEmpty()) {
            int id = Integer.parseInt(idStr);

            // 2. 查出旧数据
            Student oldData = studentDao.findById(id);

            // 3. 【关键修复】把数据存入 request，命名为 "stu"
            // JSP 页面将通过 ${stu.id}, ${stu.name} 自动读取这些值
            req.setAttribute("stu", oldData);

            // 4. 转发到修改页面
            req.getRequestDispatcher("/update.jsp").forward(req, resp);
        }
    }
}