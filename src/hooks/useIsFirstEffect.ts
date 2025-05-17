import { useEffect, useState } from "react";

const useIsFirstEffect = () => {
  const [isFirst, setIsFirst] = useState<boolean>(true);
  useEffect(() => {
    setIsFirst(false);
  }, []);
  return isFirst;
};

export default useIsFirstEffect;
