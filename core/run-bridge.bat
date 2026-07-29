@echo off
title Smile Bridge
cd /d "%~dp0"
python bridge.py
if errorlevel 1 ( echo. & echo Python not found: install from python.org (tick "Add to PATH"). & pause )
