/**
 * Studio（创作）房间内容
 *
 * 旋转塔上的每块屏幕都来自 public/portfolio.json：
 * - 电视（tv）：experience.heroVideo 影像作品
 * - 显示器（monitor）：创作过程四个环节（与作品 roles 对应）
 * - 显示器（monitor）：experience.collage 中的 7 张创作过程拼贴图（外套、裤装……）
 * - 手机（phone）：按季节分组的造型系列
 */
import { PROCESS_STEPS } from '../../../../content/copy';
import { groupBySeason, COLLAGE_LABELS, thumbOf } from '../../../../content/portfolio';

export const PLATFORM_CONFIG = {
    video: {
        color: '#e9a23b',
        accentColor: '#c9821b',
        icon: '▶',
        label: '影像作品',
        shape: 'tv',
    },
    process: {
        color: '#6d9bc3',
        accentColor: '#4f7da5',
        icon: '✎',
        label: '创作过程',
        shape: 'monitor',
    },
    season: {
        color: '#8fbf7a',
        accentColor: '#6f9f5a',
        icon: '✿',
        label: '季节系列',
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
            title: experience.heroLabel || '影像作品',
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
            title: step.role,
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
            title: name,
            summary: '创作过程拼贴',
            image: src,
            thumb: thumbOf(src),
            description: '',
            meta: '创作过程拼贴',
        });
    });

    groupBySeason(projects).forEach(({ season, items: looks }) => {
        items.push({
            id: `season-${season}`,
            platform: 'season',
            device: 'phone',
            title: season,
            summary: `${looks.length} 组造型`,
            lines: looks.map((l) => l.title),
            description: `${SEASON_NOTES[season] || ''}${SEASON_NOTES[season] ? '。' : ''}本季作品：${looks.map((l) => l.title).join('、')}。`,
            meta: `${looks.length} 组造型`,
        });
    });

    return items;
}
