# 三角洲行动干员管理系统（EdgeOne Pages 版）

原 JavaWeb 课程设计（JSP + Servlet + Tomcat + MySQL）改造为 **EdgeOne Pages 全栈应用**：

- 前端：10 个静态 HTML 页面（由原 JSP 转换，样式与交互原样保留）
- 后端：`functions/` 下的 Pages Functions（Node.js / V8 边缘运行时）
- 数据：EdgeOne Pages **KV 存储**（绑定变量名 `STUDENT_KV`）
- 图片 / 视频：uniCloud 支付宝云**云存储**，通过公有读 CDN 域名直接引用

> 原 Java 源码保留在 `legacy-java/` 目录，仅供对照，不参与部署。

## 目录约定（重要）

| 内容 | 云存储路径 | 访问 URL 前缀 |
|---|---|---|
| 静态资源（背景视频、logo、地图、头像等 101 个文件） | `hrms/` | `https://env-00jy736zuxjd.normal.cloudstatic.cn/hrms/` |
| 用户动态上传的头像 | `hrms/upload/` | `https://env-00jy736zuxjd.normal.cloudstatic.cn/hrms/upload/` |

两类资源**目录隔离**：静态资源不会被用户上传覆盖，动态头像单独管理。
完整 101 条映射见 [`assets-manifest.json`](assets-manifest.json)。

## 项目结构

```
├── index.html / login.html / main.html / info.html / update.html
├── mission.html / material.html / finance.html / attendance.html / mine.html
├── js/                     # 前端逻辑（config.js 里集中配置云域名）
│   ├── config.js           # ★ 改这一处即可换云空间域名 / 目录
│   ├── common.js            # URL 转换、API 请求、登录守卫
│   └── <各页面>.js
├── functions/              # EdgeOne Pages Functions（自动映射为 /api/* 路由）
│   ├── _lib/kv.js           # KV 数据层 + 自动种子数据
│   ├── _lib/seed-data.js   # 由原 stu_db.txt 迁移的 23 名干员
│   └── api/                 # login / students / attendance / finance / material
│                            # missions / mine / upload / avatar / seed / logout
├── cloud-upload-function/  # 可选的 uniCloud 云函数（真实写入 hrms/upload/）
├── scripts/
│   ├── verify-assets.py     # 批量校验云资源 URL 是否可访问（无凭证）
│   └── rebase-assets.py     # 更换云空间域名时一键批量替换
├── assets-manifest.json     # 101 个资源 -> 云 URL 映射清单
└── legacy-java/             # 原 JavaWeb 源码存档
```

## 部署步骤

### 1. 上传静态资源到云空间

登录 [uniCloud 控制台](https://unicloud.dcloud.net.cn/) → 选择服务空间 `env-00jy736zuxjd` →
「云存储」→ 新建 `hrms` 目录 → 把原 `web/assets/` 里的 **101 个文件全部上传**到该目录
（保持文件名不变，不要再套一层 `assets`）。再新建 `hrms/upload/` 空目录备用。

上传完成后在本地跑一次校验：

```bash
python3 scripts/verify-assets.py
```

全部返回 200/206 即说明资源就绪且为公有读。

### 2. 开通并绑定 KV

1. EdgeOne Pages 控制台 →「KV Storage」→ 开通（当前版本已全面开放，可一键开通；若仍显示审批中，一般 1–3 个工作日）
2. 创建命名空间，建议命名 `student_kv`
3. 项目详情 →「KV 存储」→「绑定命名空间」，**变量名必须填 `STUDENT_KV`**
4. **重新部署一次**，绑定才生效

> 无需手动导入数据：首次访问任意接口时 `ensureSeed()` 会自动把原 `stu_db.txt` 的
> 23 名干员和默认账号写入 KV。需要恢复初始数据时，登录后 `POST /api/seed`。

### 3. 创建 Pages 项目并关联本仓库

控制台 → 创建项目 → 导入 Git 仓库 → 授权 GitHub → 选择本仓库 →
构建命令留空、输出目录填 `.`（纯静态 + Functions，无需构建）。之后每次 `git push` 自动部署。

> 注意：`functions/` 目录由平台自动识别，`edgeone.json` 不是必需的；
> KV 命名空间的创建与绑定只能在控制台完成，CLI 与配置文件均无法代办。

### 4.（可选）启用真实头像上传到 `hrms/upload/`

默认未配置时，上传接口会把头像暂存在 KV，并通过 `/api/avatar/<id>` 提供访问，功能可用。
若要求头像**真实落在云存储 `hrms/upload/`**，按以下步骤补齐：

1. 把 [`cloud-upload-function/index.js`](cloud-upload-function/index.js) 部署为 uniCloud 云函数，开启「云函数 URL 化」
2. 在 Pages 项目「环境变量」中添加：
   - `UPLOAD_GATEWAY` = 云函数 URL 化地址
   - `UPLOAD_TOKEN` = 自定义随机字符串（云函数环境变量里也设同名值）
3. 重新部署 Pages 项目

之后 `/api/upload` 会返回 `hrms/upload/` 下的公有读 URL，响应里 `storage: "cloud"`。

## 使用

- 访问站点首页 → 点「登录」 → 账号 `root` / 密码 `root`
- 模块：人事管理（增删改查 / 人事调动）、任务派遣、财务报销、物资申领、考勤打卡、个人中心
- 未登录访问任何内页会自动跳回首页

## 维护提示

- **换云空间 / 换目录**：改 `js/config.js` 的 `ASSET_BASE` 与 `UPLOAD_DIR`，
  再执行 `python3 scripts/rebase-assets.py <旧前缀> <新前缀>` 批量同步其他文件。
- **新增静态图片**：上传到 `hrms/` 后，在 `assets-manifest.json` 补一条映射，跑一次校验脚本。
- **凭证安全**：AK / SK、GitHub PAT 等一律不写入仓库；请放在控制台环境变量中，并定期轮换。
- **静态资源与代码解耦**：图片更新只需在控制台覆盖同名文件，代码无需改动、无需重新部署。
