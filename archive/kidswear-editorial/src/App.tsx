import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type Season = '春' | '夏' | '秋' | '冬';
type Project = {
  id: string; title: string; subtitle: string; seasons: Season[]; category: string;
  direction: string; roles: string[]; cover: string; sourceImage: string; stylingImage: string; gallery: string[]; coverRatio?: '1 / 1' | '3 / 4' | '4 / 5';
};
type Profile = { name: string; brand: string; title: string; intro: string; email: string; wechat: string; resumeUrl: string };
type Portfolio = { profile: Profile; projects: Project[] };
type ImageStage = 'cover' | 'sourceImage' | 'stylingImage';
const SEASONS: Season[] = ['春', '夏', '秋', '冬'];
const SEASON_NAMES = { 春: '春季', 夏: '夏季', 秋: '秋季', 冬: '冬季' };
const SEASON_EN = { 春: 'SPRING', 夏: 'SUMMER', 秋: 'AUTUMN', 冬: 'WINTER' };
const CATEGORY_ORDER = ['短袖', '外套', '裤装', '套装', '卫衣', '衬衫', '裙装', '针织'];
const CATEGORY_EN: Record<string, string> = { 短袖: 'T-SHIRTS', 外套: 'OUTERWEAR', 裤装: 'TROUSERS', 套装: 'CO-ORD SETS', 卫衣: 'SWEATSHIRTS', 衬衫: 'SHIRTS', 针织: 'KNITWEAR', 裙装: 'DRESSES' };
const FRAME_COLORS = { 春: '#f0ecee', 夏: '#edf0ed', 秋: '#efede9', 冬: '#e9edef' };
const SANS = "'Imprima', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const SERIF = "'Noto Serif SC', 'Songti SC', 'SimSun', serif";
const DISPLAY = "'Viaoda Libre', Georgia, serif";
const ink = '#22221f';
const muted = '#73736d';
const line = '#deded8';
const micro: CSSProperties = { fontFamily: SANS, fontSize: 11, letterSpacing: '0.13em', textTransform: 'uppercase' };
const buttonReset: CSSProperties = { border: 0, background: 'none', padding: 0, cursor: 'pointer', color: 'inherit', font: 'inherit' };
const sectionStyle: CSSProperties = { maxWidth: 1440, margin: '0 auto', padding: '0 clamp(22px, 5vw, 80px)' };
const visuallyHidden: CSSProperties = { position: 'absolute', width: 1, height: 1, padding: 0, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' };

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return mobile;
}

function parsePortfolio(value: unknown): Portfolio {
  const isRecord = (item: unknown): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item);
  const isStrings = (item: unknown): item is string[] => Array.isArray(item) && item.every((part) => typeof part === 'string');
  if (!isRecord(value) || !isRecord(value.profile) || !Array.isArray(value.projects)) throw new Error('作品资料格式不正确。');
  for (const key of ['name', 'brand', 'title', 'intro', 'email', 'wechat', 'resumeUrl']) {
    if (typeof value.profile[key] !== 'string') throw new Error('个人资料格式不正确。');
  }
  const ids = new Set<string>();
  for (const project of value.projects) {
    if (!isRecord(project)) throw new Error('作品资料格式不正确。');
    for (const key of ['id', 'title', 'subtitle', 'category', 'direction', 'cover', 'sourceImage', 'stylingImage']) {
      if (typeof project[key] !== 'string') throw new Error('作品字段格式不正确。');
    }
    if (!project.id || !project.title || !project.category || ids.has(project.id as string)) throw new Error('作品需要唯一编号、标题和品类。');
    if (!isStrings(project.seasons) || !project.seasons.length || !project.seasons.every((season) => SEASONS.includes(season as Season)) || !isStrings(project.roles) || !isStrings(project.gallery)) throw new Error('作品分类格式不正确。');
    if (project.coverRatio !== undefined && !['1 / 1', '3 / 4', '4 / 5'].includes(project.coverRatio as string)) throw new Error('作品画幅格式不正确。');
    ids.add(project.id as string);
  }
  return value as unknown as Portfolio;
}

