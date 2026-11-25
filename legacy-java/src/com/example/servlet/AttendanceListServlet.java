package com.example.servlet;

import com.example.dao.StudentDao;
import com.example.domain.AttendanceRecord;
import com.example.domain.Student;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@WebServlet("/attendanceList")
public class AttendanceListServlet extends HttpServlet {
    private StudentDao studentDao = new StudentDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");

        // 1. 获取筛选参数
        String searchName = req.getParameter("name");
        String searchId = req.getParameter("id");
        String searchDept = req.getParameter("department");

        // 2. 获取所有干员
        List<Student> allStudents = studentDao.findAll();
        List<AttendanceRecord> attendanceList = new ArrayList<>();
        Random random = new Random();

        // 3. 遍历并筛选
        for (Student s : allStudents) {
            boolean match = true;

            // 筛选逻辑
            if (searchName != null && !searchName.isEmpty() && !s.getName().contains(searchName)) {
                match = false;
            }
            if (searchId != null && !searchId.isEmpty() && !String.valueOf(s.getId()).contains(searchId)) {
                match = false;
            }
            if (searchDept != null && !searchDept.isEmpty() && !s.getDepartment().equals(searchDept)) {
                match = false;
            }

            // 如果符合条件，生成考勤数据并添加
            if (match) {
                // 模拟出勤天数 (15 ~ 30天)
                int days = 15 + random.nextInt(16);
                attendanceList.add(new AttendanceRecord(s, days));
            }
        }

        // 4. 回传参数 (用于页面回显)
        req.setAttribute("attendanceList", attendanceList);
        req.setAttribute("searchName", searchName);
        req.setAttribute("searchId", searchId);
        req.setAttribute("searchDept", searchDept);

        req.getRequestDispatcher("/attendance.jsp").forward(req, resp);
    }
}