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

// 网站定位（入口招牌、走廊标题、SEO 共用）
export const SITE_IDENTITY = {
    title: '史雪 · AI 童装电商素材设计',
    subtitle: '一件衣服进来，一整套可上架的主图、模特图、系列图出去',
    // 走廊大标题：上行逐字拆分，下行为副标题
    heroMain: '一件衣服',
    heroSub: ['→', '一套会卖货的画面'],
};

// 走廊里四扇门的显示名称（内部 id 不变；顺序：案例 → 流程 → 关于 → 合作）
export const ROOM_LABELS = {
    gallery: '案例',
    studio: '流程',
    about: '关于',
    contact: '合作',
};

export const ROOM_SUBTITLES = {
    gallery: '真实上架的电商素材',
    studio: '从商品图到主图的生产线',
    about: '我是谁、用什么、交付什么',
    contact: '需要一组上新素材？',
};

// 能对外说明的交付物（只写真实做过的）
export const DELIVERABLES = ['电商主图', 'AI 模特上身图', '系列造型图'];
// 常用工具（与入口门上的贴纸一致）
export const TOOLS = ['Photoshop', '即梦', 'Lovart', 'ComfyUI', 'OpenAI', 'Gemini', 'Vibe Coding'];
// 内容平台（与“流程”门上的贴纸一致）
export const PLATFORMS = ['淘宝', '小红书', '抖音'];

// 素材生产线（Studio 房间）：输入 → 四个制作环节 → 交付
// 中间四步与 portfolio.json 中 roles 的四个环节一一对应（role 字段用于统计）
export const PROCESS_STEPS = [
    {
        id: 'input',
        role: '输入',
        title: '输入商品图',
        index: '01',
        summary: '平铺图 / 白底图',
        description: '生产线的起点：一件衣服的平铺图或白底商品图。先看清款式、颜色、图案和面料，作为后面每一步的还原依据。',
    },
    {
        id: 'styling',
        role: '搭配构思',
        title: '搭配构思',
        index: '02',
        summary: '内搭、下装、配饰',
        description: '从这件服装出发，选择内搭、下装、配饰与整体配色，先把完整造型想清楚。',
    },
    {
        id: 'model',
        role: 'AI 模特生成',
        title: 'AI 模特生成',
        index: '03',
        summary: '年龄感、姿态、场景',
        description: '根据造型方向确定模特年龄感、姿态与场景氛围，用 AI 生成自然、有童趣的模特形象。',
    },
    {
        id: 'try-on',
        role: '服装上身',
        title: '服装上身还原',
        index: '04',
        summary: '版型与颜色还原',
        description: '把服装穿到模特身上，重点检查版型、长度、颜色与图案细节，尽量还原商品本身。',
    },
    {
        id: 'retouch',
        role: '后期精修',
        title: '后期精修',
        index: '05',
        summary: '光影、褶皱、色调',
        description: '修整光影、褶皱与边缘细节，统一整组画面的色调，让每一张图都完整、清晰。',
    },
    {
        id: 'deliver',
        role: '交付',
        title: '交付',
        index: '06',
        summary: '主图 / 上身图 / 系列图',
        description: '交付一整套可上架的电商素材：电商主图、AI 模特上身图、系列造型图。',
    },
];

// 入口处小鸭子的随机台词（电商素材生产线版）
export const DUCK_QUOTES = [
    '白底图进来，模特图出去。',
    '颜色要和实物一致哦。',
    '主图第一眼就要看清卖点。',
    '一个模特，一整组系列图。',
    '平铺图也能穿上身！',
    '袖口领口，细节别跑偏。',
    '今天上新几件？',
    '四季上新，一条生产线。',
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
