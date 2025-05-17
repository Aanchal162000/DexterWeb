import { useEffect, useRef, useState } from "react";

export default function useTimer(maxMiliSeconds: number) {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const interval: any = useRef(null);

  const timerSS = seconds % 60;
  const timerMM = Math.floor(seconds / 60) % 60;

  useEffect(() => {
    if (!isActive && seconds === 0) return;
    if (!isActive) {
      clearInterval(interval?.current);
      setSeconds(0);
    }
    interval.current = setInterval(() => {
      if (seconds > maxMiliSeconds) {
        clearInterval(interval.current);
        setSeconds(0);
        setIsActive(false);
        return;
      }
      setSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(interval.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return {
    isActive,
    setIsActive,
    timerMM: timerMM < 10 ? `0${timerMM}` : timerMM,
    timerSS: timerSS < 10 ? `0${timerSS}` : timerSS,
  };
}
