/**
 * 运行时用 canvas 生成的手绘风贴图（作品卡片、创作塔屏幕）。
 *
 * 作品图片为空时绘制“纸上草图”占位卡，绝不生成假的作品图片；
 * 在 portfolio.json 中填写 cover / gallery 后会自动换成真实图片。
 * 结果是 data URL，可以直接交给 drei 的 useTexture / useLoader。
 */
import { FONT_CN, FONT_CN_FAMILY, PROCESS_STEPS } from '../content/copy';

const INK = '#1c1c1c';
const SOFT_INK = 'rgba(28,28,28,0.55)';

let fontPromise = null;
export function ensureCanvasFont() {
    if (typeof document === 'undefined') return Promise.resolve();
    if (!fontPromise) {
        fontPromise = (async () => {
            try {
                const face = new FontFace(FONT_CN_FAMILY, `url(${FONT_CN})`);
                await face.load();
                document.fonts.add(face);
            } catch (e) {
                // 字体失败时退回系统字体，不阻塞页面
            }
        })();
    }
    return fontPromise;
}

const imageCache = new Map();
export function loadImage(src) {
    if (!src) return Promise.resolve(null);
    if (!imageCache.has(src)) {
        imageCache.set(src, new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        }));
    }
    return imageCache.get(src);
}

const font = (size) => `${size}px "${FONT_CN_FAMILY}", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`;

// 简单可复现的伪随机数（同一作品每次绘制一致）
function rng(seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

function sketchLine(ctx, x1, y1, x2, y2, rand, passes = 2, jitter = 3) {
    for (let p = 0; p < passes; p++) {
        ctx.beginPath();
        const j = () => (rand() - 0.5) * jitter;
        ctx.moveTo(x1 + j(), y1 + j());
        const mx = (x1 + x2) / 2 + j() * 2;
        const my = (y1 + y2) / 2 + j() * 2;
        ctx.quadraticCurveTo(mx, my, x2 + j(), y2 + j());
        ctx.stroke();
    }
}

function sketchPath(ctx, points, rand, closed = false, passes = 2) {
    for (let i = 0; i < points.length - 1; i++) {
        sketchLine(ctx, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], rand, passes);
    }
    if (closed) {
        const a = points[points.length - 1];
        sketchLine(ctx, a[0], a[1], points[0][0], points[0][1], rand, passes);
    }
}

function hatch(ctx, x, y, w, h, rand, spacing = 26, alpha = 0.08) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.strokeStyle = `rgba(28,28,28,${alpha})`;
    ctx.lineWidth = 2;
    for (let d = -h; d < w; d += spacing) {
        sketchLine(ctx, x + d, y + h, x + d + h, y, rand, 1, 6);
    }
    ctx.restore();
}

// 按品类画一个简笔服装轮廓（单位坐标 0..1，再缩放到目标框）
const GARMENTS = {
    top: [[0.3, 0.12], [0.42, 0.06], [0.5, 0.12], [0.58, 0.06], [0.7, 0.12], [0.92, 0.32], [0.8, 0.44], [0.72, 0.36], [0.72, 0.92], [0.28, 0.92], [0.28, 0.36], [0.2, 0.44], [0.08, 0.32]],
    jacket: [[0.32, 0.08], [0.44, 0.04], [0.5, 0.16], [0.56, 0.04], [0.68, 0.08], [0.9, 0.3], [0.94, 0.86], [0.8, 0.86], [0.76, 0.42], [0.76, 0.94], [0.24, 0.94], [0.24, 0.42], [0.2, 0.86], [0.06, 0.86], [0.1, 0.3]],
    dress: [[0.38, 0.06], [0.46, 0.12], [0.54, 0.12], [0.62, 0.06], [0.66, 0.34], [0.6, 0.42], [0.86, 0.94], [0.14, 0.94], [0.4, 0.42], [0.34, 0.34]],
    pants: [[0.26, 0.06], [0.74, 0.06], [0.8, 0.94], [0.58, 0.94], [0.5, 0.36], [0.42, 0.94], [0.2, 0.94]],
};

