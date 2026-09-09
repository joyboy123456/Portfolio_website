# 衣着之间 · AI 童装视觉作品集

为童装电商视觉设计求职准备的个人作品集网站。白底黑字、柔灰画廊，图片位置留空，后续直接补充作品。

## 运行

```sh
npm install
npm run dev
```

生产构建：`npm run build`。本地生产预览：`npm run preview -- --port 4173`。

## 已有功能

- 12 组案例预留位，全部图片字段留空，不使用商品截图冒充新案例。
- 季节与服装品类组合筛选；一件外套可以同时属于春、秋两季。
- 8 个初始品类：短袖、外套、裤装、套装、卫衣、衬衫、裙装、针织。
- 舒展与紧凑画廊布局，无匹配结果时可清除筛选。
- 点击作品打开详情，切换最终成图、原始单品、搭配过程，并支持更多细节图。
- 手机版布局、键盘焦点、Escape 关闭弹窗、关闭后恢复原位置。
- 关于创作、联系方式和可选简历链接；没有虚构姓名、联系方式、履历、销量或客户评价。

## 后续填充：只需编辑一个文件

个人信息、作品名称、图片路径和分类都在 `public/portfolio.json`。

### 1. 填写个人信息

```json
{
  "name": "她的姓名或艺名",
  "brand": "衣着之间",
  "title": "AI 童装电商视觉设计",
  "intro": "填写她的个人介绍",
  "email": "",
  "wechat": "",
  "resumeUrl": ""
}
```

姓名为空时使用暂定名称“衣着之间”。邮箱、微信和简历可以保持空字符串，页面不会出现虚假的联系入口。填写姓名后，页眉、页脚和浏览器标题同步更新。若要改变搜索引擎读取的静态标题与描述，还可以修改 `index.html` 中的对应内容。

### 2. 放入图片

建议按案例编号建立文件夹：

```text
public/works/look-01/cover.jpg
public/works/look-01/source.jpg
public/works/look-01/styling.jpg
public/works/look-01/detail-01.jpg
```

然后在对应案例中填写：

```json
{
  "id": "look-01",
  "title": "拼色轻外套",
  "subtitle": "Little layers, bright days.",
  "seasons": ["春", "秋"],
  "category": "外套",
  "direction": "用实际的搭配思路替换这段案例规划文案。",
  "roles": ["搭配构思", "AI 模特生成", "服装上身", "后期精修"],
  "cover": "/works/look-01/cover.jpg",
  "sourceImage": "/works/look-01/source.jpg",
  "stylingImage": "/works/look-01/styling.jpg",
  "gallery": ["/works/look-01/detail-01.jpg"]
}
```

- **封面默认方形**，对应参考图中的电商主图。竖幅作品可补充 `"coverRatio": "3 / 4"` 或 `"coverRatio": "4 / 5"`。
- 图片路径从 `/works/` 开始，不要写 `public/works/`。也支持 HTTP(S) 图片链接。
- `cover`、`sourceImage`、`stylingImage` 为空时保留画廊留白框，不产生空链接图片请求。
- 详情图片使用完整显示，避免裁掉服装或主图文字。封面按所选画幅裁切；需要完整封面时请选择与图片一致的画幅。
- 暂定案例名、英文副标题、创作方向和创作环节都是可编辑的规划内容，填图时按实际完成内容更新。
- 添加案例：复制一个项目对象并使用新的唯一 `id`。新增品类只需填写 `category`，筛选器会自动增加该分类。
- 所有案例都显示在画廊中，未填封面的显示“作品待更新”。上线前如需隐藏某个预留案例，把该项目从 `projects` 数组移出即可。
- 季节计数会参考当前品类筛选；跨季节案例在各自季节都可出现，但总画廊只出现一次。

### 3. 更新预览

开发模式下修改 JSON 后刷新页面即可。使用生产预览时，修改后运行 `npm run build`，再刷新浏览器。

这是静态作品集，没有图片上传后台或数据库。把图片放进目录并填写 JSON 后，构建产物会包含图片和内容，可用于后续静态部署。

## 文件结构

```text
src/App.tsx               页面组件、筛选、详情和图片容错
src/index.css             全局样式与键盘焦点
public/portfolio.json     唯一的作品与个人信息配置入口
public/works/             后续作品图片
references/              用户提供的风格参考，不进入生产构建
DESIGN.md                 视觉方向与参考依据
QA.md                     验证记录
archive/reverie/           原版梦幻落地页的源文件备份
```

原版生成素材仍保留在 `public/assets/` 中，新画廊没有引用或加载它们。