function assetUrl(src: string) {
  const path = src.trim();
  return /^(https?:\/\/|\/(?!\/))/.test(path) ? path : '';
}

function Arrow({ diagonal = false, direction = 'right', size = 18 }: { diagonal?: boolean; direction?: 'left' | 'right'; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, transform: direction === 'left' ? 'rotate(180deg)' : undefined }}>
    <path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function LayoutIcon({ compact }: { compact: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    {(compact ? [1, 7, 13] : [1, 10]).map((x) => <rect key={x} x={x} y="2" width={compact ? 4 : 7} height="14" stroke="currentColor" strokeWidth="1" />)}
  </svg>;
}

function ImageFrame({ src, label, number, season = '春', ratio = '3 / 4', detail = false }: { src: string; label: string; number: string; season?: Season; ratio?: string; detail?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const url = assetUrl(src);
  return <div style={{ position: 'relative', width: '100%', aspectRatio: ratio, background: FRAME_COLORS[season], overflow: 'hidden' }}>
    {url && !failed ? <img src={url} alt={label} loading="lazy" decoding="async" onError={() => setFailed(true)} style={{ display: 'block', width: '100%', height: '100%', objectFit: detail ? 'contain' : 'cover' }} /> : <>
      <div aria-hidden="true" style={{ position: 'absolute', inset: '7%', border: '1px solid rgba(110,110,100,0.13)' }}>
        {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((corner) => <span key={corner} style={{ position: 'absolute', width: 11, height: 11, top: corner.startsWith('top') ? -1 : undefined, bottom: corner.startsWith('bottom') ? -1 : undefined, left: corner.endsWith('Left') ? -1 : undefined, right: corner.endsWith('Right') ? -1 : undefined, borderTop: corner.startsWith('top') ? '1px solid #a9aaa1' : undefined, borderBottom: corner.startsWith('bottom') ? '1px solid #a9aaa1' : undefined, borderLeft: corner.endsWith('Left') ? '1px solid #a9aaa1' : undefined, borderRight: corner.endsWith('Right') ? '1px solid #a9aaa1' : undefined }} />)}
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
        <span aria-hidden="true" style={{ fontFamily: DISPLAY, fontSize: 'clamp(58px, 7vw, 100px)', lineHeight: 1, color: '#c2c4bd', fontWeight: 400 }}>{number}</span>
        <span style={{ fontSize: 11, letterSpacing: '0.16em', color: '#63675f' }}>{failed ? '图片暂不可用' : '作品待更新'}</span>
      </div>
      <span style={{ position: 'absolute', bottom: '11%', left: 0, right: 0, textAlign: 'center', ...micro, fontSize: 9, letterSpacing: '0.22em', color: '#63675f' }}>{label}</span>
    </>}
  </div>;
}

function ProjectCard({ project, index, compact, onOpen }: { project: Project; index: number; compact: boolean; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  return <button type="button" aria-label={`查看作品：${project.title}`} onClick={onOpen} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ ...buttonReset, textAlign: 'left', minWidth: 0, display: 'block' }}>
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ transform: hovered ? 'scale(1.025)' : 'scale(1)', transition: 'transform 450ms cubic-bezier(0.2,0.7,0.2,1)' }}>
        <ImageFrame src={project.cover} label={`${SEASON_EN[project.seasons[0]]} / ${CATEGORY_EN[project.category] || project.category}`} number={String(index + 1).padStart(2, '0')} season={project.seasons[0]} ratio={project.coverRatio || '1 / 1'} />
      </div>
      <span style={{ position: 'absolute', bottom: 14, right: 14, width: 34, height: 34, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(5px)', transition: 'opacity 180ms ease, transform 180ms ease' }}><Arrow diagonal size={15} /></span>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, paddingTop: compact ? 13 : 18 }}>
      <h3 style={{ fontSize: compact ? 15 : 19, fontWeight: 400, margin: 0, letterSpacing: '0.025em' }}>{project.title}</h3>
      <span style={{ fontSize: 11, color: muted, whiteSpace: 'nowrap' }}>{project.seasons.join(' / ')} · {project.category}</span>
    </div>
    {!compact && <p style={{ fontSize: 12, color: muted, margin: '8px 0 0', letterSpacing: '0.025em' }}>{project.subtitle}</p>}
  </button>;
}

function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    node.showModal();
    document.body.style.overflow = 'hidden';
    return () => { node.close(); document.body.style.overflow = oldOverflow; previousFocus?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} aria-label={title} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} style={{ padding: 0, border: 0, margin: 'auto', width: 'min(1120px, calc(100% - 28px))', maxWidth: 'none', maxHeight: '92dvh', background: '#fcfcfa', color: ink, overflow: 'auto', overscrollBehavior: 'contain' }}>
    <div style={{ position: 'sticky', top: 0, zIndex: 2, padding: '15px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fcfcfa', borderBottom: `1px solid ${line}` }}>
      <span style={micro}>WARDROBE / PROJECT NOTES</span>
      <button type="button" onClick={onClose} aria-label="关闭作品详情" style={{ ...buttonReset, width: 38, height: 38, fontSize: 26, lineHeight: 1 }}>×</button>
    </div>
    {children}
  </dialog>;
}