function garmentFor(category) {
    if (/裙/.test(category)) return ['dress'];
    if (/裤/.test(category)) return ['pants'];
    if (/套装/.test(category)) return ['top', 'pants'];
    if (/外套|卫衣|针织/.test(category)) return ['jacket'];
    return ['top'];
}

function drawGarment(ctx, kind, x, y, w, h, rand) {
    const pts = GARMENTS[kind].map(([px, py]) => [x + px * w, y + py * h]);
    sketchPath(ctx, pts, rand, true, 2);
    if (kind === 'jacket') {
        sketchLine(ctx, x + 0.5 * w, y + 0.16 * h, x + 0.5 * w, y + 0.94 * h, rand, 2);
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(x + 0.55 * w, y + (0.3 + i * 0.15) * h, 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    if (kind === 'top') {
        sketchLine(ctx, x + 0.42 * w, y + 0.06 * h, x + 0.5 * w, y + 0.18 * h, rand, 1);
        sketchLine(ctx, x + 0.5 * w, y + 0.18 * h, x + 0.58 * w, y + 0.06 * h, rand, 1);
    }
}

function wrapText(ctx, text, maxWidth) {
    const lines = [];
    let line = '';
    for (const ch of text) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = ch;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function drawCover(ctx, img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (img.width - sw) / 2;
    const sy = Math.max(0, (img.height - sh) * 0.3);
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// ---------------------------------------------------------------------------
// 作品卡片正面（1024 x 2048，标题由 3D <Text> 叠加在顶部方框内）
// ---------------------------------------------------------------------------
const CARD_INNER = { x: 124, y: 614, w: 782, h: 1282 };

async function renderLookCard(project, painted) {
    const template = await loadImage(painted ? '/textures/gallery/card_front_painted.webp' : '/textures/gallery/card_front.webp');
    const cover = await loadImage(project.cover);
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (template) ctx.drawImage(template, 0, 0, 1024, 2048);
    else {
        ctx.fillStyle = '#fbf8f1';
        ctx.fillRect(0, 0, 1024, 2048);
    }

    const rand = rng(project.id + (painted ? 'p' : 's'));
    const { x, y, w, h } = CARD_INNER;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (cover) {
        drawCover(ctx, cover, x + 14, y + 14, w - 28, h - 28);
    } else {
        // —— 占位草图：编号、简笔服装轮廓、品类与季节 ——
        hatch(ctx, x + 10, y + 10, w - 20, h - 20, rand, 30, painted ? 0.06 : 0.07);

        ctx.fillStyle = INK;
        ctx.font = font(64);
        ctx.textBaseline = 'top';
        ctx.fillText(`LOOK ${project.number}`, x + 50, y + 50);

        ctx.strokeStyle = INK;
        ctx.lineWidth = 5;
        const kinds = garmentFor(project.category);
        if (kinds.length === 1) {
            drawGarment(ctx, kinds[0], x + w * 0.2, y + h * 0.17, w * 0.6, h * 0.42, rand);
        } else {
            drawGarment(ctx, kinds[0], x + w * 0.24, y + h * 0.14, w * 0.52, h * 0.26, rand);
            drawGarment(ctx, kinds[1], x + w * 0.3, y + h * 0.39, w * 0.4, h * 0.26, rand);
        }

        // 品类 · 季节
        ctx.font = font(66);
        ctx.textAlign = 'center';
        const tag = [project.category, project.seasons.join(' · ')].filter(Boolean).join('  /  ');
        ctx.fillText(tag, x + w / 2, y + h * 0.69);

        // 英文副标题
        if (project.subtitle) {
            ctx.font = font(44);
            ctx.fillStyle = SOFT_INK;
            const lines = wrapText(ctx, project.subtitle, w - 140);
            lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, x + w / 2, y + h * 0.77 + i * 58));
        }

        // 虚线框：说明作品图待补充（不是假图片）
        const bx = x + 130, by = y + h * 0.88, bw = w - 260, bh = 96;
        ctx.setLineDash([16, 12]);
        ctx.strokeStyle = SOFT_INK;
        ctx.lineWidth = 4;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        ctx.fillStyle = SOFT_INK;
        ctx.font = font(44);
        ctx.textBaseline = 'middle';
        ctx.fillText('作品图整理中', x + w / 2, by + bh / 2 + 2);
        ctx.textAlign = 'left';
    }

    return canvas.toDataURL('image/webp', 0.86);
}

const lookCardCache = new Map();
/** 返回 { [projectId]: { front, painted } } 的 Promise（结果缓存） */
export function loadLookCardTextures(projects, withPainted) {
    const key = projects.map((p) => `${p.id}:${p.cover}`).join('|') + (withPainted ? ':p' : '');
    if (!lookCardCache.has(key)) {
        lookCardCache.set(key, (async () => {
            await ensureCanvasFont();
            const result = {};
            for (const project of projects) {
                const front = await renderLookCard(project, false);
                const painted = withPainted ? await renderLookCard(project, true) : front;
                result[project.id] = { front, painted };
            }
            return result;
        })());
    }
    return lookCardCache.get(key);
}

// ---------------------------------------------------------------------------
// 真实作品卡片（案例 / 作品集页面）
// 画布为 512 x 1024（模板 1024 x 2048 的一半），直接作为 CanvasTexture 使用，
// 避免 26 张卡片 × 2 次 webp 编码拖慢加载。图片使用 public/works/oss/thumb/ 小图。
// ---------------------------------------------------------------------------
const WORK_SCALE = 0.5;

function drawContain(ctx, img, x, y, w, h) {
    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = x + (w - dw) / 2;
    ctx.drawImage(img, dx, y, dw, dh);
    return { x: dx, y, w: dw, h: dh };
}

function sketchFrame(ctx, x, y, w, h, rand) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    sketchPath(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], rand, true, 2);
}

