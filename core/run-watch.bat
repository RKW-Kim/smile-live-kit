@echo off
title Smile Chart Watcher
cd /d "%~dp0"
node watch-smile.js
if errorlevel 1 ( echo. & echo First time? run:  npm init -y  then  npm i puppeteer & pause )
