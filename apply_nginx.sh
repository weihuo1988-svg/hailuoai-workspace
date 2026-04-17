#!/bin/bash
curl -sL "https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/000119_8f3d/workspace/nginx_new.conf" -o /tmp/nginx_new.conf && cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak && mv /tmp/nginx_new.conf /etc/nginx/nginx.conf && rm -f /etc/nginx/sites-enabled/default && nginx -t && nginx -s reload && echo SUCCESS
