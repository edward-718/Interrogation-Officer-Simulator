# Netlify Drop 部署指南

## 🚀 最简单的部署方式（无需安装任何工具）

### 步骤 1：打开 Netlify Drop

在浏览器中打开：https://app.netlify.com/drop

### 步骤 2：打包项目文件

将以下文件压缩成一个 ZIP 文件：
- `index.html`
- `styles.css`
- `app.js`
- `engine.js`
- `data/` 文件夹（包含 `cases.js`）
- `vercel.json`
- `_redirects`

### 步骤 3：拖拽上传

1. 打开 https://app.netlify.com/drop
2. 将 ZIP 文件拖拽到网页上
3. 等待上传和部署（约 30 秒）

### 步骤 4：完成！

部署成功后，Netlify 会生成一个随机域名，例如：
`https://random-name-12345.netlify.app`

你可以点击链接预览，或在设置中更换为自定义域名。

---

## 📋 需要打包的文件

```
审讯demo.zip
├── index.html
├── styles.css
├── app.js
├── engine.js
├── data/
│   └── cases.js
├── vercel.json
└── _redirects
```

---

## ⚠️ 注意

- 不要打包 `server.js`、`deploy.bat`、`部署指南.md`、`攻略.md` 等开发文件
- 确保 `data/cases.js` 在压缩包内存在
- ZIP 文件名可以随意命名

---

## 🎉 优势

- ✅ 无需安装 Node.js/npm
- ✅ 无需命令行操作
- ✅ 无需 Git 仓库
- ✅ 30 秒完成部署
- ✅ 免费 HTTPS
- ✅ 全球 CDN 加速

这就是最简单的静态网站部署方式！