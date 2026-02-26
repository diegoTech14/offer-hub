"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function LoadingBar() {
    const { scrollYProgress } = useScroll();
    const [isLoading, setIsLoading] = useState(true);

    // GitHub-style loading bar that fills once on mount and then follows scroll
    const scaleX = useSpring(0, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        // Initial "loading" animation
        scaleX.set(0.3);
        const timer = setTimeout(() => {
            scaleX.set(1);
            setTimeout(() => setIsLoading(false), 500);
        }, 800);

        return () => clearTimeout(timer);
    }, [scaleX]);

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#149A9B] to-[#22e0e2] z-[9999] origin-left"
            style={{ scaleX: isLoading ? scaleX : scrollYProgress }}
        />
    );
}
