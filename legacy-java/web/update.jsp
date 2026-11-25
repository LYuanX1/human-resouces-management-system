<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>修改档案 - 三角洲行动</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { height: 100%; width: 100%; font-family: "Microsoft YaHei", sans-serif; overflow: hidden; }
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

    .edit-card {
      width: 500px;
      background: rgba(31, 45, 53, 0.9);
      backdrop-filter: blur(15px);
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 30px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    }

    .card-title { font-size: 24px; font-weight: bold; margin-bottom: 25px; text-align: center; color: #fff; letter-spacing: 1px; }

    .form-group { margin-bottom: 20px; }
    .form-label { display: block; margin-bottom: 8px; font-size: 14px; color: #ccc; }
    .form-input { width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff; outline: none; }

    /* 禁用状态样式 */
    .form-input:disabled { background: rgba(255,255,255,0.05); color: #666; cursor: not-allowed; border-color: rgba(255,255,255,0.05); }

    .btn-group { display: flex; gap: 15px; margin-top: 10px; }
    .btn { flex: 1; padding: 12px; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; text-align: center; text-decoration: none; }
    .btn-submit { background: #ffc107; color: #000; }
    .btn-submit:hover { background: #e0a800; }
    .btn-cancel { background: rgba(255,255,255,0.1); color: #fff; }
    .btn-cancel:hover { background: rgba(255,255,255,0.2); }

    /* 头像上传样式 (复用) */
    .avatar-section { display: flex; justify-content: center; margin-bottom: 20px; }
    .avatar-upload-area {
      width: 100px; height: 100px; border-radius: 50%;
      background: rgba(255,255,255,0.05); border: 2px dashed rgba(255,255,255,0.2);
      position: relative; cursor: pointer; overflow: hidden; transition: all 0.3s;
    }
    .avatar-upload-area:hover { border-color: #ffc107; }
    #avatarPreview { width: 100%; height: 100%; object-fit: cover; }
    .edit-badge { position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.6); text-align: center; font-size: 10px; padding: 2px 0; }
  </style>
</head>
<body>

<div class="edit-card">
  <div class="card-title">档案修正</div>

  <form action="${pageContext.request.contextPath}/updateStudent" method="post" enctype="multipart/form-data">

    <div class="avatar-section">
      <div class="avatar-upload-area" onclick="document.getElementById('editFileInput').click()">
        <img id="avatarPreview" src="${pageContext.request.contextPath}/${stu.avatar}">
        <div class="edit-badge">更换头像</div>
      </div>
    </div>
    <input type="file" name="avatarFile" id="editFileInput" accept="image/*" style="display:none" onchange="previewImage(this)">
    <input type="hidden" name="oldAvatar" value="${stu.avatar}">

    <div class="form-group">
      <label class="form-label">干员编号 (锁定)</label>
      <input type="text" name="id" value="${stu.id}" class="form-input" style="background:rgba(255,255,255,0.1); color:#888;" readonly>
    </div>

    <div class="form-group">
      <label class="form-label">姓名</label>
      <input type="text" name="name" value="${stu.name}" class="form-input" required>
    </div>

    <div class="form-group">
      <label class="form-label">所属部门 (权限锁定：请申请人事调动)</label>
      <select class="form-input" disabled>
        <option <c:if test="${stu.department == '突击'}">selected</c:if>>突击部</option>
        <option <c:if test="${stu.department == '支援'}">selected</c:if>>支援部</option>
        <option <c:if test="${stu.department == '工程'}">selected</c:if>>工程部</option>
        <option <c:if test="${stu.department == '侦察'}">selected</c:if>>侦察部</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">性别</label>
      <div style="display: flex; gap: 20px; color: #fff;">
        <label><input type="radio" name="gender" value="男" <c:if test="${stu.gender == '男'}">checked</c:if>> 男</label>
        <label><input type="radio" name="gender" value="女" <c:if test="${stu.gender == '女'}">checked</c:if>> 女</label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">年龄</label>
      <input type="number" name="age" value="${stu.age}" class="form-input" required>
    </div>

    <div class="btn-group">
      <a href="${pageContext.request.contextPath}/listStudent" class="btn btn-cancel">取消</a>
      <button type="submit" class="btn btn-submit">保存修正</button>
    </div>
  </form>
</div>

<script>
  function previewImage(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('avatarPreview').src = e.target.result;
      }
      reader.readAsDataURL(input.files[0]);
    }
  }
</script>
</body>
</html>