import { useCallback } from "react";
import confetti from "canvas-confetti";

const useConfetti = () => {
    const fireConfetti = useCallback((options = {}) => {
        const {
            duration = 3000,
            colors = [
                "#ff6b6b", // 코랄 레드
                "#00b894", // 에메랄드
                "#feca57", // 선샤인 옐로우
                "#4ecdc4", // 터콰이즈
                "#45b7d1", // 스카이 블루
                "#96ceb4", // 민트 그린
                "#ff9ff3", // 핑크
                "#a29bfe", // 퍼플
                "#fd79a8", // 로즈
                "#e17055", // 오렌지
            ],
            particleCount = 3,
            startVelocity = 80,
            spread = 55,
        } = options;

        const end = Date.now() + duration;

        const frame = () => {
            if (Date.now() > end) return;

            confetti({
                particleCount,
                angle: 60,
                spread,
                startVelocity,
                origin: { x: 0, y: 0.5 },
                colors,
            });
            confetti({
                particleCount,
                angle: 120,
                spread,
                startVelocity,
                origin: { x: 1, y: 0.5 },
                colors,
            });

            requestAnimationFrame(frame);
        };

        frame();
    }, []);

    // 중앙에서 폭발하는 콘페티
    const fireCenterConfetti = useCallback((options = {}) => {
        const {
            particleCount = 100,
            spread = 70,
            origin = { y: 0.6 },
            colors = [
                "#ff6b6b",
                "#00b894",
                "#feca57",
                "#4ecdc4",
                "#45b7d1",
                "#96ceb4",
                "#ff9ff3",
                "#a29bfe",
            ],
        } = options;

        confetti({
            particleCount,
            spread,
            origin,
            colors,
        });
    }, []);

    // 위에서 떨어지는 콘페티
    const fireRainConfetti = useCallback((options = {}) => {
        const {
            duration = 3000,
            particleCount = 2,
            colors = [
                "#ff6b6b",
                "#00b894",
                "#feca57",
                "#4ecdc4",
                "#45b7d1",
                "#96ceb4",
            ],
        } = options;

        const end = Date.now() + duration;

        const frame = () => {
            if (Date.now() > end) return;

            confetti({
                particleCount,
                startVelocity: 0,
                ticks: 200,
                origin: {
                    x: Math.random(),
                    y: Math.random() * 0.1,
                },
                colors,
                gravity: 0.5,
            });

            requestAnimationFrame(frame);
        };

        frame();
    }, []);

    return {
        fireConfetti,
        fireCenterConfetti,
        fireRainConfetti,
    };
};

export default useConfetti;