import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

const PORTAL_BG = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779707217/image_1_vdzwae.png';
const CURTAIN_LEFT = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706559/curtain_left_znkmva.png';
const CURTAIN_RIGHT = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706564/curtain_right_paeyym.png';
const WORLD_BG = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706392/image_2_gkcdlx.png';
const BOTTOM_CLOUDS = 'https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706555/bottom_clouds_xskut6.png';
const CARD_IMAGES = [
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85',
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85',
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85',
];
const CARD_FALLBACKS = ['/assets/world.png', '/assets/portal.png', '/assets/world.png'];
const CARDS = [
  { title: 'Hidden Realms', desc: 'Luminous sanctuaries unseen by wandering eyes', color: '#f3cdd6' },
  { title: 'Wild Solitudes', desc: 'Dissolve into untamed horizons and deep calm', color: '#dcedc2' },
  { title: 'Silent Havens', desc: 'Remote escapes far beyond ordinary reach', color: '#c3e3f4' },
  { title: 'Bespoke Quests', desc: 'Journeys shaped around your vision and soul', color: '#f0e4c0' },
  { title: 'Vivid Drifts', desc: 'Surreal passages through breathtaking terrain', color: '#dcd2f2' },
  { title: 'Mystic Crests', desc: 'Timeless ridgelines wrapped in cloud and myth', color: '#f3cdd6' },
  { title: 'Deep Currents', desc: 'Glowing depths alive with uncharted wonder', color: '#c3e3f4' },
  { title: 'Gilded Dusk', desc: 'Amber horizons that stretch past all reason', color: '#f0e4c0' },
  { title: 'Glassy Tides', desc: 'Calm waters holding skies of pure stillness', color: '#dcedc2' },
];
type WorldCard = (typeof CARDS)[number];
type Panel = 'reel' | 'atelier' | 'craft' | 'codex' | 'connect' | WorldCard | null;

const SERIF = "'Viaoda Libre', serif";
const SANS = "'Imprima', sans-serif";
const INTRO = 'Crafting boundless digital worlds where the edge between AI, vision, and living myth dissolves.';
const MAG = { world: 6, clouds: 9, portal: 7, curtainL: 14, curtainR: 14 };
const fill: CSSProperties = { position: 'absolute', inset: 0 };
const cover: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const plainButton: CSSProperties = { border: 0, padding: 0, background: 'none', cursor: 'pointer' };
const navLink: CSSProperties = { fontFamily: SANS, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', opacity: 0.9, textDecoration: 'none', padding: '12px 0', transition: 'opacity 120ms ease' };
const smallLabel: CSSProperties = { fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' };

function clamp(val: number, min: number, max: number) { return Math.min(max, Math.max(min, val)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}
function useIsMobile() { return useMediaQuery('(max-width: 767px)'); }

function SceneImage({ src, fallback, style, fallbackStyle, priority = false }: { src: string; fallback: string; style?: CSSProperties; fallbackStyle?: CSSProperties; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <img src={failed ? fallback : src} alt="" aria-hidden="true" draggable={false} decoding="async" fetchPriority={priority ? 'high' : 'auto'} onError={() => setFailed(true)} style={{ ...cover, ...style, ...(failed ? fallbackStyle : {}) }} />;
}

function StarLogo() {
  return <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z" fill="white" opacity="0.9" />
    <circle cx="14" cy="24" r="1.5" fill="white" opacity="0.6" />
    <circle cx="6" cy="6" r="1" fill="white" opacity="0.4" />
    <circle cx="22" cy="6" r="1" fill="white" opacity="0.4" />
  </svg>;
}

function PlayIcon({ size = 30 }: { size?: number }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, borderRadius: '50%', background: '#fff', flexShrink: 0 }}>
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m4 2 6 4-6 4V2Z" fill="#4c343b" /></svg>
  </span>;
}

function ScrollChevron() {
  return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'bobUp 1.8s ease-in-out infinite' }}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>;
}

