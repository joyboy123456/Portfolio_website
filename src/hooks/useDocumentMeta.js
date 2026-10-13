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

const BRAND = '衣着之间';
const ROOM_META = {
    null: {
        path: '/',
        title: '衣着之间 · AI 童装电商视觉设计作品集',
        description: '衣着之间：AI 童装电商视觉设计作品集。从一件服装出发，完成搭配构思、AI 模特生成、服装上身与后期精修，在童趣与清晰的商品表达之间找到平衡。',
    },
    about: {
        path: '/about',
        title: `关于 — ${BRAND}`,
        description: '关于衣着之间：专注童装搭配与 AI 电商视觉，关注版型、颜色与细节还原，也关注每一张主图的完整度。',
    },
    gallery: {
        path: '/gallery',
        title: `作品 — ${BRAND}`,
        description: '十二组春夏秋冬童装造型作品：外套、衬衫、套装、短袖、裙装、裤装、卫衣与针织。',
    },
    studio: {
        path: '/studio',
        title: `创作 — ${BRAND}`,
        description: '从一件衣服到一张主图：搭配构思、AI 模特生成、服装上身、后期精修四个环节。',
    },
    contact: {
        path: '/contact',
        title: `联系 — ${BRAND}`,
        description: '与衣着之间联系。',
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
