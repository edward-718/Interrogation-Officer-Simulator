@echo off
REM 审讯室游戏 - Vercel 部署脚本
REM 请确保已安装 Node.js 和 Vercel CLI

set PATH=C:\Program Files\nodejs;%PATH%

echo ===============================================
echo 🔍 检测 Vercel CLI...
echo ===============================================

vercel --version 2>NUL
if %errorlevel% NEQ 0 (
    echo ⚠️  Vercel CLI 未安装，正在安装...
    npm install -g vercel
    if %errorlevel% NEQ 0 (
        echo ❌ 安装失败，请手动安装：npm install -g vercel
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI 已就绪

echo.
echo ===============================================
echo 🚀 开始部署...
echo ===============================================

REM 登录 Vercel（如果需要）
vercel login --github 2>NUL

REM 部署到 Vercel
vercel --prod --confirm

echo.
echo ===============================================
echo 🎉 部署完成！
echo ===============================================
pause