async function renderWorkCard(work, painted, thumbOf) {
    const template = await loadImage(painted ? '/textures/gallery/card_front_painted.webp' : '/textures/gallery/card_front.webp');
    const canvas = document.createElement('canvas');
    canvas.width = 1024 * WORK_SCALE;
    canvas.height = 2048 * WORK_SCALE;
    const ctx = canvas.getContext('2d');
    ctx.scale(WORK_SCALE, WORK_SCALE);
    if (template) ctx.drawImage(template, 0, 0, 1024, 2048);
    else { ctx.fillStyle = '#fbf8f1'; ctx.fillRect(0, 0, 1024, 2048); }

    const rand = rng(work.id + (painted ? 'p' : 's'));
    const { x, y, w, h } = CARD_INNER;
    const pad = 36;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    hatch(ctx, x + 10, y + 10, w - 20, h - 20, rand, 34, painted ? 0.05 : 0.06);

    // 图片：案例最多叠放两张（主视觉 + 细节），作品集页面一张
    const srcs = work.kind === 'case'
        ? work.images.slice(0, 2).map((im) => im.src)
        : [work.src];
    const imgs = (await Promise.all(srcs.map((s) => loadImage(thumbOf(s))))).filter(Boolean);
    let cursor = y + pad;
    const maxImgH = imgs.length > 1 ? (h * 0.62) / 2 : h * 0.62;
    imgs.forEach((img) => {
        const r = drawContain(ctx, img, x + pad, cursor, w - pad * 2, maxImgH);
        sketchFrame(ctx, r.x - 6, r.y - 6, r.w + 12, r.h + 12, rand);
        cursor += r.h + 34;
    });

    // 文字说明（全部来自 portfolio.json）
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const cx = x + w / 2;
    cursor += 16;
    if (work.kind === 'case') {
        ctx.font = font(60);
        ctx.fillText(`案例 ${work.number}`, cx, cursor);
        cursor += 84;
        const meta = [work.client, work.period].filter(Boolean).join(' · ');
        if (meta) {
            ctx.font = font(44);
            ctx.fillStyle = SOFT_INK;
            ctx.fillText(meta, cx, cursor);
            cursor += 66;
        }
        ctx.fillStyle = INK;
        ctx.font = font(42);
        const text = work.direction || work.focus;
        wrapText(ctx, text, w - pad * 3).slice(0, 3).forEach((ln) => { ctx.fillText(ln, cx, cursor); cursor += 58; });
    } else {
        ctx.font = font(70);
        ctx.fillText(work.group, cx, cursor);
        cursor += 92;
        ctx.font = font(42);
        ctx.fillStyle = SOFT_INK;
        const meta = [work.groupEn, work.year, work.pageTotal ? `${work.pageNo} / ${work.pageTotal}` : work.pageNo].filter(Boolean).join(' · ');
        ctx.fillText(meta, cx, cursor);
        cursor += 66;
        ctx.fillStyle = INK;
        ctx.font = font(42);
        wrapText(ctx, work.alt, w - pad * 3).slice(0, 3).forEach((ln) => { ctx.fillText(ln, cx, cursor); cursor += 58; });
    }
    ctx.textAlign = 'left';
    return canvas;
}