function ProjectDetail({ project, number, onClose }: { project: Project; number: string; onClose: () => void }) {
  const [stage, setStage] = useState<ImageStage>('cover');
  const stages: { key: ImageStage; title: string; en: string }[] = [{ key: 'cover', title: '最终成图', en: 'FINAL VISUAL' }, { key: 'sourceImage', title: '原始单品', en: 'THE GARMENT' }, { key: 'stylingImage', title: '搭配过程', en: 'STYLING STUDY' }];
  return <Dialog title={`${project.title} · 作品详情`} onClose={onClose}>
    <div className="grid md:grid-cols-2" style={{ gap: 'clamp(24px, 4vw, 56px)', padding: 'clamp(22px, 4vw, 44px)' }}>
      <div style={{ minWidth: 0 }}>
        <div role="group" aria-label="作品图片类型" style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
          {stages.map((item) => <button key={item.key} type="button" aria-pressed={stage === item.key} onClick={() => setStage(item.key)} style={{ ...buttonReset, fontSize: 12, padding: '4px 0 10px', color: stage === item.key ? ink : muted, borderBottom: `1px solid ${stage === item.key ? ink : 'transparent'}` }}>{item.title}</button>)}
        </div>
        <ImageFrame key={stage} src={project[stage]} label={stages.find((item) => item.key === stage)!.en} number={number} season={project.seasons[0]} ratio={stage === 'cover' ? project.coverRatio || '1 / 1' : '3 / 4'} detail />
      </div>
      <div style={{ paddingTop: 7 }}>
        <p style={{ ...micro, color: muted, margin: '0 0 28px' }}>LOOK {number} / {project.seasons.map((season) => SEASON_EN[season]).join(' · ')}</p>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, margin: '0 0 15px', letterSpacing: '0.03em' }}>{project.title}</h2>
        <p style={{ color: muted, fontSize: 14, margin: '0 0 28px' }}>{project.subtitle}</p>
        {!project.cover && <span style={{ fontSize: 11, border: `1px solid ${line}`, padding: '6px 11px', display: 'inline-block', color: muted }}>案例筹备中</span>}
        <div style={{ borderTop: `1px solid ${line}`, marginTop: 30, paddingTop: 26 }}>
          <h3 style={{ ...micro, fontWeight: 400, margin: '0 0 15px' }}>创作方向 / DIRECTION</h3>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: '#62625c', margin: 0 }}>{project.direction}</p>
        </div>
        <div style={{ borderTop: `1px solid ${line}`, marginTop: 26, paddingTop: 26 }}>
          <h3 style={{ ...micro, fontWeight: 400, margin: '0 0 15px' }}>创作环节 / DISCIPLINES</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px' }}>{project.roles.map((role) => <span key={role} style={{ fontSize: 13, color: '#62625c' }}>{role}</span>)}</div>
        </div>
        <div style={{ marginTop: 32, color: muted, display: 'flex', gap: 20, fontSize: 12 }}><span>品类 · {project.category}</span><span>季节 · {project.seasons.join(' / ')}</span></div>
      </div>
    </div>
    {project.gallery.length > 0 && <div style={{ padding: '0 clamp(22px, 4vw, 44px) 44px' }}>
      <h3 style={{ ...micro, margin: '8px 0 22px', fontWeight: 400 }}>更多画面 / VISUAL DETAILS</h3>
      <div className="grid md:grid-cols-2" style={{ gap: 20 }}>{project.gallery.map((src, index) => <ImageFrame key={`${src}-${index}`} src={src} label={`${project.title} · 细节 ${index + 1}`} number={String(index + 1).padStart(2, '0')} season={project.seasons[0]} detail />)}</div>
    </div>}
  </Dialog>;
}

