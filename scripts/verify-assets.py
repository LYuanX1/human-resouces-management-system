#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""校验 assets-manifest.json 中所有云存储 URL 是否可访问（验证公有读 / 上传完整性）。
用法: python3 scripts/verify-assets.py
无需任何凭证。全部通过返回 0，有缺失返回 1。
"""
import json, os, ssl, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "assets-manifest.json")
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE


def check(item):
    url = item["url"]
    try:
        req = urllib.request.Request(url, headers={"Range": "bytes=0-0", "User-Agent": "hrms-verify/1.0"})
        with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
            return (item["file"], r.status, "")
    except urllib.error.HTTPError as e:
        return (item["file"], e.code, e.reason)
    except Exception as e:
        return (item["file"], -1, str(e))


def main():
    data = json.load(open(MANIFEST, encoding="utf-8"))
    items = data["files"]
    print("校验 %d 个云存储资源，域名: %s" % (len(items), data["assetBase"]))
    with ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(check, items))
    ok = [r for r in results if r[1] in (200, 206)]
    bad = [r for r in results if r[1] not in (200, 206)]
    print("可访问: %d / %d" % (len(ok), len(items)))
    if bad:
        print("\n以下资源未就绪（常见原因：控制台尚未上传 / 权限非公有读）:")
        for name, code, reason in bad[:40]:
            print("  [%s] %s  %s" % (code, name, reason))
        if len(bad) > 40:
            print("  ... 另有 %d 个" % (len(bad) - 40))
        return 1
    print("全部通过：静态资源已就绪。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
