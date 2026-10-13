import { useEffect, useState } from 'react';

/**
 * 作品集内容唯一来源：public/portfolio.json
 *
 * 网站运行时读取 /portfolio.json（不再使用 Sanity CMS）。
 * 修改作品、简介或联系方式时，只需要编辑 public/portfolio.json 并重新部署。
 *
 * - loadPortfolio()        返回一个稳定的 Promise（可直接配合 React 19 的 use()）
 * - usePortfolio()         DOM 组件中使用：首次渲染返回 null，加载完成后返回数据
 * - getPortfolioSync()     已加载时同步读取
 */

const EMPTY = {
    profile: { name: '', brand: '衣着之间', title: 'AI 童装电商视觉设计', intro: '', email: '', wechat: '', resumeUrl: '' },
    projects: [],
    experience: { heroVideo: '', heroPoster: '', heroLabel: '', collage: {}, seasons: {} },
};

let cache = null;
let promise = null;

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const arr = (v) => (Array.isArray(v) ? v : []);

export function normalizePortfolio(raw) {
    const data = raw && typeof raw === 'object' ? raw : {};
    const p = data.profile || {};
    const profile = {
        name: str(p.name),
        brand: str(p.brand) || EMPTY.profile.brand,
        title: str(p.title) || EMPTY.profile.title,
        intro: str(p.intro),
        email: str(p.email),
        wechat: str(p.wechat),
        resumeUrl: str(p.resumeUrl),
    };
    // 展示名：姓名为空时使用品牌名
    profile.displayName = profile.name || profile.brand;

    const projects = arr(data.projects).map((item, index) => {
        const it = item || {};
        const gallery = arr(it.gallery).map(str).filter(Boolean);
        const cover = str(it.cover) || gallery[0] || str(it.stylingImage) || str(it.sourceImage);
        const images = [str(it.cover), str(it.sourceImage), str(it.stylingImage), ...gallery].filter(Boolean);
        return {
            id: str(it.id) || `look-${String(index + 1).padStart(2, '0')}`,
            number: String(index + 1).padStart(2, '0'),
            title: str(it.title) || `作品 ${index + 1}`,
            subtitle: str(it.subtitle),
            seasons: arr(it.seasons).map(str).filter(Boolean),
            category: str(it.category),
            direction: str(it.direction),
            roles: arr(it.roles).map(str).filter(Boolean),
            cover,
            images: Array.from(new Set(images)),
        };
    });

    const e = data.experience || {};
    const experience = {
        heroVideo: str(e.heroVideo),
        heroPoster: str(e.heroPoster),
        heroLabel: str(e.heroLabel),
        collage: e.collage || {},
        seasons: e.seasons || {},
    };

    return { profile, projects, experience };
}

export function loadPortfolio() {
    if (!promise) {
        promise = fetch('/portfolio.json', { cache: 'no-cache' })
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
            .then((json) => {
                cache = normalizePortfolio(json || EMPTY);
                return cache;
            });
    }
    return promise;
}

export function getPortfolioSync() {
    return cache;
}

export function usePortfolio() {
    const [data, setData] = useState(cache);
    useEffect(() => {
        let alive = true;
        if (!cache) loadPortfolio().then((d) => alive && setData(d));
        return () => { alive = false; };
    }, []);
    return data;
}

/** 按季节分组（春/夏/秋/冬），保留 portfolio.json 的顺序 */
export function groupBySeason(projects) {
    const order = ['春', '夏', '秋', '冬'];
    const groups = order.map((season) => ({ season, items: projects.filter((p) => p.seasons.includes(season)) }));
    return groups.filter((g) => g.items.length > 0);
}

/** 联系方式：只返回真实填写的项，空值不会生成任何入口 */
export function getContactChannels(profile) {
    const list = [];
    if (profile?.email) list.push({ id: 'email', label: '邮箱', value: profile.email, url: `mailto:${profile.email}` });
    if (profile?.wechat) list.push({ id: 'wechat', label: '微信', value: profile.wechat, url: null });
    if (profile?.resumeUrl) list.push({ id: 'resume', label: '简历', value: '查看简历', url: profile.resumeUrl });
    return list;
}

// 尽早开始加载
if (typeof window !== 'undefined') loadPortfolio();
