/**
 * Studio（创作）房间内容
 *
 * 旋转塔上的每块屏幕都来自 public/portfolio.json：
 * - 电视（tv）：experience.heroVideo（AI 影像）
 * - 显示器（monitor）：素材生产线六个环节（输入 → 搭配 → AI 模特 → 上身还原 → 精修 → 交付）
 * - 显示器（monitor）：experience.collage 中的 7 张输入素材（外套、裤装……）
 * - 手机（phone）：四季上新企划（12 组造型，纯文字）
 */
import { PROCESS_STEPS } from '../../../../content/copy';
import { groupBySeason, COLLAGE_LABELS, thumbOf } from '../../../../content/portfolio';

export const PLATFORM_CONFIG = {
    video: {
        color: '#e9a23b',
        accentColor: '#c9821b',
        icon: '▶',
        label: 'AI 影像',
        shape: 'tv',
    },
    process: {
        color: '#6d9bc3',
        accentColor: '#4f7da5',
        icon: '✎',
        label: '素材生产线',
        shape: 'monitor',
    },
    season: {
        color: '#8fbf7a',
        accentColor: '#6f9f5a',
        icon: '✿',
        label: '四季上新企划',
        shape: 'phone',
    },
};

const SEASON_NOTES = {
    春: '轻外套与衬衫，清爽的换季造型',
    夏: '短袖、裙装与轻松裤装',
    秋: '卫衣叠穿、撞色外套与运动套装',
    冬: '棉服、针织与保暖层次',
};

export function buildStudioContent(portfolio) {
    const items = [];
    const { experience, projects } = portfolio;

    if (experience.heroVideo) {
        items.push({
            id: 'video-hero',
            platform: 'video',
            device: 'tv',
            title: experience.heroLabel || 'AI 影像',
            description: '户外童装主题的 AI 影像生成展示。',
            poster: experience.heroPoster,
            video: experience.heroVideo,
        });
    }

    PROCESS_STEPS.forEach((step) => {
        const count = projects.filter((p) => p.roles.includes(step.role)).length;
        items.push({
            id: `process-${step.id}`,
            platform: 'process',
            device: 'monitor',
            index: step.index,
            title: step.title || step.role,
            summary: step.summary,
            description: step.description,
            meta: count ? `参与 ${count} 组作品` : '',
        });
    });

    Object.entries(experience.collage || {}).forEach(([key, src]) => {
        if (typeof src !== 'string' || !src.trim()) return;
        const name = COLLAGE_LABELS[key] || key;
        items.push({
            id: `collage-${key}`,
            platform: 'process',
            device: 'monitor',
            title: `输入素材 · ${name}`,
            summary: '输入素材',
            image: src,
            thumb: thumbOf(src),
            description: '',
            meta: '生产线输入素材',
        });
    });

    groupBySeason(projects).forEach(({ season, items: looks }) => {
        items.push({
            id: `season-${season}`,
            platform: 'season',
            device: 'phone',
            title: season,
            summary: `${season}季上新 · ${looks.length} 组`,
            lines: looks.map((l) => l.title),
            description: `四季上新企划 · ${season}季：${SEASON_NOTES[season] || ''}${SEASON_NOTES[season] ? '。' : ''}本季造型：${looks.map((l) => l.title).join('、')}。`,
            meta: `${looks.length} 组造型`,
        });
    });

    return items;
}
