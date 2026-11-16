import { useCallback, useEffect, useState } from "react";

/**
 * Tracks whether the chat scroll container has moved away from the bottom sentinel
 * and re-binds cleanly when initial skeleton loading finishes.
 */
export function useGoToBottom({
    chatKey,
    scrollContainerRef,
    bottomSentinelRef,
    isInitialLoading,
}) {
    const [showGoToBottomBtn, setShowGoToBottomBtn] = useState(false);

    useEffect(() => {
        setShowGoToBottomBtn(false);
    }, [chatKey, isInitialLoading]);

    useEffect(() => {
        if (isInitialLoading) return;

        const bottomElement = bottomSentinelRef.current;
        const scrollContainer = scrollContainerRef.current;
        if (!bottomElement || !scrollContainer) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight + 2;
                setShowGoToBottomBtn(isScrollable && !entry.isIntersecting);
            },
            {
                root: scrollContainer,
                threshold: 0,
            }
        );

        observer.observe(bottomElement);
        return () => observer.disconnect();
    }, [chatKey, isInitialLoading, scrollContainerRef, bottomSentinelRef]);

    const scrollToBottom = useCallback(() => {
        bottomSentinelRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowGoToBottomBtn(false);
    }, [bottomSentinelRef]);

    return { showGoToBottomBtn, scrollToBottom };
}

