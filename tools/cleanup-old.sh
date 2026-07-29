#!/bin/bash
git reset --hard
git clean -fdx
rm -f obs/Smile-Trading-Kit-v2.json
rm -f obs/Smile-Trading-Kit-v3.json
rm -f obs/*TEMPLATE*
find . -name "*_1.*" -delete
