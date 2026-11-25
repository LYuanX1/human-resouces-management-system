package com.example.servlet;

import com.example.dao.UserDao; // 假设你有个UserDao
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");

        // 1. 获取参数
        String u = req.getParameter("username");
        String p = req.getParameter("password");

        // 2. 简单模拟验证 (或者调用你的 DAO)
        if("root".equals(u) && "root".equals(p)) {
            // 登录成功 -> 去 main.jsp
            resp.sendRedirect(req.getContextPath() + "/main.jsp");
        } else {
            // 失败 -> 回登录页
            resp.sendRedirect(req.getContextPath() + "/index.jsp?error=1");
        }
    }
}