function ReelCard({ index, desktop = false, single = false, onPlay }: { index: number; desktop?: boolean; single?: boolean; onPlay: () => void }) {
  const [hovered, setHovered] = useState(false);
  const style: CSSProperties = {
    position: 'relative', width: desktop ? 158 : 140, height: desktop ? 158 : 140,
    flexShrink: 0, borderRadius: desktop ? 28 : 22, overflow: 'hidden', textAlign: 'left',
    backgroundColor: '#6a4449', backgroundImage: `url("${CARD_IMAGES[index]}"), url("${CARD_FALLBACKS[index]}")`,
    backgroundSize: 'cover', backgroundPosition: index === 2 ? '75% 60%' : 'center',
    boxShadow: `0 8px 32px rgba(0,0,0,${single ? 0.5 : 0.45})`,
    transform: hovered ? 'translateY(-4px)' : 'translateY(0)', transition: 'transform 180ms ease',
  };
  const content = <>
    <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(14,8,12,0.75) 0%, rgba(14,8,12,0.35) 50%, transparent 100%)' }} />
    {!single && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '44%', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }} />}
    <span style={{ position: 'absolute', left: 12, right: 12, bottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
      {index === 1 ? <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontFamily: SERIF, fontSize: desktop ? 36 : 28, lineHeight: 1 }}>32</span><span style={{ fontSize: desktop ? 18 : 13 }}>World Patrons</span></span>
        : <><PlayIcon size={desktop ? 30 : 26} /><span style={{ fontSize: desktop ? 18 : 13, whiteSpace: 'nowrap' }}>View Reel</span></>}
    </span>
  </>;
  return index === 1 ? <div style={style}>{content}</div> : <button type="button" aria-label={`View reel ${index === 0 ? 'one' : 'two'}`} onClick={onPlay} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ ...plainButton, ...style }}>{content}</button>;
}

function IntroHeading({ mode }: { mode: 'mobile' | 'tablet' | 'desktop' }) {
  const desktop = mode === 'desktop';
  return <h1 style={{ fontFamily: SERIF, fontWeight: 400, margin: 0, color: desktop ? '#fff' : '#3b1a0a', textShadow: desktop ? '0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)' : 'none' }}>
    <span style={{ display: 'block', fontSize: desktop ? 'clamp(32px, 4.5vw, 54px)' : mode === 'mobile' ? 'clamp(26px, 7vw, 42px)' : 'clamp(28px, 5vw, 44px)', lineHeight: 1.1, letterSpacing: desktop ? '0.04em' : '0.1em', whiteSpace: 'nowrap' }}>
      FALL <span style={{ color: desktop ? 'rgba(255,220,180,0.7)' : '#6b2e0e', fontSize: '0.8em' }}>›</span> <em style={{ fontWeight: 400 }}>INTO</em>
    </span>
    <span style={{ display: 'block', fontSize: desktop ? 'clamp(50px, 7.5vw, 88px)' : mode === 'mobile' ? 'clamp(52px, 16vw, 80px)' : 'clamp(60px, 12vw, 86px)', lineHeight: desktop ? 0.9 : 1, letterSpacing: '-0.02em', marginTop: 5 }}>REVERIE</span>
  </h1>;
}

