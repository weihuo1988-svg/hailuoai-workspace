#!/bin/bash
CDN="https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/224217_e8fc/workspace/mc-task-new.tar"
echo "下载升级包..."
curl -sL "$CDN" -o /tmp/mc-task-new.tar && echo "下载完成"
echo "解压到 /var/www/mc-task..."
rm -rf /var/www/mc-task && mkdir -p /var/www/mc-task
tar -xf /tmp/mc-task-new.tar -C /var/www/mc-task && echo "解压完成"
echo "复制材质..."
cp -r /workspace/mc-textures /var/www/mc-task/public/ 2>/dev/null || cp -r /tmp/mc-textures /var/www/mc-task/public/ 2>/dev/null || echo "材质已存在"
echo "检查文件..."
ls /var/www/mc-task/public/mc-textures/blocks/ | head -3
echo "重载nginx..."
nginx -s reload && echo "完成"
echo "升级版地址: http://39.97.246.203/"
