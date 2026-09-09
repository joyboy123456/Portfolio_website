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
