<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%
  // 【核心修复】使用 Java 代码控制缓存，彻底消除 HTML 报错
  // 告诉浏览器和代理服务器：不要缓存此页面，每次都重新加载
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  response.setDateHeader("Expires", 0);
%>

<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>任务派遣控制台</title>
  <style>
    /* --- 1. 全局基础样式 --- */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { height: 100%; width: 100%; font-family: "Microsoft YaHei", sans-serif; overflow-x: hidden; }
    body {
      /* ...保留你原有的背景设置... */
      background-color: #0b1013;
      color: #fff;

      /* 【核心修改】 */
      position: relative;   /* 作为绝对定位的参考系 */
      min-height: 100vh;    /* 保证页面至少有一屏高 */
      padding-bottom: 60px; /* 给底部留出空间，防止内容被版权遮挡 */
      margin: 0;            /* 去除默认边距 */
      box-sizing: border-box; /* 确保 padding 算在高度内 */
    }
    #bg-video { position: fixed; right: 0; bottom: 0; min-width: 100%; min-height: 100%; width: auto; height: auto; z-index: -100; object-fit: cover; filter: brightness(0.5); }

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
    /* --- 2. 主区域布局 --- */
    .main-content { margin-top: 120px; padding: 0 50px 50px 50px; width: 100%; max-width: 1400px; margin-left: auto; margin-right: auto; flex: 1; }
    .page-title { font-size: 28px; font-weight: 900; margin-bottom: 30px; border-left: 6px solid #ffc107; padding-left: 15px; letter-spacing: 2px; }

    /* Grid 布局 */
    .task-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }

    /* 任务卡片 */
    .task-card {
      background: rgba(31, 45, 53, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      overflow: hidden;
      display: flex; flex-direction: column;
      min-height: 250px;
      transition: all 0.3s;
    }
    .task-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }

    /* 顶部栏 */
    .card-header {
      padding: 15px;
      background: rgba(0,0,0,0.3);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex; justify-content: space-between; align-items: center;
    }
    .header-title { font-size: 18px; font-weight: bold; display: flex; align-items: center; gap: 8px; }
    .color-bar { width: 6px; height: 18px; border-radius: 2px; display: inline-block; }

    /* 发布按钮 */
    .btn-publish {
      font-size: 12px; padding: 5px 12px; border-radius: 4px; cursor: pointer;
      border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #ccc;
      transition: 0.2s;
    }
    .btn-publish:hover { background: #17a2b8; border-color: #17a2b8; color: #fff; }
    .btn-publish.is-active { background: #dc3545; border-color: #dc3545; color: #fff; }

    /* 任务描述 */
    .card-body { padding: 20px; flex: 1; font-size: 14px; color: #bbb; line-height: 1.5; }

    /* 干员列表区 */
    .squad-zone { padding: 0 20px 15px 20px; }
    .squad-members {
      display: flex; gap: 10px; margin-bottom: 15px; min-height: 60px; align-items: center;
    }
    .empty-tip { font-size: 12px; color: #666; font-style: italic; }

    /* 已选干员样式 */
    .member-item { text-align: center; animation: popIn 0.3s; }
    .member-avatar { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #28a745; display: block; margin: 0 auto 4px auto; }
    .member-name { font-size: 12px; color: #fff; width: 60px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

    /* 底部按钮组 */
    .btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    .action-btn {
      padding: 10px 0; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; text-align: center; border: 1px solid transparent; transition: 0.2s;
    }

    /* 取消按钮 */
    .btn-cancel-task { background: rgba(255,255,255,0.05); color: #555; border-color: #444; cursor: not-allowed; }
    .btn-cancel-task.enabled { background: rgba(220, 53, 69, 0.15); color: #dc3545; border-color: #dc3545; cursor: pointer; }
    .btn-cancel-task.enabled:hover { background: #dc3545; color: #fff; }

    /* 派遣按钮 */
    .btn-deploy { background: rgba(40, 167, 69, 0.15); color: #28a745; border-color: #28a745; }
    .btn-deploy:hover { background: #28a745; color: #fff; }
    .btn-deploy:disabled { background: transparent; color: #555; border-color: #444; cursor: not-allowed; }

    /* --- 弹窗 --- */
    .modal-mask { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 2000; justify-content: center; align-items: center; }
    .modal-panel { width: 600px; background: #1F2D35; border: 1px solid rgba(255,255,255,0.2); border-radius: 15px; padding: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.8); display: flex; flex-direction: column; }
    .modal-header { font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 20px; }

    .op-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; max-height: 400px; overflow-y: auto; margin-bottom: 20px; padding: 5px; }

    .op-card { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; text-align: center; cursor: pointer; border: 1px solid transparent; transition: 0.2s; }
    .op-card:hover { background: rgba(255,255,255,0.1); }
    .op-card.selected { border-color: #28a745; background: rgba(40, 167, 69, 0.2); }
    .op-card.hidden { display: none; } /* 忙碌隐藏 */

    .op-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-bottom: 5px; }
    .op-txt { font-size: 12px; color: #ccc; }

    .modal-btns { display: flex; gap: 15px; }
    .m-btn { flex: 1; padding: 12px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
    .m-close { background: rgba(255,255,255,0.1); color: #fff; }
    .m-ok { background: #28a745; color: #fff; }

    /* 警告窗 */
    .alert-box { border: 2px solid #dc3545; box-shadow: 0 0 30px rgba(220, 53, 69, 0.3); width: 400px; text-align: center; }
    .alert-title { color: #dc3545; font-size: 24px; font-weight: bold; margin-bottom: 15px; }
    .alert-btn { width: 100%; padding: 10px; background: #dc3545; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 20px; }

    .footer-copyright {
      /* 【核心修改】绝对定位到最底部 */
      position: absolute;
      bottom: 15px;  /* 距离底边 15px */
      left: 0;
      width: 100%;   /* 撑满宽度 */

      /* 文字样式 */
      text-align: center;
      color: rgba(255, 255, 255, 0.3);
      font-size: 12px;
      z-index: 10;   /* 确保在视频背景之上 */

      /* 移除之前的 margin，防止干扰定位 */
      margin: 0;
      padding: 0;
    }
    @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  </style>
</head>
<body>

<video autoplay muted loop id="bg-video"><source src="${pageContext.request.contextPath}/assets/bg_video.mp4" type="video/mp4"></video>

<nav class="navbar">
  <div class="nav-left"><img src="${pageContext.request.contextPath}/assets/logo_bg.png" alt="Logo" class="logo-img"></div>
  <div class="nav-right">
    <a href="main.jsp" class="nav-item">首页</a>
    <a href="${pageContext.request.contextPath}/listStudent" class="nav-item">人事管理</a>
    <a href="${pageContext.request.contextPath}/missionDispatch" class="nav-item active">任务派遣</a>
    <a href="${pageContext.request.contextPath}/financeList" class="nav-item">财务报销</a>
    <a href="${pageContext.request.contextPath}/materialList" class="nav-item">物资申领</a>
    <a href="${pageContext.request.contextPath}/attendanceList" class="nav-item">考勤打卡</a>
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

<div class="main-content">
  <div class="page-title">任务派遣中心</div>

  <div class="task-grid">

    <div class="task-card" id="card-1">
      <div class="card-header">
        <div class="header-title"><span class="color-bar" style="background:#dc3545;"></span> 零号大坝</div>
        <button class="btn-publish" onclick="toggleTaskStatus(this)">发布任务</button>
      </div>
      <div class="card-body">前往行政辖区回收加密硬盘，注意高威胁单位。</div>
      <div class="squad-zone">
        <div class="squad-members" id="squad-1"><div class="empty-tip">暂无干员</div></div>
        <div class="btn-group">
          <button class="action-btn btn-cancel-task" onclick="clearSquad(1)" disabled>取消派遣</button>
          <button class="action-btn btn-deploy" onclick="openSelector(1)">派遣干员</button>
        </div>
      </div>
    </div>

    <div class="task-card" id="card-2">
      <div class="card-header">
        <div class="header-title"><span class="color-bar" style="background:#28a745;"></span> 长弓溪谷</div>
        <button class="btn-publish" onclick="toggleTaskStatus(this)">发布任务</button>
      </div>
      <div class="card-body">侦察坠机点，搜集黑匣子数据，避免交战。</div>
      <div class="squad-zone">
        <div class="squad-members" id="squad-2"><div class="empty-tip">暂无干员</div></div>
        <div class="btn-group">
          <button class="action-btn btn-cancel-task" onclick="clearSquad(2)" disabled>取消派遣</button>
          <button class="action-btn btn-deploy" onclick="openSelector(2)">派遣干员</button>
        </div>
      </div>
    </div>

    <div class="task-card" id="card-3">
      <div class="card-header">
        <div class="header-title"><span class="color-bar" style="background:#ffc107;"></span> 巴克什</div>
        <button class="btn-publish" onclick="toggleTaskStatus(this)">发布任务</button>
      </div>
      <div class="card-body">突袭集市据点，消灭首领，回收武器蓝图。</div>
      <div class="squad-zone">
        <div class="squad-members" id="squad-3"><div class="empty-tip">暂无干员</div></div>
        <div class="btn-group">
          <button class="action-btn btn-cancel-task" onclick="clearSquad(3)" disabled>取消派遣</button>
          <button class="action-btn btn-deploy" onclick="openSelector(3)">派遣干员</button>
        </div>
      </div>
    </div>

    <div class="task-card" id="card-4">
      <div class="card-header">
        <div class="header-title"><span class="color-bar" style="background:#17a2b8;"></span> 潮汐监狱</div>
        <button class="btn-publish" onclick="toggleTaskStatus(this)">发布任务</button>
      </div>
      <div class="card-body">潜入水下通道，解救被俘人员，要在涨潮前撤离。</div>
      <div class="squad-zone">
        <div class="squad-members" id="squad-4"><div class="empty-tip">暂无干员</div></div>
        <div class="btn-group">
          <button class="action-btn btn-cancel-task" onclick="clearSquad(4)" disabled>取消派遣</button>
          <button class="action-btn btn-deploy" onclick="openSelector(4)">派遣干员</button>
        </div>
      </div>
    </div>

    <div class="task-card" id="card-5">
      <div class="card-header">
        <div class="header-title"><span class="color-bar" style="background:#6f42c1;"></span> 航天基地</div>
        <button class="btn-publish" onclick="toggleTaskStatus(this)">发布任务</button>
      </div>
      <div class="card-body">核心区域防守任务，阻止敌方破坏发射程序。</div>
      <div class="squad-zone">
        <div class="squad-members" id="squad-5"><div class="empty-tip">暂无干员</div></div>
        <div class="btn-group">
          <button class="action-btn btn-cancel-task" onclick="clearSquad(5)" disabled>取消派遣</button>
          <button class="action-btn btn-deploy" onclick="openSelector(5)">派遣干员</button>
        </div>
      </div>
    </div>

    <div class="task-card" id="card-6">
      <div class="card-header">
        <div class="header-title"><span class="color-bar" style="background:#dc3545;"></span> 零号大坝</div>
        <button class="btn-publish" onclick="toggleTaskStatus(this)">发布任务</button>
      </div>
      <div class="card-body">外围巡逻任务，清理游荡的野兽和拾荒者。</div>
      <div class="squad-zone">
        <div class="squad-members" id="squad-6"><div class="empty-tip">暂无干员</div></div>
        <div class="btn-group">
          <button class="action-btn btn-cancel-task" onclick="clearSquad(6)" disabled>取消派遣</button>
          <button class="action-btn btn-deploy" onclick="openSelector(6)">派遣干员</button>
        </div>
      </div>
    </div>

  </div>

  <div class="footer-copyright">
    COPYRIGHT © 2024-2025 LRB&HJM. ALL RIGHTS RESERVED
  </div>
</div>

<div class="modal-mask" id="modal-select">
  <div class="modal-panel">
    <div class="modal-header">选择出勤干员</div>
    <div class="op-grid">
      <c:forEach items="${operatorList}" var="stu">
        <div class="op-card"
             id="op-card-${stu.id}"
             data-id="${stu.id}"
             data-name="${stu.name}"
             data-avatar="${stu.avatar != null ? stu.avatar : 'assets/avatar_default.png'}"
             onclick="handleSelect(this)">
          <img src="${pageContext.request.contextPath}/${stu.avatar != null ? stu.avatar : 'assets/avatar_default.png'}" class="op-img">
          <div class="op-txt">${stu.name}</div>
        </div>
      </c:forEach>
    </div>
    <div class="modal-btns">
      <button class="m-btn m-close" onclick="closeSelector()">取消</button>
      <button class="m-btn m-ok" onclick="submitSelection()">确定</button>
    </div>
  </div>
</div>

<div class="modal-mask" id="modal-alert">
  <div class="modal-panel alert-box">
    <div class="alert-title">⚠️ 派遣干员已达到最大人数</div>
    <div style="color:#ddd; margin-bottom:15px;">该小队已满员 (3人)<br>请调整后再尝试</div>
    <button class="alert-btn" onclick="closeAlert()">我知道了</button>
  </div>
</div>

<script>
  // --- 全局变量 ---
  let currentCardId = null;
  let tempSelected = []; // 弹窗里临时选的 {id, name, avatar}
  let globalBusySet = new Set(); // 忙碌名单 (ID)

  // --- 1. 发布/中止 按钮切换 ---
  function toggleTaskStatus(btn) {
    if (btn.classList.contains('is-active')) {
      btn.classList.remove('is-active');
      btn.innerText = "发布任务";
    } else {
      btn.classList.add('is-active');
      btn.innerText = "中止任务";
    }
  }

  // --- 2. 打开选人弹窗 ---
  function openSelector(id) {
    // 先检查是否满员
    const squadDiv = document.getElementById('squad-' + id);
    const currentCount = squadDiv.querySelectorAll('.member-item').length;

    if (currentCount >= 3) {
      openAlert(); // 满员直接警告
      return;
    }

    currentCardId = id;
    tempSelected = []; // 清空临时选择

    // 刷新弹窗里的干员状态
    const cards = document.querySelectorAll('.op-card');
    cards.forEach(card => {
      card.classList.remove('selected'); // 清除选中态
      const opId = card.getAttribute('data-id');

      // 如果在忙碌名单里 -> 隐藏
      if (globalBusySet.has(opId)) {
        card.classList.add('hidden');
      } else {
        card.classList.remove('hidden');
      }
    });

    document.getElementById('modal-select').style.display = 'flex';
  }

  function closeSelector() {
    document.getElementById('modal-select').style.display = 'none';
    currentCardId = null;
    tempSelected = [];
  }

  // --- 3. 选中逻辑 (手动挡) ---
  function handleSelect(el) {
    const id = el.getAttribute('data-id');
    const name = el.getAttribute('data-name');
    const avatar = el.getAttribute('data-avatar');

    // 计算当前总数 = 页面已有的 + 刚才选的
    const squadDiv = document.getElementById('squad-' + currentCardId);
    const currentCount = squadDiv.querySelectorAll('.member-item').length;
    const newCount = tempSelected.length;

    if (el.classList.contains('selected')) {
      // 取消选中
      el.classList.remove('selected');
      tempSelected = tempSelected.filter(item => item.id !== id);
    } else {
      // 尝试选中 -> 检查上限
      if (currentCount + newCount >= 3) {
        openAlert(); // 弹窗警告，但不关闭选人窗
        return;
      }
      // 没满 -> 允许选中
      el.classList.add('selected');
      tempSelected.push({ id, name, avatar });
    }
  }

  // --- 4. 提交确认 (核心修复：点击必定关闭) ---
  function submitSelection() {
    if (tempSelected.length === 0) {
      closeSelector();
      return;
    }

    const squadDiv = document.getElementById('squad-' + currentCardId);
    const emptyTip = squadDiv.querySelector('.empty-tip');
    if (emptyTip) emptyTip.remove();

    // 渲染头像
    tempSelected.forEach(op => {
      globalBusySet.add(op.id); // 标记忙碌

      const div = document.createElement('div');
      div.className = 'member-item';
      div.setAttribute('data-id', op.id);
      div.innerHTML = `
                    <img src="${pageContext.request.contextPath}/` + op.avatar + `" class="member-avatar">
                    <div class="member-name">` + op.name + `</div>
                `;
      squadDiv.appendChild(div);
    });

    // 刷新按钮状态
    refreshButtons(currentCardId);

    // 【强制关闭】
    closeSelector();
  }

  // --- 5. 取消派遣 (清空) ---
  function clearSquad(id) {
    const squadDiv = document.getElementById('squad-' + id);
    const members = squadDiv.querySelectorAll('.member-item');

    // 释放忙碌名额
    members.forEach(m => {
      const opId = m.getAttribute('data-id');
      globalBusySet.delete(opId);
    });

    // 清空 UI
    squadDiv.innerHTML = '<div class="empty-tip">暂无干员</div>';

    refreshButtons(id);
  }

  // --- 6. 按钮状态刷新逻辑 ---
  function refreshButtons(id) {
    const card = document.getElementById('card-' + id);
    const squadDiv = document.getElementById('squad-' + id);
    const count = squadDiv.querySelectorAll('.member-item').length;

    const btnCancel = card.querySelector('.btn-cancel-task');
    const btnDeploy = card.querySelector('.btn-deploy');

    // 取消按钮：有人->亮红，无人->暗灰
    if (count > 0) {
      btnCancel.disabled = false;
      btnCancel.classList.add('enabled');
    } else {
      btnCancel.disabled = true;
      btnCancel.classList.remove('enabled');
    }

    // 派遣按钮：满3人->变灰禁用
    if (count >= 3) {
      btnDeploy.innerText = "已满员";
      btnDeploy.disabled = true;
    } else {
      btnDeploy.innerText = "派遣干员";
      btnDeploy.disabled = false;
    }
  }

  // --- 7. 警告窗控制 ---
  function openAlert() { document.getElementById('modal-alert').style.display = 'flex'; }
  function closeAlert() { document.getElementById('modal-alert').style.display = 'none'; }

  // 点击空白处关闭
  window.onclick = function(e) {
    if (e.target == document.getElementById('modal-select')) closeSelector();
    if (e.target == document.getElementById('modal-alert')) closeAlert();
  }
</script>

</body>
</html>