<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
  <title>登录</title>
</head>
<body>

<h2>用户登录</h2>

<form action="${pageContext.request.contextPath}/login" method="post">
  用户名：<input type="text" name="username"><br><br>
  密码：<input type="password" name="password"><br><br>
  <input type="submit" value="登录">
</form>

<span style="color:red">
  ${error}
</span>

</body>
</html>