package com.example.servlet;

import com.example.dao.StudentDao;
import com.example.domain.MaterialRequest;
import com.example.domain.Student;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@WebServlet("/materialList")
public class MaterialListServlet extends HttpServlet {
    private StudentDao studentDao = new StudentDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 1. 获取真实干员
        List<Student> students = studentDao.findAll();
        List<MaterialRequest> list = new ArrayList<>();
        Random random = new Random();

        // 2. 预设数据池
        String[] gearTypes = {
                "新兵制式装备", "标准制式装备", "精锐制式装备", "特种制式装备", "定制装备"
        };

        String[] reasons = {
                "新兵入列，申请基础单兵作战套件。",
                "原装备在'零号大坝'行动中损毁，申请补发。",
                "晋升考核通过，申请换装高阶装备。",
                "执行潜入任务，需要轻量化特种装备。",
                "枪械部件老化，申请更换整套维护工具及备件。",
                "为应对极端天气，申请极地作战服。"
        };

        // 3. 生成申领单
        int idCounter = 1024;
        for (Student s : students) {
            String gear = gearTypes[random.nextInt(gearTypes.length)];
            String reason = reasons[random.nextInt(reasons.length)];

            // 定制装备一般比较少，稍微降低点概率（逻辑演示）
            if (random.nextInt(10) > 8) gear = "定制装备";

            MaterialRequest reqItem = new MaterialRequest(
                    "MT-202512-" + idCounter++,
                    String.valueOf(s.getId()),
                    s.getName(),
                    s.getAvatar(),
                    s.getDepartment(),
                    reason,
                    gear
            );
            list.add(reqItem);
        }

        req.setAttribute("materialList", list);
        req.getRequestDispatcher("/material.jsp").forward(req, resp);
    }
}