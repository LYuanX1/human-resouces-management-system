<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%
  // 禁止缓存，防止页面样式加载旧的
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  response.setDateHeader("Expires", 0);
%>

<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>勤务考勤管理</title>
  <style>
    /* --- 1. 全局基础样式 --- */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { height: 100%; width: 100%; font-family: "Microsoft YaHei", sans-serif; overflow-x: hidden; }

    body {
      /* 保留原有的背景设置 */
      background-color: #0b1013;
      /* 注意：背景视频不受影响，因为它有 position: fixed */
      color: #fff;
      margin: 0;

      /* 【核心修改】开启 Flex 布局，垂直排列 */
      display: flex;
      flex-direction: column;
      min-height: 100vh; /* 保证最小高度占满屏幕 */
    }

    /* 核心：动态背景视频 */
    #bg-video {
      position: fixed; right: 0; bottom: 0;
      min-width: 100%; min-height: 100%;
      width: auto; height: auto;
      z-index: -100; /* 保证在最底层 */
      object-fit: cover;
      filter: brightness(0.5); /* 降低亮度，让文字更清晰 */
    }

    /* --- 导航栏 (通用升级版) --- */
    .navbar {
      width: 100%; height: 90px; background-color: #1F2D35;
      display: flex; justify-content: space-between; align-items: center;
      padding: 0 40px; position: fixed; top: 0; z-index: 1000;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }
    .nav-left .logo-img { height: 65px; width: auto; display: block; }

    /* 右侧容器：强制靠右，链接间距 25px */
    .nav-right {
      display: flex; align-items: center; gap: 25px; margin-left: auto;
    }

    /* 导航链接 */
    .nav-item { text-decoration: none; font-size: 16px; color: #9D9E9E; transition: color 0.3s; font-weight: 500; }
    .nav-item:hover, .nav-item.active { color: #fff; }

    /* --- 头像菜单容器 (新增) --- */
    .user-menu-container {
      position: relative; /* 作为定位基准 */
      margin-left: 35px;  /* 保持和文字链接的距离 */
      padding-bottom: 10px; /* 增加底部热区，防止鼠标移向下拉框时消失 */
      top: 5px; /* 微调垂直对齐 */
    }

    /* 头像本体 */
    .user-avatar {
      width: 45px; height: 45px; border-radius: 50%;
      background-color: #28a745; color: #fff;
      display: flex; justify-content: center; align-items: center;
      font-size: 14px; font-weight: bold; cursor: pointer;
      transition: transform 0.2s;
    }
    .user-menu-container:hover .user-avatar { transform: scale(1.1); }

    /* 下拉菜单 (悬停显示) */
    .user-dropdown {
      display: none; /* 默认隐藏 */
      position: absolute;
      top: 55px; /* 在头像正下方 */
      right: -10px; /* 对齐右侧 */
      width: 140px;
      background: rgba(31, 45, 53, 0.95); /* 深色磨砂背景 */
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      overflow: hidden;
      flex-direction: column;
      z-index: 9999;
    }

    /* 鼠标悬停容器时，显示菜单 */
    .user-menu-container:hover .user-dropdown { display: flex; animation: slideDown 0.2s ease-out; }

    /* 菜单项 */
    .dropdown-item {
      padding: 12px 20px;
      color: #ccc; text-decoration: none; font-size: 14px;
      transition: background 0.2s, color 0.2s;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .dropdown-item:last-child { border-bottom: none; }
    .dropdown-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .dropdown-item.logout { color: #ff6b6b; } /* 退出登录显示红色 */
    .dropdown-item.logout:hover { background: rgba(220, 53, 69, 0.2); }

    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    /* --- 2. 主内容区 --- */
    .main-container, .main-content {
      /* 保留你原有的边距设置 */
      margin-top: 120px;
      width: 90%;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      padding-bottom: 20px;

      /* 【核心修改】flex: 1 让这个容器占据所有剩余高度 */
      /* 这就是把版权信息“挤”到最底下的关键 */
      flex: 1;
    }
    /* 筛选栏 */
    .filter-bar {
      background: rgba(31, 45, 53, 0.8); backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
      padding: 20px; display: flex; align-items: center; gap: 15px;
      margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); flex-wrap: wrap;
    }
    .filter-input, .filter-select { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 10px 15px; border-radius: 6px; outline: none; font-size: 14px; }
    .filter-select option { background-color: #1F2D35; color: #fff; }
    .search-btn { background-color: #17a2b8; color: white; border: none; padding: 10px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s; margin-left: auto; }
    .search-btn:hover { background-color: #138496; }

    /* --- 3. 列表容器 (大方框) --- */
    .list-container {
      background: rgba(31, 45, 53, 0.6);
      backdrop-filter: blur(15px);
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 20px;
      min-height: 500px;
      position: relative;
    }
    .empty-state { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #888; }

    /* 表格样式 */
    table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
    th { text-align: left; color: #9D9E9E; font-size: 14px; padding: 10px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }

    tr.data-row { background: rgba(255, 255, 255, 0.05); transition: background 0.2s; position: relative; }
    tr.data-row:hover { background: rgba(255, 255, 255, 0.15); }

    td { padding: 15px 20px; vertical-align: middle; color: #fff; font-size: 15px; }
    td:first-child { border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
    td:last-child { border-top-right-radius: 10px; border-bottom-right-radius: 10px; text-align: right;}

    .table-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.2); }

    /* 部门标签 */
    .dept-tag { padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; }
    .dept-assault { background: rgba(220, 53, 69, 0.3); color: #ff6b6b; border: 1px solid rgba(220, 53, 69, 0.5); }
    .dept-support { background: rgba(40, 167, 69, 0.3); color: #51cf66; border: 1px solid rgba(40, 167, 69, 0.5); }
    .dept-engineer { background: rgba(255, 193, 7, 0.3); color: #fcc419; border: 1px solid rgba(255, 193, 7, 0.5); }
    .dept-recon { background: rgba(23, 162, 184, 0.3); color: #66d9e8; border: 1px solid rgba(23, 162, 184, 0.5); }

    /* 天数标签 */
    .days-tag { padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 13px; }
    .days-good { color: #28a745; background: rgba(40, 167, 69, 0.15); border: 1px solid #28a745; }
    .days-warn { color: #ffc107; background: rgba(255, 193, 7, 0.15); border: 1px solid #ffc107; }
    .days-bad { color: #dc3545; background: rgba(220, 53, 69, 0.15); border: 1px solid #dc3545; }

    /* 管理按钮 */
    .manage-btn {
      background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #ccc;
      padding: 5px 15px; border-radius: 4px; cursor: pointer; transition: all 0.2s; font-size: 12px;
    }
    .manage-btn:hover { border-color: #17a2b8; color: #17a2b8; background: rgba(23, 162, 184, 0.1); }

    /* --- 4. 操作弹窗 --- */
    .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 2000; justify-content: center; align-items: center; }
    .modal-box { width: 450px; background: #1F2D35; border: 1px solid rgba(255,255,255,0.2); border-radius: 15px; padding: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.8); display: flex; flex-direction: column; text-align: center; animation: fadeIn 0.3s ease-out; position: relative; }

    .modal-avatar-lg { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #17a2b8; margin: 0 auto 15px auto; object-fit: cover; }
    .modal-title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
    .modal-subtitle { color: #888; font-size: 14px; margin-bottom: 30px; }

    .modal-btns { display: flex; gap: 20px; }
    .m-btn { flex: 1; padding: 15px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; font-size: 15px; transition: transform 0.1s; }
    .m-btn:active { transform: scale(0.98); }

    .btn-retro { background: rgba(255, 193, 7, 0.15); color: #ffc107; border: 1px solid #ffc107; }
    .btn-retro:hover { background: #ffc107; color: #000; }

    .btn-modify { background: rgba(23, 162, 184, 0.15); color: #17a2b8; border: 1px solid #17a2b8; }
    .btn-modify:hover { background: #17a2b8; color: #fff; }

    .btn-close-x { position: absolute; top: 15px; right: 20px; font-size: 24px; color: #666; cursor: pointer; }
    .btn-close-x:hover { color: #fff; }

    /* 结果框 */
    .result-box { width: 350px; background: #1F2D35; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; padding: 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
    .result-icon { font-size: 40px; margin-bottom: 10px; color: #28a745; }
    .result-text { font-size: 16px; margin-bottom: 15px; }
    .result-btn { padding: 8px 30px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 20px; cursor: pointer; }

    .footer-copyright {
      /* 移除 position: absolute; */
      text-align: center;
      color: rgba(255, 255, 255, 0.3);
      font-size: 12px;

      /* 增加上下留白 */
      padding: 30px 0;
      width: 100%;

      /* 确保它不会被压缩 */
      flex-shrink: 0;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>

<video autoplay muted loop id="bg-video">
  <source src="${pageContext.request.contextPath}/assets/bg_video.mp4" type="video/mp4">
</video>

<nav class="navbar">
  <div class="nav-left"><img src="${pageContext.request.contextPath}/assets/logo_bg.png" alt="Logo" class="logo-img"></div>
  <div class="nav-right">
    <a href="main.jsp" class="nav-item">首页</a>
    <a href="${pageContext.request.contextPath}/listStudent" class="nav-item">人事管理</a>
    <a href="${pageContext.request.contextPath}/missionDispatch" class="nav-item">任务派遣</a>
    <a href="${pageContext.request.contextPath}/financeList" class="nav-item">财务报销</a>
    <a href="${pageContext.request.contextPath}/materialList" class="nav-item">物资申领</a>
    <a href="${pageContext.request.contextPath}/attendanceList" class="nav-item active">考勤打卡</a>
    <a href="#" class="nav-item">社区中心</a>
    <a href="#" class="nav-item">帮助</a>
    <div class="user-menu-container">
      <div class="user-avatar" onclick="location.href='mine.jsp'">CMD</div>
      <div class="user-dropdown">
        <a href="mine.jsp" class="dropdown-item">👤 个人中心</a>
        <a href="#" class="dropdown-item">⚙️ 系统设置</a>
        <a href="index.jsp" class="dropdown-item logout">🛑 退出登录</a>
      </div>
    </div>
  </div>
</nav>

<div class="main-container">
  <form action="${pageContext.request.contextPath}/attendanceList" method="get" class="filter-bar">
    <select name="department" class="filter-select">
      <option value="">所有部门</option>
      <option value="突击" ${searchDept == '突击' ? 'selected' : ''}>突击部</option>
      <option value="支援" ${searchDept == '支援' ? 'selected' : ''}>支援部</option>
      <option value="工程" ${searchDept == '工程' ? 'selected' : ''}>工程部</option>
      <option value="侦察" ${searchDept == '侦察' ? 'selected' : ''}>侦察部</option>
    </select>
    <input type="text" name="name" value="${searchName}" placeholder="姓名 / Name" class="filter-input">
    <input type="text" name="id" value="${searchId}" placeholder="编号 / ID" class="filter-input">
    <button type="submit" class="search-btn">搜索记录</button>
  </form>

  <div class="list-container">
    <c:choose>
      <c:when test="${not empty attendanceList}">
        <table>
          <thead>
          <tr>
            <th width="80">头像</th>
            <th width="100">编号</th>
            <th>姓名</th>
            <th width="80">性别</th>
            <th>所属部门</th>
            <th>本月出勤天数</th>
            <th width="100">操作</th>
          </tr>
          </thead>
          <tbody>
          <c:forEach items="${attendanceList}" var="record">
            <tr class="data-row">
              <td>
                <img src="${pageContext.request.contextPath}/${record.student.avatar != null ? record.student.avatar : 'assets/avatar_default.png'}" class="table-avatar">
              </td>
              <td>${record.student.id}</td>
              <td><strong>${record.student.name}</strong></td>
              <td>${record.student.gender}</td>
              <td>
                <c:choose>
                  <c:when test="${record.student.department == '突击'}"><span class="dept-tag dept-assault">突击部</span></c:when>
                  <c:when test="${record.student.department == '支援'}"><span class="dept-tag dept-support">支援部</span></c:when>
                  <c:when test="${record.student.department == '工程'}"><span class="dept-tag dept-engineer">工程部</span></c:when>
                  <c:when test="${record.student.department == '侦察'}"><span class="dept-tag dept-recon">侦察部</span></c:when>
                  <c:otherwise><span class="dept-tag" style="background:#555">待定</span></c:otherwise>
                </c:choose>
              </td>
              <td>
                <c:choose>
                  <c:when test="${record.days >= 25}">
                    <span class="days-tag days-good">${record.days} 天 (正常)</span>
                  </c:when>
                  <c:when test="${record.days >= 20}">
                    <span class="days-tag days-warn">${record.days} 天 (缺勤)</span>
                  </c:when>
                  <c:otherwise>
                    <span class="days-tag days-bad">${record.days} 天 (异常)</span>
                  </c:otherwise>
                </c:choose>
              </td>
              <td style="text-align: right;">
                <button class="manage-btn" onclick="openManageModal('${record.student.name}', '${record.student.id}', '${record.student.avatar}')">考勤管理</button>
              </td>
            </tr>
          </c:forEach>
          </tbody>
        </table>
      </c:when>
      <c:otherwise>
        <div class="empty-state">
          <div>暂无符合条件的考勤记录</div>
        </div>
      </c:otherwise>
    </c:choose>
  </div>

  <div class="footer-copyright">
    COPYRIGHT © 2024-2025 LRB&HJM. ALL RIGHTS RESERVED
  </div>
</div>

<div class="modal-overlay" id="manageModal">
  <div class="modal-box">
    <span class="btn-close-x" onclick="closeManageModal()">×</span>

    <img id="m-avatar" src="" class="modal-avatar-lg">
    <div id="m-name" class="modal-title">--</div>
    <div class="modal-subtitle">编号: <span id="m-id">--</span> | 考勤异常处理</div>

    <div class="modal-btns">
      <button class="m-btn btn-retro" onclick="handleAction('补签')">📝 申请补签</button>
      <button class="m-btn btn-modify" onclick="handleAction('改签')">🔄 申请改签</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="resultModal">
  <div class="result-box">
    <div class="result-icon">✓</div>
    <div id="result-text" class="result-text">申请已提交</div>
    <button class="result-btn" onclick="closeResultModal()">确认</button>
  </div>
</div>

<script>
  // 打开管理弹窗
  function openManageModal(name, id, avatar) {
    document.getElementById('m-name').innerText = name;
    document.getElementById('m-id').innerText = id;

    var realAvatar = (avatar && avatar !== 'null' && avatar !== '') ?
            '${pageContext.request.contextPath}/' + avatar :
            '${pageContext.request.contextPath}/assets/avatar_default.png';
    document.getElementById('m-avatar').src = realAvatar;

    document.getElementById('manageModal').style.display = 'flex';
  }

  // 关闭管理弹窗
  function closeManageModal() {
    document.getElementById('manageModal').style.display = 'none';
  }

  // 处理按钮点击
  function handleAction(type) {
    closeManageModal();
    document.getElementById('result-text').innerText = type + "申请已发送至审批中心";
    document.getElementById('resultModal').style.display = 'flex';
  }

  // 关闭结果窗
  function closeResultModal() {
    document.getElementById('resultModal').style.display = 'none';
  }

  // 点击遮罩关闭
  window.onclick = function(event) {
    if (event.target == document.getElementById('manageModal')) closeManageModal();
    if (event.target == document.getElementById('resultModal')) closeResultModal();
  }
</script>

</body>
</html>