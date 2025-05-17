import { RefObject, useEffect } from "react";

/**
 * Custom hook to detect clicks outside of a given element.
 * @param ref - A ref to the element to detect clicks outside of.
 * @param callback - A function to call when a click outside occurs.
 * @returns void
 */
export default function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: (event: MouseEvent) => void
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
