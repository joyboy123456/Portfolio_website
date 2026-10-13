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
    profile: { name: '', brand: '衣着之间', title: 'AI 童装电商视觉设计', intro: '', phone: '', email: '', wechat: '', resumeUrl: '' },
    projects: [],
    experience: { heroVideo: '', heroPoster: '', heroLabel: '', collage: {}, seasons: {} },
    story: { headline: [], positioning: '', cases: [], archive: [], films: [] },
};

// 作品集页面分组（来自 archive[].label 的第一段）
const ARCHIVE_GROUPS = {
    womenswear: '女装',
    childrenswear: '童装',
    archive: '往期',
};

// 创作过程拼贴图（experience.collage）的中文名称
export const COLLAGE_LABELS = {
    jacket: '外套',
    trousers: '裤装',
    top: '上衣',
    hat: '帽子',
    dress: '裙装',
    set: '套装',
    accessory: '配饰',
};

/** 本地作品图对应的小尺寸贴图（public/works/oss/thumb/），用于 3D 卡片与屏幕 */
export function thumbOf(src) {
    return typeof src === 'string' && src.startsWith('/works/oss/') && !src.includes('/thumb/')
        ? src.replace('/works/oss/', '/works/oss/thumb/')
        : src;
}

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
        phone: str(p.phone),
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

    const st = data.story || {};
    const cases = arr(st.cases).map((c, index) => {
        const it = c || {};
        const ev = it.evidence || {};
        const evidence = { image: str(ev.image), caption: str(ev.caption) };
        const cover = str(it.cover) || evidence.image || str(it.preview);
        const images = [];
        const push = (src, label) => { if (src && !images.some((x) => x.src === src)) images.push({ src, label }); };
        push(str(it.cover), '主视觉');
        push(str(it.secondaryCover), '细节');
        push(evidence.image, evidence.caption || '上线记录');
        arr(it.gallery).map(str).filter(Boolean).forEach((g, k) => push(g, `图 ${k + 1}`));
        return {
            kind: 'case',
            id: str(it.id) || `case-${String(index + 1).padStart(2, '0')}`,
            number: String(index + 1).padStart(2, '0'),
            title: str(it.projectName) || `案例 ${index + 1}`,
            client: str(it.client),
            period: str(it.period),
            role: str(it.role),
            deliverables: str(it.deliverables),
            direction: str(it.direction),
            focus: str(it.focus),
            challenge: str(it.challenge),
            decision: str(it.decision),
            contribution: str(it.contribution),
            outcome: str(it.outcome),
            evidence,
            cover,
            images,
        };
    });

    const archive = arr(st.archive).map((a, index) => {
        const it = a || {};
        const label = str(it.label);
        const parts = label.split('/').map((x) => x.trim());
        const groupKey = (parts[0] || '').toLowerCase();
        return {
            kind: 'page',
            id: `page-${String(index + 1).padStart(2, '0')}`,
            src: str(it.src),
            alt: str(it.alt),
            label,
            group: ARCHIVE_GROUPS[groupKey] || parts[0] || '作品',
            groupEn: parts[0] || '',
            year: parts[1] || '',
            pageNo: parts[2] || String(index + 1).padStart(2, '0'),
            pageTotal: parts[3] || '',
            width: Number(it.width) || 0,
            height: Number(it.height) || 0,
        };
    }).filter((a) => a.src);

    const story = {
        headline: arr(st.headline).map(str).filter(Boolean),
        positioning: str(st.positioning),
        cases,
        archive,
        films: arr(st.films),
    };

    return { profile, projects, experience, story };
}

/**
 * 作品墙（Gallery）展示顺序：先 3 个案例，再按 女装 / 童装 / 往期 排列的作品集页面。
 * 只包含有真实图片的作品；没有图片的 12 组造型不会出现在这里。
 */
export function getGalleryWorks(portfolio) {
    const story = portfolio?.story || EMPTY.story;
    const cases = (story.cases || []).filter((c) => c.cover);
    const pages = story.archive || [];
    return [...cases, ...pages];
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
    if (profile?.phone) list.push({ id: 'phone', label: '电话', value: profile.phone, url: `tel:${profile.phone.replace(/[^\d+]/g, '')}` });
    if (profile?.email) list.push({ id: 'email', label: '邮箱', value: profile.email, url: `mailto:${profile.email}` });
    if (profile?.wechat) list.push({ id: 'wechat', label: '微信', value: profile.wechat, url: null });
    if (profile?.resumeUrl) list.push({ id: 'resume', label: '简历', value: '查看简历', url: profile.resumeUrl });
    return list;
}

// 尽早开始加载
if (typeof window !== 'undefined') loadPortfolio();
