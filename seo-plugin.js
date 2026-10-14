import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * SEO 插件：构建时读取 public/portfolio.json，
 * 生成隐藏的语义化 HTML、JSON-LD 结构化数据与 llms.txt。
 * 不访问网络（生产构建在无网络的沙箱中运行）。
 */
const SITE_URL = 'https://oai.locker';

const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

function readPortfolio(root) {
    try {
        const raw = JSON.parse(readFileSync(resolve(root, 'public/portfolio.json'), 'utf8'));
        const profile = raw.profile || {};
        return {
            brand: profile.brand || '衣着之间',
            name: profile.name || '',
            title: profile.title || 'AI 童装电商素材设计',
            intro: profile.intro || '',
            email: profile.email || '',
            projects: Array.isArray(raw.projects) ? raw.projects : [],
            headline: Array.isArray(raw.story?.headline) ? raw.story.headline.join('') : '',
            positioning: raw.story?.positioning || '',
            cases: Array.isArray(raw.story?.cases) ? raw.story.cases : [],
            pages: Array.isArray(raw.story?.archive) ? raw.story.archive : [],
        };
    } catch (error) {
        console.warn('[seo-plugin] 无法读取 public/portfolio.json：', error.message);
        return { brand: '衣着之间', name: '', title: 'AI 童装电商素材设计', intro: '', email: '', projects: [], headline: '', positioning: '', cases: [], pages: [] };
    }
}

// 对外展示名：优先用真实姓名（史雪），品牌名只作兜底
const displayName = (data) => data.name || data.brand;
const siteTitleOf = (data) => `${displayName(data)} · ${data.title}作品集`;
const TAGLINE = '一件衣服进来，一整套可上架的主图、模特图、系列图出去。';
const DELIVERABLES = ['电商主图', 'AI 模特上身图', '系列造型图'];
const TOOLS = ['Photoshop', '即梦', 'Lovart', 'ComfyUI', 'OpenAI', 'Gemini', 'Vibe Coding'];
const PLATFORMS = ['淘宝', '小红书', '抖音'];
const PROCESS = ['输入平铺/白底商品图', '搭配构思', 'AI 模特生成', '服装上身还原', '后期精修', '交付主图 / 模特上身图 / 系列图'];

function buildSeoHtml(data) {
    const siteTitle = siteTitleOf(data);
    let html = `\n<div id="seo-content" class="sr-only-seo">\n`;
    html += `  <header>\n    <h1>${escapeHtml(siteTitle)}</h1>\n`;
    html += `    <p>${escapeHtml(TAGLINE)}</p>\n`;
    if (data.headline) html += `    <p>${escapeHtml(data.headline)}</p>\n`;
    if (data.positioning) html += `    <p>${escapeHtml(data.positioning)}</p>\n`;
    if (data.intro) html += `    <p>${escapeHtml(data.intro)}</p>\n`;
    html += `    <p>交付：${escapeHtml(DELIVERABLES.join('、'))}</p>\n`;
    html += `    <p>常用工具：${escapeHtml(TOOLS.join('、'))}</p>\n`;
    html += `    <p>内容平台：${escapeHtml(PLATFORMS.join('、'))}</p>\n`;
    html += `  </header>\n`;
    if (data.cases.length > 0) {
        html += `  <section id="cases">\n    <h2>案例</h2>\n    <ul>\n`;
        data.cases.forEach((c) => {
            const meta = [c.client, c.period].filter(Boolean).join(' · ');
            const proof = c.evidence?.image ? ' · 真实上架证据' : '';
            html += `      <li>\n        <h3>${escapeHtml(c.projectName || '')}${meta ? `（${escapeHtml(meta)}）` : ''}${proof}</h3>\n`;
            if (c.focus) html += `        <p>${escapeHtml(c.focus)}</p>\n`;
            if (c.deliverables) html += `        <p>交付：${escapeHtml(c.deliverables)}</p>\n`;
            if (c.evidence?.caption) html += `        <p>${escapeHtml(c.evidence.caption)}</p>\n`;
            html += `      </li>\n`;
        });
        html += `    </ul>\n  </section>\n`;
    }
    if (data.pages.length > 0) {
        html += `  <section id="archive">\n    <h2>往期作品集</h2>\n    <ul>\n`;
        data.pages.forEach((a) => { html += `      <li>${escapeHtml(a.alt || a.label || '')}</li>\n`; });
        html += `    </ul>\n  </section>\n`;
    }
    html += `  <nav aria-label="主导航">\n    <ul>\n`;
    html += `      <li><a href="/">首页（走廊）</a></li>\n      <li><a href="/gallery">案例</a></li>\n      <li><a href="/studio">流程</a></li>\n      <li><a href="/about">关于</a></li>\n      <li><a href="/contact">合作</a></li>\n`;
    html += `    </ul>\n  </nav>\n`;
    if (data.projects.length > 0) {
        html += `  <section id="projects">\n    <h2>四季上新企划</h2>\n    <ul>\n`;
        data.projects.forEach((p) => {
            const meta = [p.category, Array.isArray(p.seasons) ? p.seasons.join('、') : ''].filter(Boolean).join(' · ');
            html += `      <li>\n        <h3>${escapeHtml(p.title || '')}${meta ? `（${escapeHtml(meta)}）` : ''}</h3>\n`;
            if (p.direction) html += `        <p>${escapeHtml(p.direction)}</p>\n`;
            html += `      </li>\n`;
        });
        html += `    </ul>\n  </section>\n`;
    }
    html += `  <section id="process">\n    <h2>素材生产线</h2>\n    <p>${escapeHtml(PROCESS.join(' → '))}</p>\n  </section>\n`;
    html += `</div>\n`;
    return html;
}

