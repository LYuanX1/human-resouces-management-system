#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""更换云空间域名 / 目录时，一键批量替换项目里所有引用。
用法: python3 scripts/rebase-assets.py <旧前缀> <新前缀>
例如: python3 scripts/rebase-assets.py \
        https://env-00jy736zuxjd.normal.cloudstatic.cn/hrms \
        https://<新spaceId>.normal.cloudstatic.cn/hrms
会同步更新 *.html、js/*.js、functions/**/*.js、assets-manifest.json。
"""
import os, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERNS = ["*.html", "js/*.js", "functions/**/*.js", "assets-manifest.json", "cloud-upload-function/*.js"]


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    old, new = sys.argv[1].rstrip("/"), sys.argv[2].rstrip("/")
    targets = []
    for pat in PATTERNS:
        targets.extend(glob.glob(os.path.join(ROOT, pat), recursive=True))
    changed = 0
    for path in sorted(set(targets)):
        s = open(path, encoding="utf-8").read()
        if old in s:
            open(path, "w", encoding="utf-8").write(s.replace(old, new))
            print("  更新", os.path.relpath(path, ROOT))
            changed += 1
    print("完成，共更新 %d 个文件。请重新部署 Pages 项目。" % changed)
    return 0


if __name__ == "__main__":
    sys.exit(main())
