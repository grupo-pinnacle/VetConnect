import { useLayoutEffect } from 'react';

const styleRefCounts = new Map<string, number>();

export function ScopedStyle({ css, id }: { css: string; id: string }) {
  useLayoutEffect(() => {
    const count = (styleRefCounts.get(id) ?? 0) + 1;
    styleRefCounts.set(id, count);

    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    } else if (style.textContent !== css) {
      style.textContent = css;
    }

    return () => {
      const remaining = (styleRefCounts.get(id) ?? 1) - 1;
      if (remaining <= 0) {
        styleRefCounts.delete(id);
        document.getElementById(id)?.remove();
      } else {
        styleRefCounts.set(id, remaining);
      }
    };
  }, [css, id]);

  return null;
}

export default ScopedStyle;
