import { useEffect, RefObject } from "react";

/**
 * Custom hook to detect clicks outside of a given element.
 * @param ref - A ref to the element to detect clicks outside of.
 * @param handler - A function to call when a click outside occurs.
 * @returns void
 */
function useClickOutside(ref: RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default useClickOutside;
