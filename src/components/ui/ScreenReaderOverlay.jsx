import { useScene } from '../../context/SceneContext';
import { usePortfolio, getContactChannels, getGalleryWorks } from '../../content/portfolio';
import { ROOM_LABELS, ROOM_SUBTITLES, PROCESS_STEPS, SITE_IDENTITY, DELIVERABLES, TOOLS, PLATFORMS } from '../../content/copy';
import '../../styles/ScreenReaderOverlay.scss';

/**
 * ScreenReaderOverlay — 无障碍层
 *
 * 为 3D 画布提供屏幕阅读器可访问的 HTML 内容（视觉上隐藏）。
 * 内容全部来自 public/portfolio.json。
 */
const ROOM_ORDER = ['gallery', 'studio', 'about', 'contact'];
const ROOM_HINTS = ROOM_SUBTITLES;

const ScreenReaderOverlay = () => {
    const { hasEntered, isInRoom, currentRoom, teleportTo, requestExit } = useScene();
    const portfolio = usePortfolio();
    const profile = portfolio?.profile;
    const works = portfolio ? getGalleryWorks(portfolio) : [];
    const story = portfolio?.story;
    const contacts = getContactChannels(profile);

    return (
        <div className="sr-overlay" role="complementary" aria-label="3D 作品集的无障碍导航" lang="zh-CN">
            <a href="#sr-main-nav" className="sr-only sr-focusable">
                跳到无障碍导航
            </a>

            <nav id="sr-main-nav" className="sr-only" aria-label="作品集房间">
                <h1>{SITE_IDENTITY.title}作品集</h1>
                <p>{SITE_IDENTITY.subtitle}</p>
                <h2>作品集导航</h2>

                {!hasEntered && (
                    <p>欢迎来到史雪的 3D 作品集：用 AI 生成童装电商素材（{DELIVERABLES.join('、')}）。点击或按回车键推开大门进入。</p>
                )}

                {hasEntered && !isInRoom && (
                    <>
                        <p>你在走廊里，请选择要进入的房间：</p>
                        <ul>
                            {ROOM_ORDER.map((id) => (
                                <li key={id}>
                                    <button onClick={() => teleportTo(id)} type="button">
                                        {ROOM_LABELS[id]} — {ROOM_HINTS[id]}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {hasEntered && isInRoom && (
                    <>
                        <p>你在「{ROOM_LABELS[currentRoom] || currentRoom}」房间。</p>
                        <button onClick={requestExit} type="button">
                            返回走廊
                        </button>

                        {currentRoom === 'about' && (
                            <div aria-label="关于">
                                <h3>关于</h3>
                                {profile?.name && <p>{profile.name}</p>}
                                {story?.headline?.length > 0 && <p>{story.headline.join('')}</p>}
                                {story?.positioning && <p>{story.positioning}</p>}
                                {profile?.intro && <p>{profile.intro}</p>}
                                <p>交付：{DELIVERABLES.join('、')}</p>
                                <p>常用工具：{TOOLS.join('、')}</p>
                                <p>内容平台：{PLATFORMS.join('、')}</p>
                            </div>
                        )}
                        {currentRoom === 'gallery' && (
                            <div aria-label="案例">
                                <h3>案例</h3>
                                <p>真实做过的童装电商素材以纸卡形式挂在晾衣绳上：先是案例（第一个为淘宝上架页面与已售记录），再是往期作品集（女装、童装、往期）。点击卡片翻面查看“需求 → 交付 → 结果”，再点击“查看作品图”放大浏览。</p>
                                {works.length > 0 && (
                                    <ul>
                                        {works.map((w) => (
                                            <li key={w.id}>
                                                {w.kind === 'case' ? (
                                                    <>
                                                        <h4>{w.title}{w.client ? `（${w.client}）` : ''}{w.evidence?.image ? ' · 真实上架证据' : ''}</h4>
                                                        <p>{[w.focus, w.challenge && `需求：${w.challenge}`, w.decision, w.contribution, w.deliverables && `交付：${w.deliverables}`, (w.outcome || w.evidence?.caption) && `结果：${w.outcome || w.evidence.caption}`].filter(Boolean).join(' ')}</p>
                                                    </>
                                                ) : (
                                                    <h4>往期作品集 · {w.group} · {w.pageNo}：{w.alt}</h4>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {currentRoom === 'contact' && (
                            <div aria-label="合作">
                                <h3>{ROOM_SUBTITLES.contact}</h3>
                                {contacts.length > 0 ? (
                                    <ul>
                                        {contacts.map((c) => (
                                            <li key={c.id}>
                                                {c.label}：{c.url ? <a href={c.url}>{c.value}</a> : c.value}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>联系方式整理中。</p>
                                )}
                            </div>
                        )}
                        {currentRoom === 'studio' && (
                            <div aria-label="流程">
                                <h3>素材生产线</h3>
                                <ol>
                                    {PROCESS_STEPS.map((step) => (
                                        <li key={step.id}>
                                            <h4>{step.title || step.role}</h4>
                                            <p>{step.description}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <h3>快速导航</h3>
                        <ul>
                            {ROOM_ORDER.filter((id) => id !== currentRoom).map((id) => (
                                <li key={id}>
                                    <button onClick={() => teleportTo(id)} type="button">前往{ROOM_LABELS[id]}</button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </nav>

            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {isInRoom && `已进入「${ROOM_LABELS[currentRoom] || currentRoom}」`}
            </div>
        </div>
    );
};

export default ScreenReaderOverlay;
