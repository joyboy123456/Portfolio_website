# Step Into Wonder

React + TypeScript + Vite 的双场景视差落地页，使用 Viaoda Libre 与 Imprima。

## 运行

```sh
npm install
npm run dev
```

生产构建：`npm run build`。预览生产构建：`npm run preview`。

## 实现

- 所有页面组件、数据、交互与动画位于 `src/App.tsx`。
- 480vh 滚动容器与 100vh sticky 视口，包含幕布入场、五层鼠标视差、拱门放大及两场景交叉淡入淡出。
- 手机、平板、桌面分别使用 Tailwind 的显示断点；`xl` 为 1100px，其他组件样式使用 React 内联样式。
- 九张弧形卡片由滚动驱动，也支持前后按钮、左右方向键和水平滑动。
- 原生弹窗支持 Escape 关闭、焦点恢复和背景滚动锁定。
- 支持 `prefers-reduced-motion`，使用交叉淡入淡出代替大幅缩放与鼠标视差。
- `lucide-react` 按需求保留为依赖，没有导入页面。

## 素材与交互说明

八个原始图片 URL 均保留在 `src/App.tsx`。五个 Cloudinary 图层在验证时返回 401，加载失败后使用 `public/assets/` 中的本地备用图。三张 Higgs 卡片图片在浏览器中正常显示；其 HEAD 请求的 403 不代表浏览器无法显示。

备用图片通过内置 ImageGen 生成，提示词与文件映射见 `ASSET-PROMPTS.md`，视觉决策见 `DESIGN.md`。备用图片是按需求重建的场景，无法与不可访问的原图进行逐像素比对。

需求没有提供视频地址或联系方式，因此 View Reel 打开三张图片的视觉作品集，导航信息在本地弹窗中展示；没有模拟视频播放、发送联系表单或连接远程业务服务。

## 验证

已运行 TypeScript 检查与 Vite 生产构建；在内置浏览器检查桌面、平板、手机布局、双场景切换、九张卡片可达性、作品集翻页、Escape 关闭和焦点恢复。完整记录见 `QA.md`。
