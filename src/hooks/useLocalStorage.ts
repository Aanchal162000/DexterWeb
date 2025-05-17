import { useState, useEffect, Dispatch, SetStateAction, DependencyList } from "react";
import { useDebouncedCallback } from "use-debounce";

export function useLocalStorage<T>(
  key: string,
  initialValue: T | null = null,
  callbackOnInit?: CallableFunction,
  dependencies: DependencyList = []
): [T | null, Dispatch<SetStateAction<T | null>>] {
  const debounceCb = useDebouncedCallback(() => callbackOnInit instanceof Function && callbackOnInit(), 600);

  const [value, setValue] = useState<T | null>(() => {
    try {
      console.log(key);
      const item = typeof window !== "undefined" && window.localStorage.getItem(key);
      if (item == "null") return initialValue;
      item && debounceCb();
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("localStorage err ", error);
      return initialValue;
    }
  });

  useEffect(() => {
    console.log("LocalKey ", key);
    const item = typeof window !== "undefined" && window.localStorage.getItem(key);
    if (item == "null") return;
    setValue(item ? JSON.parse(item) : initialValue);
    item && debounceCb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  useEffect(() => {
    try {
      const valueToStore = value instanceof Function ? value() : value;
      typeof window !== "undefined" && window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("localStorage err ", error);
    }
  }, [key, value]);

  return [value, setValue];
}
