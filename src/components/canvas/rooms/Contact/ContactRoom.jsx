import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import SocialBarrel from './SocialBarrel';
import { useScene } from '../../../../context/SceneContext';
import GalleryClouds from '../Gallery/GalleryClouds';
import { useAchievements } from '../../../../context/AchievementsContext';
import { useAudio } from '../../../../context/AudioManager';
import { usePortfolioSuspense } from '../../../../hooks/usePortfolioData';
import { getContactChannels } from '../../../../content/portfolio';
import { ROOM_SUBTITLES } from '../../../../content/copy';

// ============================================
// ============================================
// 🌊 CONTACT ROOM v2 - MESSAGE IN A BOTTLE
// Immersive experience: write message, roll into bottle, throw
// ============================================
import { useTexture } from '@react-three/drei';
import { usePaintMaterial } from '../Gallery/usePaintMaterial';

const WAVE_LAYERS = 4;

// ============================================
// ⚙️ AUDIO SETTINGS - TWEAK HERE
// Edytuj te wartości, aby zmienić głośność i zasięg słyszalności szumu morza
// ============================================
export const AUDIO_SETTINGS = {
    volume: 2,
    distance: 2,           // Dystans, od którego dźwięk zaczyna cichnąć (refDistance)
    rolloff: 1.2           // Szybkość cichnięcia (rolloffFactor)
};

// ============================================
// ⚙️ LATARNIA SETTINGS - TWEAK HERE
// Edytuj te wartości, aby zmienić pozycję, obrót i wielkość latarni
// ============================================
export const LATARNIA_SETTINGS = {
    // Pozycja: [lewo/prawo (X), góra/dół (Y), tył/przód (Z)]
    position: [-10, 5, -20],

    // Rotacja: [przechył w przód/tył (X), obrót w lewo/prawo (Y), obrót na boki (Z)]
    rotation: [0, 0.1, 0],

    // Wielkość: [szerokość, wysokość]
    scale: [4.49, 5] // Legacy ratio 1102/1225
};

// ============================================
// ⚙️ STATEK SETTINGS - TWEAK HERE
// Edytuj te wartości, aby zmienić pozycję, obrót i wielkość statku
// ============================================
export const STATEK_SETTINGS = {
    // Pozycja: [lewo/prawo (X), góra/dół (Y), tył/przód (Z)]
    position: [0, 1.6, -15],

    // Rotacja: [przechył w przód/tył (X), obrót w lewo/prawo (Y), obrót na boki (Z)]
    rotation: [0, -0.2, 0],

    // Wielkość: [szerokość, wysokość]
    scale: [3.35, 1.3] // Legacy ratio 2525/978
};

// ============================================
// ⚙️ CAMERA SETTINGS - TWEAK HERE
// ============================================
const CAMERA_SETTINGS = {
    // Rotation X: How much to look down (radians)
    // -1.5 is straight down (-90 deg), -1.2 is ~70 deg
    lookDownAngle: -1.2,

    // Rotation Y: Left/Right turn
    // Set to 0 to force center, or null to keep current direction
    forceCenterY: -1.05, // FORCE CENTER to align paper straight

    // Rotation Z: Tilt/Roll
    // Set to 0 to straighten the camera
    forceStraightZ: 0,

    // Animation speed
    lerpSpeed: 2.5
};

// Experience phases
const PHASE = {
    ENTERING: 'entering',      // Camera entering room, looking at menu
    LOOKING_DOWN: 'looking_down', // Camera animating to look at dock
    WRITING: 'writing',        // User writing on paper
    ROLLING: 'rolling',        // Paper rolling into bottle
    HOLDING: 'holding',        // Camera holding bottle, looking at sea
    THROWING: 'throwing',      // Bottle being thrown
    DONE: 'done'               // Bottle floating away
};

