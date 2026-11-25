#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""校验 assets-manifest.json 中所有云存储 URL 的可访问性。

两种视角：
  1) 服务器侧（不带 Referer）—— 验证文件已上传且公有读
  2) 浏览器侧（带页面 Referer）—— 验证防盗链（Referer ACL）是否放行页面域名

云存储 CDN 配置了 Referer 白名单：浏览器加载 <img>/<video> 会自动携带
页面域名 Referer，若域名不在白名单内会返回 403（denied by Referer ACL）。
本项目页面已通过 <meta name="referrer" content="no-referrer"> 与
referrerpolicy="no-referrer" 让浏览器不发送 Referer，因此关键看视角 1；
视角 2 用于排查「若某些环境仍发送 Referer，白名单是否覆盖」。

用法:
  python3 scripts/verify-assets.py                    # 使用默认 Referer
  CHECK_REFERER=https://xxx.example.com/ python3 ...  # 自定义 Referer
全部通过返回 0，任一失败返回 1。
"""
import json, os, ssl, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "assets-manifest.json")
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
# 模拟真实浏览器：页面部署域名（可在环境变量覆盖）
REFERER = os.environ.get("CHECK_REFERER", "https://hrms.lyuanxi.top/")


def check(item, referer=None):
    url = item["url"]
    headers = {"Range": "bytes=0-0", "User-Agent": "hrms-verify/1.0"}
    if referer:
        headers["Referer"] = referer
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
            return (item["file"], r.status, "")
    except urllib.error.HTTPError as e:
        return (item["file"], e.code, e.reason)
    except Exception as e:
        return (item["file"], -1, str(e))


def run(title, items, referer):
    print("\n=== %s ===" % title)
    if referer:
        print("Referer: %s" % referer)
    with ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(lambda it: check(it, referer), items))
    ok = [r for r in results if r[1] in (200, 206)]
    bad = [r for r in results if r[1] not in (200, 206)]
    print("可访问: %d / %d" % (len(ok), len(items)))
    if bad:
        print("失败明细:")
        for name, code, reason in bad[:40]:
            print("  [%s] %s  %s" % (code, name, reason))
        if len(bad) > 40:
            print("  ... 另有 %d 个" % (len(bad) - 40))
    return len(ok) == len(items)


def main():
    data = json.load(open(MANIFEST, encoding="utf-8"))
    items = data["files"]
    print("校验 %d 个云存储资源，域名: %s" % (len(items), data["assetBase"]))

    ok_server = run("视角 1：服务器侧（无 Referer）", items, None)
    ok_browser = run("视角 2：浏览器侧（带页面 Referer）", items, REFERER)

    print("\n--- 结论 ---")
    print("文件上传与公有读: %s" % ("通过" if ok_server else "未通过"))
    if ok_browser:
        print("防盗链白名单:     通过（页面域名已放行）")
    else:
        print("防盗链白名单:     未放行 %s" % REFERER)
        print("提示: 页面已通过 referrerpolicy=no-referrer 不发送 Referer，")
        print("      只要视角 1 通过，线上资源即可正常加载；")
        print("      也可在对象存储防盗链白名单中加入部署域名消除 403。")
    return 0 if ok_server else 1


if __name__ == "__main__":
    sys.exit(main())
