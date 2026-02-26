"use client";

import { useEffect, useRef } from "react";

interface InteractiveDotGridProps {
    opacity?: number;
    dotColor?: string;
    gridSize?: number;
}

interface Dot {
    x: number;          // Original X
    y: number;          // Original Y
    currentX: number;   // Current animated X
    currentY: number;   // Current animated Y
    baseRadius: number; // Normal size
    radius: number;     // Current animated size
}

export function InteractiveDotGrid({
    opacity = 0.85,
    dotColor = "rgba(109, 117, 143, 0.9)",
    gridSize = 48,
}: InteractiveDotGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dotsRef = useRef<Dot[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const sizeRef = useRef({ width: 0, height: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        // Physics parameters
        const effectRadius = 160;
        const maxRepulsion = 25;
        const baseRadius = 1.8;
        const maxRadius = 4.5;
        const returnSpeed = 0.15;

        const initGrid = () => {
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            if (width === 0 || height === 0) return;

            // Store size to avoid unnecessary clearRect mismatches
            sizeRef.current = { width, height };

            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;

            // Reset transform and then apply scale
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const newDots: Dot[] = [];
            const cols = Math.floor(width / gridSize) + 2;
            const rows = Math.floor(height / gridSize) + 2;

            const marginX = (width - (cols - 1) * gridSize) / 2;
            const marginY = (height - (rows - 1) * gridSize) / 2;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = marginX + i * gridSize;
                    const y = marginY + j * gridSize;
                    newDots.push({
                        x, y,
                        currentX: x, currentY: y,
                        baseRadius, radius: baseRadius
                    });
                }
            }
            dotsRef.current = newDots;
        };

        const render = () => {
            const { width, height } = sizeRef.current;
            if (width === 0 || height === 0) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            // Clear precisely based on logical dimensions
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = dotColor;
            ctx.globalAlpha = opacity;

            const dots = dotsRef.current;
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];

                const dx = mouseX - dot.x;
                const dy = mouseY - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let targetX = dot.x;
                let targetY = dot.y;
                let targetRadius = dot.baseRadius;

                if (distance < effectRadius) {
                    const force = (effectRadius - distance) / effectRadius;
                    const angle = Math.atan2(dy, dx);
                    const pushOffset = force * maxRepulsion;

                    targetX = dot.x - Math.cos(angle) * pushOffset;
                    targetY = dot.y - Math.sin(angle) * pushOffset;
                    targetRadius = dot.baseRadius + (force * (maxRadius - dot.baseRadius));
                }

                dot.currentX += (targetX - dot.currentX) * returnSpeed;
                dot.currentY += (targetY - dot.currentY) * returnSpeed;
                dot.radius += (targetRadius - dot.radius) * returnSpeed;

                ctx.beginPath();
                ctx.arc(dot.currentX, dot.currentY, dot.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        // ResizeObserver is much better for handling container growth (e.g. body expansion)
        const resizeObserver = new ResizeObserver(() => {
            initGrid();
        });
        resizeObserver.observe(canvas.parentElement || document.body);

        window.addEventListener("mousemove", handleMouseMove);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        initGrid();
        render();

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("mousemove", handleMouseMove);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [dotColor, gridSize, opacity]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ display: "block", minHeight: "100%" }}
        />
    );
}
