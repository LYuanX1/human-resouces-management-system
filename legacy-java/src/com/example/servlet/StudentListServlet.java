package com.example.servlet;

import com.example.dao.StudentDao;
import com.example.domain.Student; // 【修正】这里改成了 domain
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/listStudent")
public class StudentListServlet extends HttpServlet {
    private StudentDao studentDao = new StudentDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");

        // 1. 尝试接收搜索参数
        String department = req.getParameter("department");
        String gender = req.getParameter("gender");
        String idStr = req.getParameter("id");
        String ageStr = req.getParameter("age");

        List<Student> list;

        // 2. 判断是否为搜索模式
        boolean isSearch = (department != null && !department.isEmpty()) ||
                (gender != null && !gender.isEmpty()) ||
                (idStr != null && !idStr.isEmpty()) ||
                (ageStr != null && !ageStr.isEmpty());

        if (isSearch) {
            // 调用搜索
            list = studentDao.search(department, gender, idStr, ageStr);
        } else {
            // 没参数，查所有
            list = studentDao.findAll();
        }

        // 3. 存入 Request
        req.setAttribute("list", list);

        // 4. 回显搜索条件
        req.setAttribute("searchDept", department);
        req.setAttribute("searchGender", gender);
        req.setAttribute("searchId", idStr);
        req.setAttribute("searchAge", ageStr);

        // 5. 带着数据去 info.jsp
        req.getRequestDispatcher("/info.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }
}