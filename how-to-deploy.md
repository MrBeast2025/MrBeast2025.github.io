# 如何部署上线（GitHub Pages，分步清单）

> 目标：拿到一个可以写进简历的网址，例如 `https://lansongtao.github.io`
> 每一步都写了「怎么验证」，验证不通过就别往下走。

---

## 第 0 步：先确认本地没问题

1. 双击 `index.html`，浏览器打开后应该看到完整的网站；
2. 页面顶部导航、成果卡、项目案例都在，没有黄框报错。

✅ **验证**：手机上也能打开——把 `index.html` 发到微信文件传输助手，用手机打开看看排版是否正常。

---

## 第 1 步：创建 GitHub 仓库

1. 登录 [github.com](https://github.com)；
2. 右上角 `+` → **New repository**；
3. 填写：
   - **Repository name**：填 `你的用户名.github.io`（**必须完全等于这个格式**，否则网址会多一层路径）；
   - **Public**（必须公开，否则 Pages 不能免费用）；
   - **不要**勾选 Add a README file；
4. 点 **Create repository**。

✅ **验证**：创建后跳转到的页面地址是 `github.com/你的用户名/你的用户名.github.io`。

---

## 第 2 步：上传网站文件

**方法 A（网页上传，最简单）**

1. 在仓库页面点 **uploading an existing file**；
2. 把 `index.html`、`styles.css`、`content.js`、`main.js`、`README.md` 拖进去；
   ⚠️ `_test` 文件夹**不要上传**（里面是测试脚本和截图，与网站无关）；
3. 底部点 **Commit changes**。

**方法 B（用 Git 命令行，后面更新方便）**

在网站文件夹里打开 Git Bash，依次执行：

    git init
    git add index.html styles.css content.js main.js README.md
    git commit -m "first version"
    git branch -M main
    git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
    git push -u origin main

✅ **验证**：刷新仓库页面，能看到这 5 个文件。

---

## 第 3 步：开启 Pages

1. 仓库页面 → **Settings**（顶部标签）；
2. 左侧栏 → **Pages**；
3. **Source** 选 `Deploy from a branch`；
4. **Branch** 选 `main`，目录选 `/ (root)`，点 **Save**；
5. 等 1–3 分钟。

✅ **验证**：Pages 页面上方出现绿色提示 `Your site is live at https://你的用户名.github.io/`。

---

## 第 4 步：验证线上效果

1. 打开 `https://你的用户名.github.io/`；
2. **用手机 4G（不用 WiFi）再打开一次**——这是 HR 最可能的打开方式；
3. 检查三件事：内容完整、样式没丢、邮箱能点。

⚠️ **如果样式丢了（白底黑字无排版）**：说明路径写错了。检查 `index.html` 里引用 CSS 的那一行必须是 `./styles.css?v=2`（**相对路径**，不能是 `/styles.css`）。

---

## 第 5 步：以后怎么更新（重要）

改完 `content.js` 之后：

1. 打开 `index.html`，把 `content.js?v=2` 改成 `content.js?v=2`（下一次改 `v=3`，每次加一）；
   原因：GitHub Pages 的缓存很顽固，不改版本号可能看到的是旧内容；
2. 重新上传 `content.js` 和 `index.html`（网页上传 → **Add file** → **Upload files**），或执行：

       git add .
       git commit -m "update content"
       git push

3. 等 1–2 分钟，**Ctrl + F5** 强制刷新。

✅ **验证**：看到你改的那句话出现在线上。

### 把「最近更新」日期也改掉

`content.js` 里的 `site.updatedAt` 改成当前年月（例如 `"2026-10"`），页脚会同步更新——这条能传递「我还在维护」的信号。

---

## 备选方案：Vercel（国内访问通常更快）

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录；
2. **Add New → Project** → 选择你的仓库 → **Deploy**；
3. 部署完成后拿到 `你的项目名.vercel.app` 的地址。

优点：国内打开速度通常更好；缺点：域名是 `vercel.app` 后缀，不如 `github.io` 通用。**两个都可以挂，简历里只写一个。**

---

## 常见报错

| 现象 | 原因 | 解决 |
|---|---|---|
| 打开网址是 404 | Pages 还没构建完，或分支选错 | 等 3 分钟；确认 Settings → Pages 里 branch 选了 `main` + `/ (root)` |
| 页面能开但没样式 | 用了绝对路径 | 引用改成 `./styles.css?v=2` |
| 改了内容线上没变 | 缓存 | 改 `?v=` 版本号，然后 Ctrl + F5 |
| 页面空白，只有一句提示 | `content.js` 有语法错误 | 在本地双击 `index.html` 先排查，看控制台（F12）报什么 |
| 手机上排版乱了 | 视口或宽度问题 | 检查 `index.html` 里有没有 `<meta name="viewport" content="width=device-width, initial-scale=1">` |