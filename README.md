# 衣着之间™ · AI 童装视觉作品集

按照用户提供的 ALP1NE 动效提示词重做的作品集。网站的 HTML、CSS 和 JavaScript 都在 `index.html` 内，不使用 React、Tailwind 或动画框架；Vite 负责开发与生产构建。

## 运行

```sh
npm install
npm run dev
```

生产构建：`npm run build`。生产预览：`npm run preview -- --port 4173`。

## 浏览顺序

1. 固定首屏视频：滚动前后定位视频，底部大标题随滚动上移、缩小、淡出和模糊。
2. 橄榄色创作宣言：七个童装素材预留位置，以不同速度产生位移与旋转。
3. 四季展映：窗口由中心展开，再横向切换春、夏、秋、冬；可用前后按钮与左右方向键切换。
4. 作品索引：12 组案例预留位，支持季节与 8 个服装品类交叉筛选。
5. 作品详情、个人介绍与联系区域。

导航栏可以直接跳过滚动演示，到作品索引、创作过程或个人介绍。手机端为全屏模糊菜单。时钟使用浏览器本地时间并显示实际 UTC 偏移。

## 素材状态

**首屏使用用户提供的《视频生成能力.mp4》剪辑版，页面标注“AI 影像生成展示”。** 保留原片 0.5–7.5 秒的连续推近镜头，输出 7 秒、1280 × 720、24 fps 的静音 H.264 MP4（约 4.9 MB）；每 12 帧一个关键帧，启用 faststart，便于首屏加载与滚动定位。视频与首帧封面位于 `public/works/hero-video-capability.mp4`、`public/works/hero-video-capability-poster.jpg`。原始视频未修改。七张拼贴素材、四季大图以及全部 12 组作品图片均留空。原始商品搜索截图只作为风格参考，未放入画廊。

## 所有填充内容：public/portfolio.json

### 个人信息

`profile` 内填写姓名/艺名、标题、介绍、邮箱、微信及简历链接。姓名为空时使用暂定名称“衣着之间”。联系方式为空时不会生成虚假地址。姓名与标题会同步到页眉、页脚和浏览器标题。

### 首屏视频

```json
"experience": {
  "heroVideo": "/works/hero.mp4",
  "heroPoster": "/works/hero-poster.jpg",
  "heroLabel": "个人作品影像"
}
```

保留已有 `experience.collage` 与 `experience.seasons` 字段，只修改上面的值。`heroVideo` 为空或加载失败时，页面显示排版回退画面。推荐支持 Range 请求的 MP4 文件；频繁关键帧有助于滚动定位。此建议不代表对所有移动设备的兼容性保证。

### 七个拼贴位置

在 `experience.collage` 中填写透明背景 PNG/WebP 的路径：

| 字段 | 内容 |
| --- | --- |
| jacket | 外套 |
| trousers | 裤装 |
| top | 内搭/上装 |
| hat | 帽子 |
| dress | 裙装 |
| set | 套装 |
| accessory | 配饰 |

留空时显示透明线框“素材预留”，不会请求不存在的图片。

### 四季展映大图

```json
"seasons": {
  "春": "/works/seasons/spring.jpg",
  "夏": "/works/seasons/summer.jpg",
  "秋": "/works/seasons/autumn.jpg",
  "冬": "/works/seasons/winter.jpg"
}
```

这是 `experience` 下的 `seasons`。它与单个案例的季节标签相互独立。大图按全屏裁切，主体应避开最边缘；四季展映入口会跳到相应季节的作品索引。

### 单个案例

图片放入对应编号的目录，例如：

```text
public/works/look-01/cover.jpg
public/works/look-01/source.jpg
public/works/look-01/styling.jpg
public/works/look-01/detail-01.jpg
```

配置中使用以 `/works/` 开头的路径：

```json
{
  "id": "look-01",
  "title": "拼色轻外套",
  "subtitle": "Little layers, bright days.",
  "seasons": ["春", "秋"],
  "category": "外套",
  "direction": "替换为实际的搭配思路与创作说明。",
  "roles": ["搭配构思", "AI 模特生成", "服装上身", "后期精修"],
  "cover": "/works/look-01/cover.jpg",
  "sourceImage": "/works/look-01/source.jpg",
  "stylingImage": "/works/look-01/styling.jpg",
  "gallery": ["/works/look-01/detail-01.jpg"]
}
```

- 默认方形封面，可增加 `"coverRatio": "3 / 4"` 或 `"coverRatio": "4 / 5"`。
- 图片为空时保留画框；图片错误时显示“图片暂不可用”。
- 详情图片使用完整显示，避免裁掉服装或主图文字。
- 新增案例时使用唯一 id；新服装品类会自动进入筛选器。
- 跨季节作品在总画廊中只出现一次，在对应季节下分别可查到。
- 暂定案例标题、文案和职责是可编辑的规划内容，填图时按实际情况更新。

## 更新与构建

开发模式修改 JSON 后刷新即可。生产预览需要先 `npm run build` 再刷新。本项目为静态作品集，尚未连接上传后台或数据库，也没有发布到公网。

## 动效与可访问性

所有滚动动效使用单一 requestAnimationFrame 调度，空闲时停止请求动画帧；视频定位至少间隔 30ms。提供减少动态效果模式：视频停在首帧，拼贴不再移动，四季变为静态网格，并移除长滚动占位。菜单支持焦点约束与 Escape；作品详情关闭后恢复原焦点。

## 文件

- `index.html`：全部页面结构、样式和逻辑。
- `public/portfolio.json`：唯一的数据和素材配置入口。
- `public/works/`：后续添加作品图片与视频。
- `references/alp1ne-motion-brief.txt`：本次完整视觉与动效规范。
- `DESIGN.md`、`QA.md`：设计依据与验证记录。
- `archive/kidswear-editorial/`：上一版白底画册的完整源码与配置备份。
- `archive/reverie/`：最初梦幻版的源码和生成素材备份。
