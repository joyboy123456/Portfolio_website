# 衣着之间 · AI 童装视觉作品集

一个可以“走进去”的 3D 手绘风格作品集网站，展示 AI 童装电商视觉设计作品。访客从入口推门进入一条无限延伸的手绘走廊，走廊两侧有四扇门：

| 门 | 内容 |
| --- | --- |
| **作品** | 12 套童装造型（Look），以纸张卡片的形式展示 |
| **创作** | 创作过程、四季系列与首页影像视频 |
| **关于** | 个人简介 |
| **联系** | 邮箱 / 微信 / 简历（只显示已填写的联系方式） |

技术栈：React 19 + Vite + React Three Fiber（three.js）+ GSAP。

## 修改内容：`public/portfolio.json`

网站上的文字和图片都来自 `public/portfolio.json`，改这个文件即可，无需改代码。图片请放在 `public/` 目录下（例如 `public/works/look-01/cover.jpg`），在 JSON 里写以 `/` 开头的路径（例如 `"/works/look-01/cover.jpg"`）。

### `profile`：个人信息

| 字段 | 说明 |
| --- | --- |
| `name` | 姓名（可留空） |
| `brand` / `title` / `intro` | 品牌名、职位标题、简介 |
| `email` | 邮箱，留空则“联系”房间不显示 |
| `wechat` | 微信号，留空则不显示 |
| `resumeUrl` | 简历链接（PDF 地址或放在 `public/` 下的文件路径），留空则不显示 |

### `projects`：12 套造型

每一项对应“作品”房间里的一张卡片：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识，如 `look-01` |
| `title` / `subtitle` | 标题、副标题 |
| `seasons` | 适用季节，如 `["春", "夏"]` |
| `category` / `direction` / `roles` | 品类、设计说明、负责环节 |
| `cover` | **封面图**（卡片上显示的主图） |
| `sourceImage` / `stylingImage` | 原始单品图、搭配效果图 |
| `gallery` | **图集**，图片路径数组，如 `["/works/look-01/1.jpg", "/works/look-01/2.jpg"]` |

### `experience`：创作房间

| 字段 | 说明 |
| --- | --- |
| `heroVideo` / `heroPoster` / `heroLabel` | 首页影像视频、封面帧、标题 |
| `collage.*` | 单品拼贴图（外套、裤装、上衣、帽子、裙装、套装、配饰） |
| `seasons.春/夏/秋/冬` | 四季系列图片 |

## 本地开发

需要 Node.js 18 及以上版本。

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（默认 http://127.0.0.1:5173）
npm run build    # 生产构建，输出到 dist/
npm run preview  # 本地预览构建结果
```

## 部署说明

`main` 分支会自动部署到线上，请先在其他分支完成修改并验证后再合并。

## 致谢与许可

Based on portfolio-itom by Tomasz Szmajda (MIT) — <https://github.com/ITomPoland/portfolio-itom>

本项目的 3D 场景、交互与手绘素材改编自上述开源项目，原项目以 MIT 许可证发布，许可证全文见 [LICENSE](./LICENSE)。中文字体为 ZCOOL 快乐体（SIL Open Font License，见 `public/fonts/ZCOOLKuaiLe-OFL.txt`）。
