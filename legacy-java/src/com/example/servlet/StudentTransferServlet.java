package com.example.servlet;

import com.example.dao.StudentDao;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/transferStudent")
public class StudentTransferServlet extends HttpServlet {
    private StudentDao studentDao = new StudentDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");

        // 只接收 ID 和 新部门
        String idStr = req.getParameter("id");
        String newDepartment = req.getParameter("department");

        if (idStr != null && newDepartment != null) {
            int id = Integer.parseInt(idStr);
            // 调用 DAO 的调动方法
            studentDao.transferStudent(id, newDepartment);
        }

        resp.sendRedirect(req.getContextPath() + "/listStudent");
    }
}