function ArcCardSlider({ cards, rotationOffset, isMobile, onSelect, onStep }: { cards: WorldCard[]; rotationOffset: number; isMobile: boolean; onSelect: (card: WorldCard) => void; onStep: (step: number) => void }) {
  const touchStart = useRef({ x: 0, y: 0 });
  const cardSpacingDeg = isMobile ? 12 : 9;
  const centerIndex = Math.floor(cards.length / 2);
  const arcRadius = isMobile ? 700 : 1100;
  const cardW = isMobile ? 160 : 220;
  const cardH = isMobile ? 175 : 230;
  return <div role="region" aria-label="Explore nine worlds. Scroll or use the arrow keys to browse." tabIndex={0}
    onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); onStep(event.key === 'ArrowRight' ? 1 : -1); } }}
    onPointerDown={(event) => { touchStart.current = { x: event.clientX, y: event.clientY }; }}
    onPointerUp={(event) => { const dx = event.clientX - touchStart.current.x; const dy = event.clientY - touchStart.current.y; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) onStep(dx < 0 ? 1 : -1); }}
    style={{ position: 'relative', width: '100%', height: isMobile ? 260 : 360, touchAction: 'pan-y' }}>
    {cards.map((card, i) => {
      const baseDeg = (i - centerIndex) * cardSpacingDeg;
      const deg = baseDeg - rotationOffset + centerIndex * cardSpacingDeg;
      const rad = deg * Math.PI / 180;
      const x = Math.sin(rad) * arcRadius;
      const y = arcRadius - Math.cos(rad) * arcRadius;
      return <button key={card.title} type="button" onClick={() => onSelect(card)}
        aria-label={`Explore ${card.title}: ${card.desc}`} tabIndex={Math.abs(deg) < (isMobile ? 6 : 18) ? 0 : -1}
        style={{ ...plainButton, position: 'absolute', bottom: -y + (isMobile ? 140 : 200), left: `calc(50% + ${x - cardW / 2}px)`, width: cardW, height: cardH, transform: `rotate(${deg}deg)`, transformOrigin: `${cardW / 2}px ${arcRadius}px`, borderRadius: isMobile ? 18 : 26, background: card.color, boxShadow: '0 8px 40px rgba(80,40,60,0.18)', textAlign: 'left', color: '#3a2530', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', top: isMobile ? 15 : 20, right: isMobile ? 15 : 20, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1.5px solid rgba(80,50,60,0.3)', color: 'rgba(80,50,60,0.6)', fontSize: 10 }}>{String(i + 1).padStart(2, '0')}</span>
        <span style={{ position: 'absolute', bottom: isMobile ? 19 : 24, left: isMobile ? 18 : 24, right: isMobile ? 16 : 22 }}>
          <span style={{ display: 'block', fontFamily: SERIF, fontSize: isMobile ? 22 : 30, lineHeight: 1.1, marginBottom: 10 }}>{card.title}</span>
          <span style={{ display: 'block', fontSize: isMobile ? 12 : 15, lineHeight: 1.45, color: 'rgba(58,37,48,0.65)' }}>{card.desc}</span>
        </span>
      </button>;
    })}
  </div>;
}

