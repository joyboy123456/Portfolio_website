import { useEffect, useRef } from 'react';
import { useScene } from '../context/SceneContext';
import { SITE_URL } from '../content/copy';

/**
 * useDocumentMeta — Dynamic Meta Tags & Virtual Routing (History API)
 * 
 * Updates the browser URL, page title, and meta description
 * whenever the user enters/exits a 3D room. Also handles the
 * browser back/forward buttons for seamless navigation.
 */

const BRAND = '史雪 · AI 童装电商素材设计';
const ROOM_META = {
    null: {
        path: '/',
        title: '史雪 · AI 童装电商素材设计作品集',
        description: '史雪：用 AI 生成童装电商素材。一件衣服进来，一整套可上架的电商主图、AI 模特上身图、系列造型图出去。',
    },
    about: {
        path: '/about',
        title: `关于 — ${BRAND}`,
        description: '关于史雪：专注用 AI 生成童装电商素材，常用 Photoshop、即梦、Lovart、ComfyUI、OpenAI、Gemini，为淘宝、小红书、抖音制作主图、AI 模特上身图与系列造型图。',
    },
    gallery: {
        path: '/gallery',
        title: `案例 — ${BRAND}`,
        description: '真实上架的童装电商素材案例（含淘宝商品页面与已售记录），以及女装、童装与往期作品集页面。',
    },
    studio: {
        path: '/studio',
        title: `流程 — ${BRAND}`,
        description: '从商品图到主图的素材生产线：输入平铺/白底商品图 → 搭配构思 → AI 模特生成 → 服装上身还原 → 后期精修 → 交付主图、模特上身图、系列图。',
    },
    contact: {
        path: '/contact',
        title: `合作 — ${BRAND}`,
        description: '需要一组上新素材？通过电话或邮件联系史雪。',
    },
};

const PATH_TO_ROOM = {
    '/': null,
    '/about': 'about',
    '/gallery': 'gallery',
    '/studio': 'studio',
    '/contact': 'contact',
};

/**
 * Returns the room ID that the initial URL points to (for deep linking).
 * Call this once at app startup to determine if we need to auto-teleport.
 */
export function getInitialRoomFromUrl() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    return PATH_TO_ROOM[path] !== undefined ? PATH_TO_ROOM[path] : null;
}

export function useDocumentMeta() {
    const { currentRoom, teleportTo, hasEntered } = useScene();
    const isHandlingPopState = useRef(false);
    const lastPushedRoom = useRef(undefined); // Track what we last pushed to avoid duplicates

    // Update document meta and URL when room changes
    useEffect(() => {
        const roomKey = currentRoom === null ? 'null' : currentRoom;
        const meta = ROOM_META[roomKey] || ROOM_META['null'];

        // Update the page title
        document.title = meta.title;

        // Update meta description
        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) {
            descTag.setAttribute('content', meta.description);
        }

        // Update OG meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', meta.title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', meta.description);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `${SITE_URL}${meta.path}`);

        // Update canonical link to ensure virtual routes are correctly indexable as separate pages
        const canonicalTag = document.querySelector('link[rel="canonical"]');
        if (canonicalTag) {
            canonicalTag.setAttribute('href', `${SITE_URL}${meta.path}`);
        }

        // Push to browser history (only if not handling a popstate event and room actually changed)
        if (!isHandlingPopState.current && lastPushedRoom.current !== currentRoom) {
            // Use replaceState for the very first load, pushState for subsequent navigations
            if (lastPushedRoom.current === undefined) {
                window.history.replaceState({ room: currentRoom }, '', meta.path);
            } else {
                window.history.pushState({ room: currentRoom }, '', meta.path);
            }
            lastPushedRoom.current = currentRoom;
        }

        isHandlingPopState.current = false;
    }, [currentRoom]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = (event) => {
            isHandlingPopState.current = true;
            const targetRoom = event.state?.room ?? null;
            lastPushedRoom.current = targetRoom;

            if (targetRoom === null) {
                // Going back to corridor — we don't teleport, just need to trigger exit
                // The SceneContext requestExit will handle the animation
                // For now, we update meta immediately
                const meta = ROOM_META['null'];
                document.title = meta.title;
            } else if (hasEntered) {
                // Teleport to the target room
                teleportTo(targetRoom);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [teleportTo, hasEntered]);
}
