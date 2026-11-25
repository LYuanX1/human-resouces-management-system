package com.example.servlet;

import com.example.dao.StudentDao;
import com.example.domain.Student;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/missionDispatch")
public class MissionDispatchServlet extends HttpServlet {
    private StudentDao studentDao = new StudentDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 1. 获取所有干员列表 (供弹窗选择)
        List<Student> operatorList = studentDao.findAll();
        req.setAttribute("operatorList", operatorList);

        // 2. 转发到任务页面
        req.getRequestDispatcher("/mission.jsp").forward(req, resp);
    }
}