const ContactRoom = ({ showRoom, onReady, isExiting, isWarmup }) => {
    const { camera } = useThree();
    const { isTeleporting, openOverlay } = useScene();
    const { showTutorial, unlockAchievement, hidePopup } = useAchievements();
    // 联系方式来自 portfolio.json；空值不生成入口，也不使用任何占位地址
    const { profile } = usePortfolioSuspense();
    const channels = getContactChannels(profile);
    const { globalVolume, isMuted } = useAudio();
    const effectiveVolume = isMuted ? 0 : AUDIO_SETTINGS.volume * globalVolume;

    const audioRef = useRef();
    useEffect(() => {
        if (audioRef.current && audioRef.current.setVolume) {
            audioRef.current.setVolume(effectiveVolume);
        }
    }, [effectiveVolume]);

    useEffect(() => {
        if (isExiting || isTeleporting) {
            hidePopup();
        }
    }, [isExiting, isTeleporting, hidePopup]);

    // Load Sea Texture
    const seaTexture = useTexture("/textures/contact/faletopdown.webp");
    // Load Molo Texture
    const moloTexture = useTexture("/textures/contact/molo.webp");
    // Load Latarnia Texture
    const latarniaTexture = useTexture("/textures/contact/latarnia.webp");
    // Load Statek Texture
    const statekTexture = useTexture("/textures/contact/statek.webp");


    // Configure texture repeating (1:1 scale)
    useEffect(() => {
        if (seaTexture) {
            seaTexture.wrapS = seaTexture.wrapT = THREE.MirroredRepeatWrapping;
            seaTexture.repeat.set(6, 4);
            seaTexture.needsUpdate = true;
        }

        if (moloTexture) {
            moloTexture.wrapS = moloTexture.wrapT = THREE.RepeatWrapping;
            moloTexture.center.set(0.5, 0.5);
            moloTexture.rotation = Math.PI / 2;
            moloTexture.repeat.set(1, 1);
            moloTexture.needsUpdate = true;
        }
    }, [seaTexture, moloTexture]);

    useEffect(() => {
        // Change to YXZ smoothly on mount for proper head nodding, 
        // avoiding mathematical snapping of the Euler angles.
        camera.rotation.reorder('YXZ');

        return () => {
            // Restore default XYZ on unmount so other rooms/corridors don't break
            camera.rotation.reorder('XYZ');
        };
    }, [camera]);

    // ===== PAINT TRANSITION =====
    // Contact is on the RIGHT side of the corridor, so reveal goes from right (+X) into the room
    const groupRef = useRef();
    const { onBeforeCompile, animatePaint, resetPaint, uniformsData, updateRoomOrigin } = usePaintMaterial({
        dirX: 1.0,    // Opposite to Gallery (right side door)
        dirY: 0.0,
        dirZ: -0.1,   // Slight angle matching mirrored direction
        startDist: -5.0,
        endDist: 55.0,
        noiseAxes: 'yz'
    });

    const [isTransitioning, setIsTransitioning] = useState(false);

    const wasTeleportedRef = useRef(false);
    useEffect(() => {
        if (isTeleporting) wasTeleportedRef.current = true;
    }, [isTeleporting]);

    useEffect(() => {
        if (showRoom && !isWarmup) {
            if (wasTeleportedRef.current || isTeleporting) {
                uniformsData.uPaintProgress.value = 1.0;
                setIsTransitioning(false);
            } else {
                setIsTransitioning(true);
                resetPaint();
                animatePaint(0.2, 2.5);
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 2700);
            }
        } else {
            uniformsData.uPaintProgress.value = 1.0;
        }
    }, [showRoom, isWarmup, isTeleporting]);

    // Track if we've signaled ready
    const hasSignaledReady = useRef(false);
    const frameCount = useRef(0);
    const FRAMES_TO_WAIT = 5;

    // Phase state
    const [currentPhase, setCurrentPhase] = useState(PHASE.ENTERING);
    const [showSelection, setShowSelection] = useState(true);

    const hasAnimatedDown = useRef(false);
    // Latch exit state to prevent glitch
    const hasExitTriggered = useRef(false);
    if (isExiting && !hasExitTriggered.current) {
        hasExitTriggered.current = true;
        // Do NOT reorder to XYZ here. Let DoorSection's GSAP animate camera back to the door
        // while remaining in YXZ order. This prevents "neck snapping" because interpolating 
        // to X=0 in YXZ order naturally lifts the head up without twisting the neck.
    }

    // Refs for animations
    const waveRefs = useRef([]);
    const statekRef = useRef(); // Ref for ship animation

    // Target rotation values
    const targetRotX = useRef(0);
    const targetRotY = useRef(0);
    const targetRotZ = useRef(0);

    // Reset camera rotation when teleporting starts
    useEffect(() => {
        if (isTeleporting) {
            hasAnimatedDown.current = false;
            hasExitTriggered.current = false;
            targetRotX.current = 0;
            targetRotY.current = 0;
            targetRotZ.current = 0;
            setCurrentPhase(PHASE.ENTERING);
            setShowSelection(true); // Reset selection menu
        }
    }, [isTeleporting]);

    // This effect now initializes the room but DOES NOT trigger look down
    useEffect(() => {
        if (hasSignaledReady.current && !hasAnimatedDown.current && showRoom) {
            // Just ensure we are in entering phase
            // We wait for user selection to trigger the rest
        }

        // EXIT ANIMATION CLEANUP
        if (!showRoom) {
            hasExitTriggered.current = false;
            if (hasAnimatedDown.current) {
                hasAnimatedDown.current = false;
                setCurrentPhase(PHASE.ENTERING);
                targetRotX.current = 0;
                targetRotZ.current = 0;
                setShowSelection(true);
            }
        }
    }, [hasSignaledReady.current, showRoom, camera]);

    const handleMailSelect = () => {
        if (profile.email) window.location.href = `mailto:${profile.email}`;

        /* 
        setShowSelection(false);

        // Trigger the look down sequence
        hasAnimatedDown.current = true;
        hasExitTriggered.current = false;

        // Capture landing rotation (usually 0,0,0)
        targetRotX.current = camera.rotation.x;
        targetRotY.current = camera.rotation.y;
        targetRotZ.current = camera.rotation.z;

        // Start sequence directly
        setCurrentPhase(PHASE.LOOKING_DOWN);

        // 1. SET X (Looking down)
        targetRotX.current = CAMERA_SETTINGS.lookDownAngle;

        // 2. SET Y (Turning)
        if (CAMERA_SETTINGS.forceCenterY !== null) {
            targetRotY.current = CAMERA_SETTINGS.forceCenterY;
        }

        // 3. SET Z (Tilt)
        if (CAMERA_SETTINGS.forceStraightZ !== null) {
            targetRotZ.current = CAMERA_SETTINGS.forceStraightZ;
        }

        // Phase transition
        setTimeout(() => {
            setCurrentPhase(PHASE.WRITING);
        }, 1500);
        */
    };

    // Frame Loop
    useFrame((state, delta) => {
        // Update room origin for paint shader
        updateRoomOrigin(groupRef);

        if (!hasSignaledReady.current) {
            frameCount.current++;
            if (frameCount.current >= FRAMES_TO_WAIT) {
                hasSignaledReady.current = true;
                onReady?.();
                if (!isWarmup) setTimeout(() => showTutorial('contact_submit'), 2000);
            }
        }

        // 1. Camera Animation (Simple Lerp)
        if (hasAnimatedDown.current && !isExiting && !hasExitTriggered.current) {
            // Only animate if we started the 'look down' sequence AND we are NOT exiting.
            // When exiting, DoorSection.jsx takes full control of the camera with GSAP.

            // Clamp delta to prevent massive jumps when React re-renders lag the frame rate
            const safeDelta = Math.min(delta, 0.033);
            const lerpSpeed = safeDelta * CAMERA_SETTINGS.lerpSpeed;

            // NORMAL MODE (Look Down)
            camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotX.current, lerpSpeed);
            camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotY.current, lerpSpeed);
            camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRotZ.current, lerpSpeed);
        }

        // 2. Wave Animation
        const time = state.clock.getElapsedTime();
        waveRefs.current.forEach((ref, i) => {
            if (ref) {
                const speed = 0.8 + i * 0.15;
                const amplitude = 0.15 - i * 0.02;
                const offset = i * 0.5;
                ref.position.y = Math.sin(time * speed + offset) * amplitude;
            }
        });

        // 2.5 Ship Animation (bobbing with waves and sailing)
        if (statekRef.current) {
            // 🌊 Bobbing up and down (Y axis)
            const bobSpeed = 0.8;
            const bobAmplitude = 0.3;
            statekRef.current.position.y = STATEK_SETTINGS.position[1] + Math.sin(time * bobSpeed) * bobAmplitude;

            // ⛵ Sailing left and right (X axis)
            const sailSpeed = 0.04; // znacznie wolniejsze pływanie (było 0.15)
            const sailAmplitude = 12; // mniejszy obszar pływania, by nie wyjeżdżał za ekran (było 25)
            statekRef.current.position.x = STATEK_SETTINGS.position[0] + Math.sin(time * sailSpeed) * sailAmplitude;

            // 🔄 Add a slight tilt on the Z axis (roll)
            const rollAmplitude = 0.05;
            statekRef.current.rotation.z = Math.sin(time * bobSpeed * 1.2) * rollAmplitude;
        }

    });

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1000); // 1000px breakpoint to catch tablets/phones
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <group ref={groupRef} position={[0, -0.7, -5]}>
            {!isWarmup && (
                <PositionalAudio
                    ref={audioRef}
                    url="/sounds/szummorza.mp3"
                    distanceModel="exponential"
                    refDistance={AUDIO_SETTINGS.distance}
                    rolloffFactor={AUDIO_SETTINGS.rolloff}
                    loop
                    autoplay
                    volume={effectiveVolume}
                />
            )}

            {/* ☁️ CLOUDS */}
            <GalleryClouds count={45} seed={88} rotationOffset={[0, 1, 0]} />

            {/* 🌊 OCEAN WAVE LAYERS */}
            <group position={[0, -1, -8]}>
                {Array.from({ length: WAVE_LAYERS }).map((_, i) => (
                    <mesh
                        key={i}
                        ref={el => waveRefs.current[i] = el}
                        position={[0, -i * 0.1, -i * 8]}
                        rotation={[-Math.PI / 2.5, 0, 0]}
                    >
                        <planeGeometry args={[80, 30]} />
                        <meshBasicMaterial
                            map={seaTexture}
                            color="#ffffff"
                            transparent={true}
                            opacity={1 - i * 0.1}
                            side={THREE.DoubleSide}
                            toneMapped={false}
                            onBeforeCompile={onBeforeCompile}
                        />
                    </mesh>
                ))}
            </group>

            {/* 🛢️ CONTACT BARRELS (Floating in water) — only real channels from portfolio.json */}
            {channels.map((channel, i) => {
                const n = channels.length;
                const spread = isMobile ? 1.4 : 3.2;
                const x = (i - (n - 1) / 2) * spread;
                const handleClick = () => {
                    unlockAchievement('contact_choose');
                    if (channel.id === 'email' || channel.id === 'phone') {
                        // 同时显示号码 / 邮箱，桌面端没有拨号或邮件客户端时也能看到
                        openOverlay({
                            title: channel.label,
                            description: channel.id === 'phone' ? `电话：${channel.value}` : `邮箱：${channel.value}`,
                            url: channel.url,
                            platformConfig: { label: '合作' },
                        });
                        window.location.href = channel.url;
                    } else if (channel.id === 'wechat') {
                        try { navigator.clipboard?.writeText(channel.value); } catch (err) { /* ignore */ }
                        openOverlay({
                            title: '微信',
                            description: `微信号：${channel.value}（已尝试复制到剪贴板）`,
                            platformConfig: { label: '合作' },
                        });
                    } else if (channel.url) {
                        window.open(channel.url, '_blank', 'noopener');
                    }
                };
                return (
                    <SocialBarrel
                        key={channel.id}
                        position={[x, i % 2 === 0 ? 0.3 : -0.2, -8 - (i % 2) * 1.5]}
                        rotation={[0, -x * 0.06, 0]}
                        texturePath="/textures/contact/beczka.webp"
                        label={channel.label}
                        onClick={handleClick}
                        paintOnBeforeCompile={onBeforeCompile}
                        paintUniforms={uniformsData}
                    />
                );
            })}

            {/* 合作标题：只在有真实联系方式时显示 */}
            {channels.length > 0 && (
                <group position={[0, isMobile ? 2.3 : 2.5, -9]}>
                    <Text
                        fontSize={isMobile ? 0.42 : 0.7}
                        color="#1a1a1a"
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/ZCOOLKuaiLe-Regular.woff"
                        outlineWidth={0.02}
                        outlineColor="#ffffff"
                    >
                        {ROOM_SUBTITLES.contact}
                    </Text>
                    <Text
                        position={[0, isMobile ? -0.45 : -0.65, 0]}
                        fontSize={isMobile ? 0.18 : 0.26}
                        color="#444444"
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/ZCOOLKuaiLe-Regular.woff"
                        outlineWidth={0.01}
                        outlineColor="#ffffff"
                    >
                        点木桶，打电话或发邮件
                    </Text>
                </group>
            )}

            {/* 尚未填写联系方式时的提示 */}
            {channels.length === 0 && (
                <group position={[0, 1.4, -9]}>
                    <Text
                        fontSize={isMobile ? 0.55 : 0.8}
                        color="#1a1a1a"
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/ZCOOLKuaiLe-Regular.woff"
                        outlineWidth={0.02}
                        outlineColor="#ffffff"
                    >
                        联系方式整理中
                    </Text>
                    <Text
                        position={[0, -0.75, 0]}
                        fontSize={isMobile ? 0.24 : 0.32}
                        color="#444444"
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/ZCOOLKuaiLe-Regular.woff"
                        outlineWidth={0.01}
                        outlineColor="#ffffff"
                    >
                        很快会在这里留下联系方式
                    </Text>
                </group>
            )}


            {/* 🏖️ DOCK / MOLO */}
            <mesh
                position={[0, 0.05, 1.8]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[2.5, 7]} />
                <meshBasicMaterial
                    map={moloTexture}
                    color="#e0e0e0"
                    roughness={0.8}
                    side={THREE.DoubleSide}
                    transparent
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>

            {/* 🗼 LATARNIA (LIGHTHOUSE) */}
            <mesh
                position={LATARNIA_SETTINGS.position}
                rotation={LATARNIA_SETTINGS.rotation}
            >
                <planeGeometry args={LATARNIA_SETTINGS.scale} />
                <meshBasicMaterial color="#e0e0e0"
                    map={latarniaTexture}
                    transparent
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>

            {/* 🚢 STATEK (SHIP) */}
            <mesh
                ref={statekRef}
                position={STATEK_SETTINGS.position}
                rotation={STATEK_SETTINGS.rotation}
            >
                <planeGeometry args={STATEK_SETTINGS.scale} />
                <meshBasicMaterial color="#e0e0e0"
                    map={statekTexture}
                    transparent
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>

        </group>
    );
};

export default ContactRoom;
