/**
 * 界面文案（中文）与字体配置。
 * 作品、简介、联系方式等个人内容请编辑 public/portfolio.json；
 * 这里只放与内容无关的界面文字。
 */

// 站内唯一的中文字体：站酷快乐体 ZCOOL KuaiLe（SIL OFL 1.1，完整 GB2312 字库）
// troika(drei <Text>)、CSS 与 canvas 共用同一个文件，浏览器只下载一次。
export const FONT_CN = '/fonts/ZCOOLKuaiLe-Regular.woff';
export const FONT_CN_FAMILY = 'ZCOOL KuaiLe';

export const SITE_URL = 'https://oai.locker';

// 走廊里四扇门的显示名称（内部 id 不变）
export const ROOM_LABELS = {
    gallery: '作品',
    studio: '创作',
    about: '关于',
    contact: '联系',
};

export const ROOM_SUBTITLES = {
    gallery: '案例与作品集',
    studio: '从一件衣服到一张主图',
    about: '关于衣着之间',
    contact: '与我联系',
};

// 创作过程（Studio 房间）：与 portfolio.json 中 roles 的四个环节一一对应
export const PROCESS_STEPS = [
    {
        id: 'styling',
        role: '搭配构思',
        index: '01',
        summary: '从一件服装出发',
        description: '从一件服装出发，选择内搭、下装、配饰与整体配色，先在纸面上把完整造型想清楚。',
    },
    {
        id: 'model',
        role: 'AI 模特生成',
        index: '02',
        summary: '确定模特风格',
        description: '根据造型方向确定模特年龄感、姿态与场景氛围，用 AI 生成自然、有童趣的模特形象。',
    },
    {
        id: 'try-on',
        role: '服装上身',
        index: '03',
        summary: '版型与颜色还原',
        description: '把服装穿到模特身上，重点检查版型、长度、颜色与图案细节，尽量还原商品本身。',
    },
    {
        id: 'retouch',
        role: '后期精修',
        index: '04',
        summary: '完成每一张主图',
        description: '修整光影、褶皱与边缘细节，统一整组画面的色调，让每一张主图都完整、清晰。',
    },
];

// 入口处小鸭子的随机台词
export const DUCK_QUOTES = [
    '今天想穿哪件小外套？',
    '配色先从一件单品开始。',
    '裤长刚好，跑跳不绊脚！',
    '帽子是造型的小句号。',
    '细节还原，才是好主图。',
    '春夏秋冬，都有小冒险。',
    '内搭露出一点点就好。',
    '颜色要和商品图一致哦。',
];

// 新手提示 / 成就
export const ACHIEVEMENT_COPY = {
    corridor_enter: { label: '点击一扇门进入房间', title: '探索者' },
    corridor_explore: { label: '滚动浏览走廊', title: '漫游者' },
    about_fly: { label: '滚动，飞过我的故事', title: '云端旅人' },
    studio_interact: { label: '拖动旋转，浏览创作过程', title: '导演' },
    gallery_inspect: { label: '点击卡片查看作品', title: '观察家' },
    contact_choose: { label: '找到联系方式', title: '社交达人' },
};
