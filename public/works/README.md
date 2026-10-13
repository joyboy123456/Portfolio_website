# 作品图片目录

每组作品使用与 portfolio.json 中 id 相同的目录，例如：

    public/works/look-01/cover.jpg
    public/works/look-01/source.jpg
    public/works/look-01/styling.jpg
    public/works/look-01/detail-01.jpg

然后填写 public/portfolio.json：

    "cover": "/works/look-01/cover.jpg",
    "sourceImage": "/works/look-01/source.jpg",
    "stylingImage": "/works/look-01/styling.jpg",
    "gallery": ["/works/look-01/detail-01.jpg"]

空字符串会显示画廊留白框，不需要放临时图片。封面默认方形，适合电商主图；竖幅作品可以在该项目中补充 "coverRatio": "3 / 4" 或 "coverRatio": "4 / 5"。详情图片完整显示、不裁切。填写图片后重新运行 npm run build，刷新生产预览即可。

## oss/ —— 线上作品图的本地副本

`public/works/oss/` 存放从阿里云 OSS（heinimumu.oss-cn-hangzhou.aliyuncs.com）下载的作品图，
已转为 webp（长边最大 1600px，质量 80）；`oss/thumb/` 为长边 768px 的小图，供 3D 卡片和屏幕贴图使用。

OSS 不返回 CORS 头，图片无法直接作为 WebGL 贴图，所以 portfolio.json 中的图片字段都指向这里的本地副本。
视频（experience.heroVideo、story.films[].src）仍使用 OSS 地址，只在 <video> 中播放。

新增图片时：放入 `oss/<名称>.webp` 并在 `oss/thumb/<名称>.webp` 放一张小图，再在 portfolio.json 中引用 `/works/oss/<名称>.webp`。
