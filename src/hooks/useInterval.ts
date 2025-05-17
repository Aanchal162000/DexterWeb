import { MutableRefObject, useEffect, useRef } from "react";

export function useInterval(callback: (...props: any) => any, delay: number) {
  const savedCallback: MutableRefObject<any> = useRef<unknown>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
