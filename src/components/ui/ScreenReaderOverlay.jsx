import { useScene } from '../../context/SceneContext';
import { usePortfolio, getContactChannels, getGalleryWorks } from '../../content/portfolio';
import { ROOM_LABELS, PROCESS_STEPS } from '../../content/copy';
import '../../styles/ScreenReaderOverlay.scss';

/**
 * ScreenReaderOverlay — 无障碍层
 *
 * 为 3D 画布提供屏幕阅读器可访问的 HTML 内容（视觉上隐藏）。
 * 内容全部来自 public/portfolio.json。
 */
const ROOM_ORDER = ['gallery', 'studio', 'about', 'contact'];
const ROOM_HINTS = {
    gallery: '案例与作品集',
    studio: '创作过程与影像作品',
    about: '关于衣着之间',
    contact: '联系方式',
};

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
                <h1>{profile?.brand || '衣着之间'} · {profile?.title || 'AI 童装电商视觉设计'}</h1>
                <h2>作品集导航</h2>

                {!hasEntered && (
                    <p>欢迎来到衣着之间的 3D 作品集。点击或按回车键推开大门进入。</p>
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
                            </div>
                        )}
                        {currentRoom === 'gallery' && (
                            <div aria-label="作品">
                                <h3>作品</h3>
                                <p>作品以纸卡形式挂在晾衣绳上，点击卡片可翻面查看项目信息，再点击“查看作品图”放大浏览。</p>
                                {works.length > 0 && (
                                    <ul>
                                        {works.map((w) => (
                                            <li key={w.id}>
                                                {w.kind === 'case' ? (
                                                    <>
                                                        <h4>{w.title}{w.client ? `（${w.client}）` : ''}</h4>
                                                        <p>{[w.focus, w.challenge, w.decision, w.contribution].filter(Boolean).join(' ')}</p>
                                                    </>
                                                ) : (
                                                    <h4>{w.group} · {w.pageNo}：{w.alt}</h4>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {currentRoom === 'contact' && (
                            <div aria-label="联系">
                                <h3>联系</h3>
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
                            <div aria-label="创作">
                                <h3>创作过程</h3>
                                <ol>
                                    {PROCESS_STEPS.map((step) => (
                                        <li key={step.id}>
                                            <h4>{step.role}</h4>
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