// 卡片背面：去掉原模板下方的四个小方格，改为放文字信息
async function renderWorkBack(painted) {
    const template = await loadImage(painted ? '/textures/gallery/tylkartki_painted.webp' : '/textures/gallery/tylkartki.webp');
    const canvas = document.createElement('canvas');
    canvas.width = 1024 * WORK_SCALE;
    canvas.height = 2048 * WORK_SCALE;
    const ctx = canvas.getContext('2d');
    ctx.scale(WORK_SCALE, WORK_SCALE);
    if (template) {
        ctx.drawImage(template, 0, 0, 1024, 2048);
        // 用上方大方框内的干净纸面覆盖四个小方格
        ctx.drawImage(template, 140, 300, 760, 290, 100, 1236, 826, 296);
    } else {
        ctx.fillStyle = '#fbf8f1';
        ctx.fillRect(0, 0, 1024, 2048);
    }
    return canvas;
}

const workCardCache = new Map();
/**
 * 返回 Promise<{ cards: { [id]: { front, painted } }, back, backPainted }>，值均为 canvas。
 * thumbOf 用于把作品图换成小尺寸贴图。
 */
export function loadWorkCardTextures(works, withPainted, thumbOf = (s) => s) {
    const key = works.map((w) => `${w.id}:${w.cover || w.src}`).join('|') + (withPainted ? ':p' : '');
    if (!workCardCache.has(key)) {
        workCardCache.set(key, (async () => {
            await ensureCanvasFont();
            const cards = {};
            await Promise.all(works.map(async (work) => {
                const front = await renderWorkCard(work, false, thumbOf);
                const painted = withPainted ? await renderWorkCard(work, true, thumbOf) : front;
                cards[work.id] = { front, painted };
            }));
            const back = await renderWorkBack(false);
            const backPainted = withPainted ? await renderWorkBack(true) : back;
            return { cards, back, backPainted };
        })());
    }
    return workCardCache.get(key);
}

// ---------------------------------------------------------------------------
// 创作塔屏幕（电视 / 显示器 / 手机）
// ---------------------------------------------------------------------------
const SCREENS = {
    tv: { src: '/textures/studio/tv_front.webp', painted: '/textures/studio/tv_front_painted.webp', w: 2048, h: 1024, rect: [214, 126, 1266, 660] },
    monitor: { src: '/textures/studio/monitor_front.webp', painted: '/textures/studio/monitor_front_painted.webp', w: 1024, h: 512, rect: [48, 42, 928, 406] },
    phone: { src: '/textures/studio/phone_front.webp', painted: '/textures/studio/phone_front_painted.webp', w: 1024, h: 2048, rect: [56, 200, 908, 1646] },
};