function App() {
  const [data, setData] = useState<Portfolio | null>(null);
  const [error, setError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [season, setSeason] = useState<Season | '全部'>('全部');
  const [category, setCategory] = useState('全部');
  const [compact, setCompact] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isMobile = useIsMobile();

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    fetch(`${import.meta.env.BASE_URL}portfolio.json`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('作品资料暂时无法加载。'); return response.json() as Promise<unknown>; })
      .then((value) => setData(parsePortfolio(value)))
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '作品资料暂时无法加载。'); });
    return () => controller.abort();
  }, [loadAttempt]);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  useEffect(() => {
    if (data) document.title = `${data.profile.name || data.profile.brand} · ${data.profile.title}作品集`;
  }, [data]);

  const projects = data?.projects ?? [];
  const profile = data?.profile;
  const categorySet = [...new Set(projects.map((project) => project.category))];
  const categories = [...CATEGORY_ORDER.filter((item) => categorySet.includes(item)), ...categorySet.filter((item) => !CATEGORY_ORDER.includes(item))];
  const filtered = projects.filter((project) => (season === '全部' || project.seasons.includes(season)) && (category === '全部' || project.category === category));
  const published = projects.filter((project) => project.cover.trim()).length;
  const resetFilters = () => { setSeason('全部'); setCategory('全部'); };
  const copyWechat = async () => {
    if (!profile?.wechat) return;
    try {
      await navigator.clipboard.writeText(profile.wechat);
      setCopyError(''); setCopied(true); clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch { setCopyError('复制未成功，可以直接选择并复制微信号。'); }
  };

  return <>
    <a className="skip-link" href="#works">跳到作品画廊</a>
    <header id="top" style={{ ...sectionStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: isMobile ? 80 : 96, gap: 20 }}>
      <a href="#top" aria-label="返回作品集首页" style={{ color: ink, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontFamily: SERIF, fontSize: isMobile ? 21 : 24, fontWeight: 500, letterSpacing: '0.12em' }}>{profile?.name || profile?.brand || '衣着之间'}<span style={{ letterSpacing: 0 }}>.</span></span>
        <span style={{ ...micro, fontSize: 8, letterSpacing: '0.18em' }}>AI KIDSWEAR PORTFOLIO</span>
      </a>
      <nav aria-label="主导航" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 21 : 38, fontSize: 12 }}>
        <a href="#works" style={{ color: ink, textDecoration: 'none', padding: '12px 0' }}>作品</a>
        <a href="#approach" className="hidden md:block" style={{ color: muted, textDecoration: 'none', padding: '12px 0' }}>创作方式</a>
        <a href="#about" className="hidden md:block" style={{ color: muted, textDecoration: 'none', padding: '12px 0' }}>关于我</a>
        <a href="#contact" style={{ color: ink, textDecoration: 'none', padding: '12px 0', display: 'flex', gap: 10, alignItems: 'center' }}>联系 <Arrow diagonal size={14} /></a>
      </nav>
    </header>

    <main>
      <section aria-labelledby="intro-title" style={{ ...sectionStyle, paddingTop: isMobile ? 40 : 61, paddingBottom: isMobile ? 45 : 62 }}>
        <div className="grid md:grid-cols-[minmax(0,1fr)_280px]" style={{ alignItems: 'end', gap: isMobile ? 28 : 48 }}>
          <div>
            <p style={{ ...micro, margin: '0 0 25px', color: muted, fontSize: 10 }}>PERSONAL WORKS / 童装 · 搭配 · 视觉</p>
            <h1 id="intro-title" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: isMobile ? 'clamp(31px, 8.2vw, 42px)' : 'clamp(42px, 4.7vw, 64px)', lineHeight: 1.42, letterSpacing: '0.015em', margin: 0 }}>小小衣橱，<br />装下更多想象。</h1>
          </div>
          <div style={{ paddingBottom: 7 }}>
            <p style={{ fontSize: 13, lineHeight: 1.95, color: '#6e6e66', margin: '0 0 22px', maxWidth: 280 }}>从一件单品，到一整套童装搭配。<br />用 AI 还原服装，用细节表达童趣，<br />让每一种穿搭可能被看见。</p>
            <a href="#works" style={{ fontSize: 11, color: ink, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 24, borderBottom: `1px solid ${ink}`, paddingBottom: 8 }}>进入作品画廊 <Arrow size={15} /></a>
          </div>
        </div>
      </section>

      <section id="works" aria-labelledby="works-title" style={{ ...sectionStyle, scrollMarginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${ink}`, paddingTop: 28, gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: isMobile ? 12 : 19 }}><h2 id="works-title" style={{ margin: 0, fontFamily: SERIF, fontSize: isMobile ? 24 : 28, fontWeight: 400 }}>作品画廊</h2><span style={{ ...micro, color: muted, fontSize: 9 }}>SELECTED WORKS</span></div>
          <div className="hidden md:block" style={{ fontSize: 11, color: muted }}>{published ? `${published} 组已更新` : '作品筹备中'} <span style={{ padding: '0 8px' }}>·</span> 持续生长的衣橱</div>
        </div>

        {error ? <div role="alert" style={{ padding: '60px 0', textAlign: 'center', borderBottom: `1px solid ${line}` }}><p>{error}</p><button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)} style={{ ...buttonReset, textDecoration: 'underline', padding: 12 }}>重新加载</button></div> : !data ? <div role="status" style={{ color: muted, padding: '64px 0' }}>正在展开作品画廊…</div> : <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${line}`, marginTop: 17 }}>
            <div role="group" aria-label="按季节筛选" style={{ display: 'flex', gap: isMobile ? 22 : 33, overflowX: 'auto' }}>
              {(['全部', ...SEASONS] as const).map((item) => {
                const count = projects.filter((project) => (item === '全部' || project.seasons.includes(item)) && (category === '全部' || project.category === category)).length;
                return <button key={item} type="button" aria-label={item === '全部' ? '筛选全部季节' : `筛选${SEASON_NAMES[item]}`} aria-pressed={season === item} onClick={() => setSeason(item)} style={{ ...buttonReset, flexShrink: 0, padding: '19px 0 17px', borderBottom: `2px solid ${season === item ? ink : 'transparent'}`, color: season === item ? ink : muted, fontSize: 13 }}>
                  {item === '全部' ? '全部' : SEASON_NAMES[item]}<sup style={{ marginLeft: 5, fontSize: 8, fontFamily: SANS }}>{String(count).padStart(2, '0')}</sup>
                </button>;
              })}
            </div>
            <div className="hidden md:flex" role="group" aria-label="画廊布局" style={{ alignItems: 'center', gap: 4 }}>
              {[false, true].map((dense) => <button key={String(dense)} type="button" aria-label={dense ? '紧凑布局' : '舒展布局'} aria-pressed={compact === dense} onClick={() => setCompact(dense)} style={{ ...buttonReset, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: compact === dense ? ink : '#85877f', background: compact === dense ? '#efefeb' : 'none' }}><LayoutIcon compact={dense} /></button>)}
            </div>
          </div>
          <div role="group" aria-label="按服装品类筛选" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 9, marginTop: 20 }}>
            <span className="hidden md:block" style={{ fontSize: 11, color: muted, marginRight: 12 }}>服装品类</span>
            {['全部', ...categories].map((item) => <button key={item} type="button" aria-label={item === '全部' ? '筛选全部品类' : `筛选${item}`} aria-pressed={category === item} onClick={() => setCategory(item)} style={{ ...buttonReset, fontSize: 11, padding: '8px 16px', border: `1px solid ${category === item ? ink : line}`, background: category === item ? ink : 'transparent', color: category === item ? '#fff' : '#66665f', transition: 'background 150ms ease, color 150ms ease' }}>{item}</button>)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, margin: '23px 0 22px' }}>
            <p role="status" aria-live="polite" aria-atomic="true" style={{ color: muted, fontSize: 10, margin: 0, letterSpacing: '0.02em' }}>{season === '全部' ? '全部季节' : SEASON_NAMES[season]} / {category === '全部' ? '全部品类' : category} <span style={{ padding: '0 8px', color: '#bbb' }}>—</span> {filtered.length} 组{published ? '作品' : '作品位'}</p>
            {(season !== '全部' || category !== '全部') && <button type="button" onClick={resetFilters} style={{ ...buttonReset, fontSize: 11, color: muted, textDecoration: 'underline', textUnderlineOffset: 4 }}>清除筛选</button>}
          </div>
          {filtered.length > 0 ? <div className={compact ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'} style={{ gap: compact ? '30px 16px' : '42px 26px' }}>
            {filtered.map((project) => <ProjectCard key={project.id} project={project} index={projects.indexOf(project)} compact={compact} onOpen={() => setSelected(project)} />)}
          </div> : <div style={{ padding: '76px 22px', border: `1px solid ${line}`, textAlign: 'center' }}>
            <p style={{ fontFamily: SERIF, fontSize: 25, margin: '0 0 15px' }}>这一页，留给新的灵感。</p>
            <p style={{ fontSize: 13, color: muted, margin: '0 0 24px' }}>暂时没有符合这组分类的作品，换个季节或品类看看。</p>
            <button type="button" onClick={resetFilters} style={{ ...buttonReset, borderBottom: `1px solid ${ink}`, paddingBottom: 8, fontSize: 12 }}>查看全部作品 <span aria-hidden="true">↗</span></button>
          </div>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, padding: '45px 0 0', color: '#999b92' }}><span style={{ height: 1, width: 35, background: line }} /><span style={{ ...micro, fontSize: 9 }}>AN ONGOING COLLECTION</span><span style={{ height: 1, width: 35, background: line }} /></div>
        </>}
      </section>

      <section id="approach" aria-labelledby="approach-title" style={{ ...sectionStyle, marginTop: isMobile ? 78 : 112, scrollMarginTop: 40 }}>
        <div style={{ borderTop: `1px solid ${line}`, paddingTop: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 38, gap: 20 }}><h2 id="approach-title" style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 400, margin: 0 }}>一张图背后的思考</h2><span className="hidden md:block" style={{ ...micro, fontSize: 9, color: muted }}>THE CREATIVE PROCESS</span></div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4" style={{ gap: '32px 34px' }}>
            {[
              ['01', '读懂单品', '版型、面料、颜色与细节，是每一次创作的起点。'],
              ['02', '构思搭配', '从内搭、下装到配饰，让单品成为一套完整的造型。'],
              ['03', '生成画面', '选择人物气质、姿态与场景，用 AI 将构思转化为画面。'],
              ['04', '打磨细节', '校对服装还原度，调整光影与质感，完成适合电商的视觉表达。'],
            ].map(([number, title, description]) => <div key={number} style={{ borderTop: `1px solid ${line}`, paddingTop: 21 }}>
              <span style={{ ...micro, fontSize: 10, color: '#93958c' }}>{number} /</span><h3 style={{ margin: '18px 0 12px', fontWeight: 400, fontSize: 17 }}>{title}</h3><p style={{ fontSize: 12, color: muted, lineHeight: 1.95, margin: 0, maxWidth: 260 }}>{description}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section id="about" aria-labelledby="about-title" style={{ ...sectionStyle, marginTop: isMobile ? 72 : 105, paddingBottom: isMobile ? 70 : 92, scrollMarginTop: 40 }}>
        <div className="grid md:grid-cols-2" style={{ gap: 35, borderTop: `1px solid ${line}`, paddingTop: 38 }}>
          <div><p style={{ ...micro, fontSize: 9, color: muted, margin: '0 0 20px' }}>ABOUT / 关于创作</p><h2 id="about-title" style={{ fontFamily: SERIF, fontSize: isMobile ? 27 : 34, fontWeight: 400, lineHeight: 1.65, margin: 0 }}>让审美有表达，<br />也让服装有说服力。</h2></div>
          <div style={{ paddingTop: isMobile ? 0 : 27 }}><h3 style={{ fontWeight: 400, fontSize: 14, margin: '0 0 17px' }}>{profile?.title || 'AI 童装电商视觉设计'}</h3><p style={{ fontSize: 13, color: muted, lineHeight: 2, maxWidth: 440, margin: 0 }}>{profile?.intro || '从服装出发，探索搭配与视觉表达。'}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', marginTop: 25, color: '#5f625a', fontSize: 11 }}><span>童装搭配</span><span>AI 模特创作</span><span>服装还原</span><span>主图与套图</span></div></div>
        </div>
      </section>
    </main>

    <footer id="contact" style={{ borderTop: `1px solid ${line}`, background: '#efefeb', scrollMarginTop: 30 }}>
      <div style={{ ...sectionStyle, paddingTop: 44, paddingBottom: 25 }}>
        <div className="grid md:grid-cols-2" style={{ gap: 32, alignItems: 'center', marginBottom: 42 }}>
          <div><p style={{ ...micro, color: muted, fontSize: 9, margin: '0 0 16px' }}>LET’S CREATE SOMETHING</p><h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 27 : 36, fontWeight: 400, margin: 0 }}>期待下一次，一起创作。</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: 15 }}>
            {profile?.email ? <a href={`mailto:${profile.email}`} style={{ color: ink, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 18, fontSize: 16 }}>{profile.email}<Arrow diagonal /></a> : <span style={{ fontSize: 12, color: muted }}>联系方式 · 待补充</span>}
            {profile?.wechat && <button type="button" onClick={copyWechat} style={{ ...buttonReset, fontSize: 12, color: muted, textDecoration: 'underline', textUnderlineOffset: 4 }}>微信：{profile.wechat} · {copied ? '已复制' : '复制'}</button>}
            {copyError && <span role="status" style={{ fontSize: 11, color: muted }}>{copyError}</span>}
            {profile?.resumeUrl && assetUrl(profile.resumeUrl) && <a href={assetUrl(profile.resumeUrl)} target="_blank" rel="noreferrer" style={{ color: ink, fontSize: 12, textUnderlineOffset: 4 }}>查看个人简历 ↗</a>}
          </div>
        </div>
        <div style={{ borderTop: `1px solid #d7d8d0`, paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, fontSize: 9, color: '#7c7f73', letterSpacing: '0.07em' }}><span>© {new Date().getFullYear()} {profile?.name || profile?.brand || '衣着之间'} · PERSONAL PORTFOLIO</span><a href="#top" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>回到顶部 ↑</a></div>
      </div>
    </footer>
    <div style={visuallyHidden} aria-live="polite">{copied ? '微信号已复制' : ''}</div>
    {selected && <ProjectDetail key={selected.id} project={selected} number={String(projects.indexOf(selected) + 1).padStart(2, '0')} onClose={() => setSelected(null)} />}
  </>;
}

export default App;
