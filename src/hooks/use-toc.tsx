import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
let scrollTimeoutId: NodeJS.Timeout;

export default function useToc(container: HTMLDivElement, elements: HTMLCollectionOf<Element>, headerTop: number = 0) {
  const blocks = useMemo(() => Array.prototype.slice.call(elements), [elements]);
  const [active, setActive] = useState(0);

  const scrollFinishedFn = useRef<Function | null>(null);

  const handleScroll = useCallback(
    (e?: any) => {
      clearTimeout(scrollTimeoutId);
      scrollTimeoutId = setTimeout(() => {
        if (scrollFinishedFn) {
          scrollFinishedFn.current?.();
          scrollFinishedFn.current = null;
        }
      }, 50);
      !scrollFinishedFn?.current &&
        setActive(
          getActiveElement(
            blocks.map((d) => d.getBoundingClientRect()),
            container?.getBoundingClientRect?.()?.top
          )
        );
    },
    [blocks, container]
  );

  useEffect(() => {
    if (!blocks?.length) return;
    setActive(
      getActiveElement(
        blocks.map((d) => {
          return d.getBoundingClientRect();
        }),
        container?.getBoundingClientRect?.()?.top
      )
    );

    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [container, blocks, handleScroll]);

  return {
    active,
    setActive: (active: number) => {
      const target = blocks[active];

      // sticky header height 80
      const scrollOffsetTop =
        (target?.getBoundingClientRect().top || 0) - container?.getBoundingClientRect().top - headerTop;

      if (
        // if scroll bottom, just set active
        container?.scrollTop ===
        (container?.scrollHeight || 0) - (container?.offsetHeight || 0)
      ) {
        setActive(active);
      }

      // scroll into view
      container?.scrollTo({
        top: scrollOffsetTop + container?.scrollTop,
        behavior: 'smooth',
      });
      if (scrollFinishedFn) scrollFinishedFn.current = () => setActive(active);
    },
  };
}

export const isInViewport = function (ele?: Element | null) {
  if (!ele) return false;
  const rect = ele.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

function getActiveElement(rects: DOMRect[], vertical: number = 0) {
  if (rects.length === 0) {
    return 0;
  }

  const closest = rects.reduce(
    (acc, item, index) => {
      if (Math.abs(acc.position - vertical) < Math.abs(item.y - vertical)) {
        return acc;
      }

      return {
        index,
        position: item.y,
      };
    },
    { index: 0, position: rects[0].y }
  );

  return closest.index;
}