async function renderScreen(item, painted) {
    const spec = SCREENS[item.device];
    const base = await loadImage(painted ? spec.painted : spec.src);
    const canvas = document.createElement('canvas');
    canvas.width = spec.w;
    canvas.height = spec.h;
    const ctx = canvas.getContext('2d');
    if (base) ctx.drawImage(base, 0, 0, spec.w, spec.h);
    const [x, y, w, h] = spec.rect;
    const rand = rng(item.id + (painted ? 'p' : 's'));
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (item.device === 'tv') {
        const poster = await loadImage(item.poster);
        if (poster) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(x + 10, y + 10, w - 20, h - 20, 60) : ctx.rect(x + 10, y + 10, w - 20, h - 20);
            ctx.clip();
            drawCover(ctx, poster, x + 10, y + 10, w - 20, h - 20);
            ctx.restore();
        }
        // 播放按钮 + 标签
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 22, y + h / 2 - 34);
        ctx.lineTo(x + w / 2 + 36, y + h / 2);
        ctx.lineTo(x + w / 2 - 22, y + h / 2 + 34);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(x + 60, y + h - 130, w - 120, 90);
        ctx.fillStyle = INK;
        ctx.font = font(58);
        ctx.fillText(item.title, x + w / 2, y + h - 85);
    } else if (item.device === 'monitor' && item.image) {
        // 创作过程拼贴图：图片 + 底部标签
        const img = await loadImage(item.thumb || item.image);
        if (img) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + 8, y + 8, w - 16, h - 16);
            ctx.clip();
            drawCover(ctx, img, x + 8, y + 8, w - 16, h - 16);
            ctx.restore();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        const tagW = Math.min(w - 80, 120 + item.title.length * 62);
        ctx.fillRect(x + 30, y + h - 104, tagW, 76);
        ctx.lineWidth = 4;
        ctx.strokeStyle = INK;
        ctx.strokeRect(x + 30, y + h - 104, tagW, 76);
        ctx.fillStyle = INK;
        ctx.font = font(52);
        ctx.fillText(item.title, x + 30 + tagW / 2, y + h - 64);
    } else if (item.device === 'monitor') {
        hatch(ctx, x, y, w, h, rand, 34, 0.05);
        ctx.font = font(150);
        ctx.fillText(item.index || '', x + 150, y + h / 2);
        ctx.lineWidth = 4;
        sketchLine(ctx, x + 270, y + 60, x + 270, y + h - 60, rand, 2);
        ctx.textAlign = 'left';
        ctx.font = font(item.title.length > 5 ? 74 : 86);
        ctx.fillText(item.title, x + 310, y + h * 0.38);
        ctx.font = font(46);
        ctx.fillStyle = SOFT_INK;
        ctx.fillText(item.summary || '', x + 312, y + h * 0.7);
    } else if (item.device === 'phone') {
        hatch(ctx, x, y, w, h, rand, 40, 0.05);
        ctx.font = font(300);
        ctx.fillText(item.title, x + w / 2, y + 260);
        ctx.font = font(64);
        ctx.fillStyle = SOFT_INK;
        ctx.fillText(item.summary || '', x + w / 2, y + 470);
        ctx.fillStyle = INK;
        ctx.font = font(70);
        (item.lines || []).slice(0, 6).forEach((ln, i) => {
            const ly = y + 640 + i * 150;
            ctx.lineWidth = 3;
            sketchLine(ctx, x + 90, ly + 62, x + w - 90, ly + 62, rand, 1, 4);
            ctx.fillText(ln, x + w / 2, ly);
        });
    }

    return canvas.toDataURL('image/webp', 0.86);
}

const screenCache = new Map();
export function loadStudioScreens(items, withPainted) {
    const key = items.map((i) => i.id + (i.poster || '') + (i.image || '')).join('|') + (withPainted ? ':p' : '');
    if (!screenCache.has(key)) {
        screenCache.set(key, (async () => {
            await ensureCanvasFont();
            const out = {};
            for (const item of items) {
                const front = await renderScreen(item, false);
                out[item.id] = { front, painted: withPainted ? await renderScreen(item, true) : front };
            }
            return out;
        })());
    }
    return screenCache.get(key);
}

export { PROCESS_STEPS };
