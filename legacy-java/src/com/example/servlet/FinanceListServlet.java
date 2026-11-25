package com.example.servlet;

import com.example.dao.StudentDao;
import com.example.domain.Reimbursement;
import com.example.domain.Student;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@WebServlet("/financeList")
public class FinanceListServlet extends HttpServlet {
    private StudentDao studentDao = new StudentDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 1. 获取数据库里真实的干员列表
        List<Student> students = studentDao.findAll();

        List<Reimbursement> financeList = new ArrayList<>();
        Random random = new Random();

        // 预设一些报销事由
        String[] reasons = {
                "采购战术手套一批，原配手套磨损严重。",
                "车辆维护费用，更换防弹轮胎。",
                "无人机电池组采购，备战下周演习。",
                "医疗物资紧急补充（止血带、绷带）。",
                "外勤任务差旅费报销（住宿/交通）。",
                "枪械精密维护保养工具组采购。",
                "夜视仪电池耗材补充。",
                "没注意，走跳水撤了",
                "从巴别塔上摔下来了",
                "陪唐王去找典狱长玩，忘记我是KD2.0的了",
                "去二员领AWM子弹，子弹镶脑门上了",
                "找鸟兽兽借火烧烤，他拿成巡飞弹了",
                "无名说跟他一起玩飞盘，他先来",
                "威龙说送我副耳机，我只听到滴滴声，还越来越快"
        };

        // 2. 遍历干员，随机生成报销单 (为了演示，假设每个干员都有一笔报销)
        // 实际开发中应该是查 finance 表，这里为了省事直接挂钩干员表
        int docIndex = 2025001;
        for (Student s : students) {
            // 随机事由
            String reason = reasons[random.nextInt(reasons.length)];
            // 随机金额 (500 - 5000)
            double amount = 500 + (random.nextDouble() * 4500);
            String formattedAmount = String.format("%.2f", amount); // 保留两位小数逻辑在前端处理，这里存double

            Reimbursement item = new Reimbursement(
                    "FN-" + docIndex++, // 单据号
                    String.valueOf(s.getId()), // 干员ID
                    s.getName(),        // 姓名
                    s.getAvatar(),      // 头像 (直接用 Student 的)
                    s.getDepartment(),  // 部门
                    reason,             // 事由
                    Double.parseDouble(formattedAmount) // 金额
            );
            financeList.add(item);
        }

        req.setAttribute("financeList", financeList);
        req.getRequestDispatcher("/finance.jsp").forward(req, resp);
    }
}