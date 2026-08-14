#!/bin/bash
# 纪念馆更新推送脚本：把本地 毕业纪念馆/ 的最新内容同步到 GitHub 仓库
# 用法：bash deploy-push.sh "本次更新的说明"
set -e
MSG="${1:-更新：站点内容同步}"
SRC="/e/Claude/毕业纪念馆"
TMP="/e/gm-deploy"
REPO="https://github.com/wkty18/graduation-memory.git"

rm -rf "$TMP"
git clone --depth 1 "$REPO" "$TMP"
cd "$TMP"
# 清掉仓库里的站点文件，用本地最新内容覆盖
rm -rf assets css data js index.html README.md supabase-setup.sql build-map-data.py compress-images.ps1
cp -r "$SRC/." .
rm -rf test
printf 'test/\n' > .gitignore
git add -A
git commit -m "$MSG"
git push origin main
cd /
rm -rf "$TMP"
echo "推送完成：$MSG"
