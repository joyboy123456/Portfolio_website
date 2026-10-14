import { useRef, useMemo } from 'react';
import { useTexture, Text } from '@react-three/drei';
import { SITE_IDENTITY } from '../../../content/copy';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SignSystem = (props) => {
    const groupRef = useRef();
    const signTexture = useTexture('/textures/entrance/sign.webp');
    const mountTexture = useTexture('/textures/entrance/belka.webp');

    // Physics parameters
    const timeOffset = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        if (groupRef.current) {
            // Simple wind sway (idle animation only)
            const time = state.clock.elapsedTime + timeOffset;
            const windSway = Math.sin(time * 2) * 0.05; // Gentle constant sway

            groupRef.current.rotation.x = windSway;
            groupRef.current.rotation.y = 0;
        }
    });

    return (
        <group {...props}>
            {/* 1. THE MOUNT (Visual Anchor) */}
            {/* Texture is horizontal, so we use Width=3.5, Height=0.4 (approx aspect ratio) */}
            {/* No rotation needed as the texture is already horizontal */}
            <mesh position={[-0.05, 2.05, 0.65]}>
                <planeGeometry args={[2.7, 0.4]} />
                <meshBasicMaterial color="#e0e0e0" map={mountTexture} transparent={true} side={THREE.DoubleSide} />
            </mesh>

            {/* 2. THE SIGN (SignGroup) */}
            {/* Positioned exactly at the center of the mounting bar */}
            <group
                ref={groupRef}
                position={[0, 1.9, 0.60]}
            >
                {/* 3. THE PIVOT FIX */}
                {/* Translate geometry DOWN so the top edge (where chains are) is at (0,0,0) of the group */}
                <mesh
                    position={[0, -0.575, 0]} // Moving down by half height
                >
                    {/* 招牌加宽到 2.5 × 1.15，放得下「史雪 · AI 童装电商素材设计」和一句话说明 */}
                    <planeGeometry args={[2.5, 1.15]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={signTexture}
                        transparent={true}
                        side={THREE.DoubleSide}
                        depthWrite={false} // Fix for seeing objects behind transparent parts
                    />
                </mesh>
                {/* 招牌文字：「史雪 · AI 童装电商素材设计」+ 一句话说明（原贴图上的英文已抹去） */}
                <Text
                    position={[0, -0.6, 0.02]}
                    fontSize={0.14}
                    letterSpacing={0.02}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/ZCOOLKuaiLe-Regular.woff"
                >
                    {SITE_IDENTITY.title}
                </Text>
                <Text
                    position={[0, -0.89, 0.02]}
                    fontSize={0.082}
                    maxWidth={2.1}
                    lineHeight={1.3}
                    textAlign="center"
                    color="#555555"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/ZCOOLKuaiLe-Regular.woff"
                >
                    {'一件衣服进来，\n一整套可上架的主图、模特图、系列图出去'}
                </Text>
            </group>
        </group>
    );
};

export default SignSystem;