function DetailDialog({ panel, onClose, onExplore }: { panel: Panel; onClose: () => void; onExplore: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !panel) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus({ preventScroll: true }); };
  }, [panel]);
  if (!panel) return null;
  const content = typeof panel === 'object' ? { title: panel.title, desc: panel.desc, label: 'A world of possibility' } : {
    reel: { title: 'A glimpse of elsewhere.', desc: 'Three visual studies from the world of Reverie.', label: 'Reverie · visual reel' },
    atelier: { title: 'Where imagination takes form.', desc: INTRO, label: 'The atelier' },
    craft: { title: 'Vision, made tangible.', desc: 'Light, texture, and a sense of the impossible. Each world begins with a detail worth getting lost in.', label: 'Our craft' },
    codex: { title: 'An atlas of the extraordinary.', desc: 'Nine worlds. Nine invitations to see beyond the familiar. Follow your curiosity into the unknown.', label: 'The codex' },
    connect: { title: 'Begin with a little wonder.', desc: 'Find the world that speaks to your imagination. Let it be the beginning of your next journey.', label: 'Connect with a world' },
  }[panel];
  return <dialog ref={dialogRef} aria-labelledby="detail-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    style={{ padding: 0, margin: 'auto', border: '1px solid rgba(240,228,192,0.2)', borderRadius: 24, background: '#20151c', color: '#fff6ee', width: 'min(660px, calc(100% - 40px))', maxHeight: '85dvh', boxShadow: '0 24px 120px rgba(0,0,0,0.65)', overflow: 'auto', overscrollBehavior: 'contain' }}>
    <div style={{ padding: 'clamp(28px, 5vw, 48px)', position: 'relative' }}>
      <button type="button" onClick={onClose} aria-label="Close dialog" style={{ ...plainButton, position: 'absolute', top: 12, right: 14, width: 36, height: 36, fontSize: 25, color: '#f0e4c0' }}>×</button>
      <p style={{ ...smallLabel, color: '#d2a6ac', margin: '0 0 20px' }}>{content.label}</p>
      <h2 id="detail-title" style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1, fontWeight: 400, margin: '0 0 20px' }}>{content.title}</h2>
      <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,245,235,0.75)', margin: 0 }}>{content.desc}</p>
      {panel === 'reel' ? <>
        <div style={{ position: 'relative', aspectRatio: '16 / 10', marginTop: 24, borderRadius: 16, overflow: 'hidden', background: '#583d4b' }}>
          <SceneImage key={frame} src={CARD_IMAGES[frame]} fallback={CARD_FALLBACKS[frame]} style={{ objectPosition: frame === 2 ? 'right bottom' : 'center' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          <button type="button" aria-label="Previous visual" onClick={() => setFrame((frame + 2) % 3)} style={{ ...plainButton, padding: 10 }}>← Previous</button>
          <span aria-live="polite" style={smallLabel}>0{frame + 1} / 03</span>
          <button type="button" aria-label="Next visual" onClick={() => setFrame((frame + 1) % 3)} style={{ ...plainButton, padding: 10 }}>Next →</button>
        </div>
      </> : <button type="button" onClick={onExplore} style={{ ...plainButton, marginTop: 30, borderBottom: '1px solid #caae9f', paddingBottom: 8, color: '#f0e4c0' }}>Explore the worlds <span aria-hidden="true">↗</span></button>}
    </div>
  </dialog>;
}

export default function App() {
  const containerRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const curtainLRef = useRef<HTMLDivElement>(null);
  const curtainRRef = useRef<HTMLDivElement>(null);
  const curtainsOpenRef = useRef(false);
  const entranceDoneRef = useRef(false);
  const wakeRef = useRef<() => void>(() => {});
  const progressRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [uiVisible, setUiVisible] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [manualRotation, setManualRotation] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const open = window.setTimeout(() => { curtainsOpenRef.current = true; wakeRef.current(); }, reducedMotion ? 0 : 100);
    const show = window.setTimeout(() => setUiVisible(true), reducedMotion ? 0 : 600);
    const done = window.setTimeout(() => { entranceDoneRef.current = true; wakeRef.current(); }, reducedMotion ? 0 : 2200);
    return () => { clearTimeout(open); clearTimeout(show); clearTimeout(done); };
  }, [reducedMotion]);

  useEffect(() => {
    let frame = 0;
    let scrollRange = 1;
    const mouse = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    const draw = () => {
      frame = 0;
      const p = clamp(window.scrollY / scrollRange, 0, 1);
      if (p !== progressRef.current) { progressRef.current = p; setScrollProgress(p); setManualRotation(null); }
      const ep = easeInOut(p);
      smooth.x = lerp(smooth.x, mouse.x, 0.07);
      smooth.y = lerp(smooth.y, mouse.y, 0.07);
      const mx = isMobile || reducedMotion ? 0 : smooth.x;
      const my = isMobile || reducedMotion ? 0 : smooth.y;
      const zoom = reducedMotion ? 0 : ep;
      if (worldRef.current) worldRef.current.style.transform = `translate3d(${-mx * MAG.world}px, ${-my * MAG.world}px, 0) scale(${lerp(1, 1.18, zoom)})`;
      if (cloudsRef.current) {
        cloudsRef.current.style.transform = `translate3d(${-mx * MAG.clouds}px, ${-my * MAG.clouds * 0.4}px, 0) scale(${lerp(1, 1.4, zoom)})`;
        cloudsRef.current.style.opacity = String(lerp(0.7, 1, clamp(p / 0.05, 0, 1)));
      }
      if (portalRef.current) {
        portalRef.current.style.transform = `translate3d(${-mx * MAG.portal}px, ${-my * MAG.portal}px, 0) scale(${lerp(1, 7.5, zoom)})`;
        portalRef.current.style.opacity = String(1 - clamp((p - 0.65) / 0.2, 0, 1));
      }
      const curtainShift = (curtainsOpenRef.current ? 62 : 0) + lerp(0, 150, zoom);
      for (const [node, direction, magnitude] of [[curtainLRef.current, -1, MAG.curtainL], [curtainRRef.current, 1, MAG.curtainR]] as const) {
        if (!node) continue;
        node.style.transition = entranceDoneRef.current || reducedMotion ? 'none' : 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
        node.style.opacity = reducedMotion ? String(1 - clamp((p - 0.65) / 0.2, 0, 1)) : '1';
        node.style.transform = `translateX(${direction * curtainShift}%) translate3d(${-mx * magnitude}px, ${-my * magnitude * 0.3}px, 0) scale(${lerp(1, 1.3, zoom)})`;
      }
      if (Math.abs(smooth.x - mouse.x) > 0.001 || Math.abs(smooth.y - mouse.y) > 0.001) schedule();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const resize = () => { scrollRange = Math.max(1, (containerRef.current?.scrollHeight ?? window.innerHeight) - window.innerHeight); schedule(); };
    const move = (event: PointerEvent) => { if (event.pointerType !== 'mouse' || reducedMotion || isMobile) return; mouse.x = event.clientX / window.innerWidth * 2 - 1; mouse.y = event.clientY / window.innerHeight * 2 - 1; schedule(); };
    const resetMouse = () => { mouse.x = 0; mouse.y = 0; schedule(); };
    wakeRef.current = schedule;
    resize();
    const sizeObserver = new ResizeObserver(resize);
    if (containerRef.current) sizeObserver.observe(containerRef.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetMouse);
    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', resetMouse);
      wakeRef.current = () => {};
    };
  }, [isMobile, reducedMotion]);

  const goTo = (progress: number) => {
    const range = (containerRef.current?.scrollHeight ?? window.innerHeight) - window.innerHeight;
    window.scrollTo({ top: Math.max(0, range * clamp(progress, 0, 1)), behavior: reducedMotion ? 'instant' : 'smooth' });
  };
  const explore = () => { setPanel(null); requestAnimationFrame(() => goTo(0.85)); };
  const scene1Opacity = clamp(1 - scrollProgress / 0.22, 0, 1);
  const scene2Opacity = clamp((scrollProgress - 0.68) / 0.16, 0, 1);
  const arcSweepDeg = (CARDS.length - 1) * 10;
  const rotationOffset = manualRotation ?? lerp(0, arcSweepDeg, clamp((scrollProgress - 0.70) / 0.30, 0, 1));
  const activeCard = clamp(Math.round(rotationOffset / (isMobile ? 12 : 9)), 0, CARDS.length - 1);
  const stepCard = (step: number) => setManualRotation(clamp(activeCard + step, 0, CARDS.length - 1) * (isMobile ? 12 : 9));
  const enter = (delay: number, translate = 16): CSSProperties => ({ opacity: uiVisible ? 1 : 0, transform: `translateY(${uiVisible || reducedMotion ? 0 : translate}px)`, transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s` });
  const navigation = (name: string, action: () => void, href: string, mobile = false) => <a href={href} onClick={(event) => { event.preventDefault(); action(); }} style={{ ...navLink, fontSize: mobile ? 11 : 12 }} onMouseEnter={(event) => { event.currentTarget.style.opacity = '0.6'; }} onMouseLeave={(event) => { event.currentTarget.style.opacity = '0.9'; }}>{name}</a>;
  const logo: ReactNode = <a href="#reverie" aria-label="Reverie — back to the beginning" onClick={(event) => { event.preventDefault(); goTo(0); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}><StarLogo /></a>;

  return <>
    <main ref={containerRef} id="reverie" aria-label="Reverie, an immersive journey" style={{ height: '480vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#0a0608', isolation: 'isolate' }}>
        <div ref={worldRef} data-layer="world" style={{ ...fill, transformOrigin: '50% 50%', willChange: 'transform', pointerEvents: 'none' }}><SceneImage src={WORLD_BG} fallback="/assets/world.png" priority /></div>

        <div id="worlds" aria-hidden={scene2Opacity < 0.1} inert={scene2Opacity < 0.1} style={{ position: 'absolute', left: 0, right: 0, bottom: isMobile ? 60 : 80, zIndex: 9, opacity: scene2Opacity, pointerEvents: scene2Opacity > 0.5 ? 'auto' : 'none', transform: isMobile ? 'translateY(max(0px, calc(640px - 100vh)))' : 'translateY(max(0px, calc(850px - 100vh)))' }}>
          <ArcCardSlider cards={CARDS} rotationOffset={rotationOffset} isMobile={isMobile} onSelect={setPanel} onStep={stepCard} />
        </div>

        <div ref={cloudsRef} data-layer="clouds" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, transformOrigin: '50% 100%', willChange: 'transform', pointerEvents: 'none', opacity: 0.7 }}><SceneImage src={BOTTOM_CLOUDS} fallback="/assets/clouds.png" style={{ height: 'auto' }} fallbackStyle={{ maxHeight: '28vh', objectFit: 'fill' }} /></div>
        <div ref={portalRef} data-layer="portal" style={{ ...fill, zIndex: 15, transformOrigin: '52% 38%', willChange: 'transform, opacity', pointerEvents: 'none' }}><SceneImage src={PORTAL_BG} fallback="/assets/portal.png" priority /></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', zIndex: 16, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)', pointerEvents: 'none' }} />
        <div ref={curtainLRef} data-layer="curtain-left" style={{ ...fill, zIndex: 16, transformOrigin: 'left center', willChange: 'transform', pointerEvents: 'none' }}><SceneImage src={CURTAIN_LEFT} fallback="/assets/curtain.png" style={{ objectPosition: 'right center' }} fallbackStyle={{ clipPath: `inset(0 ${isMobile ? 32 : 24}% 0 0)` }} /></div>
        <div ref={curtainRRef} data-layer="curtain-right" style={{ ...fill, zIndex: 16, transformOrigin: 'right center', willChange: 'transform', pointerEvents: 'none' }}><SceneImage src={CURTAIN_RIGHT} fallback="/assets/curtain.png" style={{ objectPosition: 'left center' }} fallbackStyle={{ clipPath: `inset(0 0 0 ${isMobile ? 32 : 24}%)` }} /></div>

        <section aria-label="Fall into Reverie" aria-hidden={scene1Opacity === 0} inert={scene1Opacity === 0} data-scene="intro" style={{ ...fill, zIndex: 20, opacity: scene1Opacity, pointerEvents: scene1Opacity > 0.1 ? 'auto' : 'none' }}>
          <div className="flex md:hidden" style={{ ...fill, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '80px 24px 100px', textAlign: 'center', ...enter(0.3) }}>
            <IntroHeading mode="mobile" />
            <p style={{ fontSize: 15, lineHeight: 1.65, color: '#5c2d0e', width: '100%', maxWidth: 280, margin: 0 }}>{INTRO}</p>
            <ReelCard index={0} single onPlay={() => setPanel('reel')} />
          </div>
          <div className="hidden md:flex xl:hidden" style={{ ...fill, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '80px 32px 96px', textAlign: 'center', ...enter(0.3) }}>
            <IntroHeading mode="tablet" />
            <p style={{ fontSize: 16, lineHeight: 1.65, color: '#5c2d0e', maxWidth: 400, margin: 0 }}>{INTRO}</p>
            <div style={{ display: 'flex', gap: 14 }}>{CARD_IMAGES.map((_, index) => <ReelCard key={index} index={index} onPlay={() => setPanel('reel')} />)}</div>
          </div>
          <div className="hidden xl:block" style={{ position: 'absolute', top: '46%', left: 60, maxWidth: 440, transform: 'translateY(-50%)' }}>
            <div style={enter(0.3)}><IntroHeading mode="desktop" />
              <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,245,235,0.88)', maxWidth: 300, margin: '28px 0 0', textShadow: '0 1px 12px rgba(0,0,0,0.8)' }}>{INTRO}</p>
            </div>
          </div>
          <div className="hidden xl:flex" style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }}>
            <div style={{ display: 'flex', gap: 12, ...enter(0.55) }}>{CARD_IMAGES.map((_, index) => <ReelCard key={index} index={index} desktop onPlay={() => setPanel('reel')} />)}</div>
          </div>
          <div aria-label="Journey chapters" style={{ position: 'absolute', bottom: isMobile ? 28 : 40, left: isMobile ? '50%' : 60, transform: isMobile ? 'translateX(-50%)' : undefined }}>
            <div style={{ display: 'flex', gap: 6, ...enter(0.8, 6) }}>{[0, 0.74, 0.86, 1].map((progress, i) => <button key={i} type="button" aria-label={`Go to chapter ${i + 1}`} aria-current={i === 0 ? 'step' : undefined} onClick={() => goTo(progress)} style={{ ...plainButton, padding: '12px 0' }}><span style={{ display: 'block', width: i === 0 ? 28 : 14, height: 4, borderRadius: 2, background: i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }} /></button>)}</div>
          </div>
          <div className="hidden md:block" style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)' }}><button type="button" aria-label="Descend into the worlds" onClick={() => goTo(0.78)} style={{ ...plainButton, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, ...enter(0.9, 6) }}><span style={{ ...smallLabel, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.6)' }}>Descend</span><ScrollChevron /></button></div>
        </section>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '42vh', zIndex: 45, background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)', pointerEvents: 'none' }} />

        <section aria-label="Forge beyond the real" aria-hidden={scene2Opacity === 0} data-scene="worlds" style={{ ...fill, zIndex: 46, opacity: scene2Opacity, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: isMobile ? 'clamp(24px, calc(100vh - 576px), 64px) 22px 0' : '0 22px' }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: isMobile ? 'clamp(28px, 8vw, 44px)' : 'clamp(38px, 6.5vw, 78px)', color: '#fff', letterSpacing: '0.03em', lineHeight: 1.05, textShadow: '0 2px 20px rgba(0,0,0,0.4)', margin: `${isMobile ? '8vh' : '12vh'} 0 0`, textWrap: 'balance' }}>FORGE BEYOND THE REAL</h2>
          <p style={{ fontSize: isMobile ? 14 : 20, lineHeight: 1.6, letterSpacing: '-0.01em', maxWidth: isMobile ? 260 : 480, color: 'rgba(255,255,255,0.82)', margin: `${isMobile ? 18 : 24}px 0 0`, textWrap: 'pretty' }}>Singular voyages to astonishing destinations, shaped for those who seek beauty beyond the ordinary and the known.</p>
        </section>

        <div aria-label="World navigation" aria-hidden={scene2Opacity < 0.5} inert={scene2Opacity < 0.5} style={{ position: 'absolute', bottom: isMobile ? 30 : 35, left: '50%', transform: 'translateX(-50%)', zIndex: 46, opacity: scene2Opacity, display: 'flex', alignItems: 'center', gap: 24, color: '#fff', pointerEvents: scene2Opacity < 0.5 ? 'none' : 'auto' }}>
          <button type="button" aria-label="Previous world" disabled={activeCard === 0} onClick={() => stepCard(-1)} style={{ ...plainButton, width: 40, height: 40, border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%', opacity: activeCard === 0 ? 0.3 : 0.9 }}>←</button>
          <span aria-live="polite" style={{ ...smallLabel, minWidth: 50, textAlign: 'center' }}>{String(activeCard + 1).padStart(2, '0')} / 09</span>
          <button type="button" aria-label="Next world" disabled={activeCard === CARDS.length - 1} onClick={() => stepCard(1)} style={{ ...plainButton, width: 40, height: 40, border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%', opacity: activeCard === CARDS.length - 1 ? 0.3 : 0.9 }}>→</button>
        </div>

        <nav aria-label="Main navigation" className="flex md:hidden" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, padding: '18px 20px', justifyContent: 'space-between', alignItems: 'center' }}>
          {navigation('Explore', explore, '#worlds', true)}{logo}{navigation('Connect', () => setPanel('connect'), '#connect', true)}
        </nav>
        <nav aria-label="Main navigation" className="hidden md:flex" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, padding: '22px 48px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 36 }}>{navigation('Worlds', explore, '#worlds')}{navigation('Atelier', () => setPanel('atelier'), '#atelier')}{navigation('Immersions', () => goTo(0.9), '#worlds')}</div>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>{logo}</div>
          <div style={{ display: 'flex', gap: 36 }}>{navigation('Craft', () => setPanel('craft'), '#craft')}{navigation('Codex', () => setPanel('codex'), '#codex')}{navigation('Connect', () => setPanel('connect'), '#connect')}</div>
        </nav>
      </div>
    </main>
    <DetailDialog panel={panel} onClose={() => setPanel(null)} onExplore={explore} />
  </>;
}