function buildJsonLd(data) {
    const person = {
        '@type': data.name ? 'Person' : 'Organization',
        '@id': `${SITE_URL}/#creator`,
        name: data.name || data.brand,
        url: SITE_URL,
        description: data.intro || undefined,
        knowsAbout: ['AI 童装电商素材', '电商主图', 'AI 模特上身图', '系列造型图', '童装搭配', ...TOOLS],
    };
    if (data.name) person.jobTitle = data.title;
    return {
        '@context': 'https://schema.org',
        '@graph': [
            person,
            {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                url: SITE_URL,
                name: siteTitleOf(data),
                inLanguage: 'zh-CN',
                publisher: { '@id': `${SITE_URL}/#creator` },
            },
            {
                '@type': 'ItemList',
                '@id': `${SITE_URL}/#works`,
                name: '作品',
                itemListElement: data.projects.map((p, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    item: {
                        '@type': 'CreativeWork',
                        name: p.title,
                        genre: p.category || undefined,
                        description: p.direction || undefined,
                        creator: { '@id': `${SITE_URL}/#creator` },
                    },
                })),
            },
        ],
    };
}

function buildLlmsTxt(data) {
    let text = `# ${displayName(data)} · ${data.title}\n> ${TAGLINE} · ${SITE_URL}\n\n`;
    if (data.positioning) text += `${data.positioning}\n\n`;
    if (data.intro) text += `${data.intro}\n\n`;
    if (data.cases.length > 0) {
        text += `## 案例\n`;
        data.cases.forEach((c) => { text += `- **${c.projectName || ''}**${c.client ? `（${c.client}）` : ''}${c.evidence?.image ? '（真实上架证据）' : ''}：${c.focus || ''}${c.deliverables ? ` 交付：${c.deliverables}。` : ''}\n`; });
        text += `\n`;
    }
    text += `## 交付\n${DELIVERABLES.map((d) => `- ${d}`).join('\n')}\n\n`;
    text += `## 素材生产线\n${PROCESS.map((d) => `- ${d}`).join('\n')}\n\n`;
    text += `## 工具与平台\n- 工具：${TOOLS.join('、')}\n- 内容平台：${PLATFORMS.join('、')}\n\n`;
    if (data.projects.length > 0) {
        text += `## 四季上新企划（造型构思）\n`;
        data.projects.forEach((p) => {
            const meta = [p.category, Array.isArray(p.seasons) ? p.seasons.join('、') : ''].filter(Boolean).join(' · ');
            text += `- **${p.title}**${meta ? `（${meta}）` : ''}：${p.direction || ''}\n`;
        });
        text += `\n`;
    }
    text += `---\n3D 场景基于开源项目 portfolio-itom（Tomasz Szmajda，MIT 许可证）。\n`;
    return text;
}

export function generateSeoHtml() {
    let root = process.cwd();
    return {
        name: 'portfolio-seo-plugin',
        configResolved(config) {
            root = config.root;
        },
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url === '/llms.txt') {
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end(buildLlmsTxt(readPortfolio(root)));
                } else {
                    next();
                }
            });
        },
        transformIndexHtml(html) {
            const data = readPortfolio(root);
            const siteTitle = siteTitleOf(data);
            const description = `${displayName(data)}：用 AI 生成童装电商素材。一件衣服进来，一整套可上架的${DELIVERABLES.join('、')}出去。`;
            const jsonLd = `\n  <script type="application/ld+json">\n${JSON.stringify(buildJsonLd(data), null, 2)}\n  </script>\n`;
            let out = html
                .replace(/<title>(.*?)<\/title>/, `<title>${escapeHtml(siteTitle)}</title>`)
                .replace(/<meta name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`)
                .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(siteTitle)}" />`)
                .replace(/<meta property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
                .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(siteTitle)}" />`)
                .replace(/<meta name="twitter:description"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
                .replace('</head>', `${jsonLd}</head>`);
            out = out.replace(/<div id="seo-content" class="sr-only-seo">[\s\S]*?<\/div>/, buildSeoHtml(data));
            return out;
        },
        generateBundle() {
            this.emitFile({ type: 'asset', fileName: 'llms.txt', source: buildLlmsTxt(readPortfolio(root)) });
        },
    };
}
