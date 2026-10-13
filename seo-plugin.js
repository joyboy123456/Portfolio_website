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
            title: profile.title || 'AI 童装电商视觉设计',
            intro: profile.intro || '',
            email: profile.email || '',
            projects: Array.isArray(raw.projects) ? raw.projects : [],
        };
    } catch (error) {
        console.warn('[seo-plugin] 无法读取 public/portfolio.json：', error.message);
        return { brand: '衣着之间', name: '', title: 'AI 童装电商视觉设计', intro: '', email: '', projects: [] };
    }
}

function buildSeoHtml(data) {
    const siteTitle = `${data.brand} · ${data.title}作品集`;
    let html = `\n<div id="seo-content" class="sr-only-seo">\n`;
    html += `  <header>\n    <h1>${escapeHtml(siteTitle)}</h1>\n`;
    if (data.intro) html += `    <p>${escapeHtml(data.intro)}</p>\n`;
    html += `  </header>\n`;
    html += `  <nav aria-label="主导航">\n    <ul>\n`;
    html += `      <li><a href="/">首页（走廊）</a></li>\n      <li><a href="/gallery">作品</a></li>\n      <li><a href="/studio">创作</a></li>\n      <li><a href="/about">关于</a></li>\n      <li><a href="/contact">联系</a></li>\n`;
    html += `    </ul>\n  </nav>\n`;
    if (data.projects.length > 0) {
        html += `  <section id="projects">\n    <h2>作品</h2>\n    <ul>\n`;
        data.projects.forEach((p) => {
            const meta = [p.category, Array.isArray(p.seasons) ? p.seasons.join('、') : ''].filter(Boolean).join(' · ');
            html += `      <li>\n        <h3>${escapeHtml(p.title || '')}${meta ? `（${escapeHtml(meta)}）` : ''}</h3>\n`;
            if (p.direction) html += `        <p>${escapeHtml(p.direction)}</p>\n`;
            html += `      </li>\n`;
        });
        html += `    </ul>\n  </section>\n`;
    }
    html += `  <section id="process">\n    <h2>创作过程</h2>\n    <p>搭配构思 · AI 模特生成 · 服装上身 · 后期精修</p>\n  </section>\n`;
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
        knowsAbout: ['童装搭配', 'AI 电商视觉', 'AI 模特生成', '电商主图后期'],
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
                name: `${data.brand} · ${data.title}作品集`,
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
    let text = `# ${data.brand}\n> ${data.title}作品集 · ${SITE_URL}\n\n`;
    if (data.intro) text += `${data.intro}\n\n`;
    text += `## 创作过程\n- 搭配构思\n- AI 模特生成\n- 服装上身\n- 后期精修\n\n`;
    if (data.projects.length > 0) {
        text += `## 作品\n`;
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
            const siteTitle = `${data.brand} · ${data.title}作品集`;
            const description = data.intro || `${data.brand}：${data.title}作品集。`;
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
