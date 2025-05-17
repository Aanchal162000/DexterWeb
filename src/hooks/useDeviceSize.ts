import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const useDeviceSize = () => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const db = useDebouncedCallback((e: any) => e(), 1000);

    const handleWindowResize = () => {
        db(() => setWidth(window.innerWidth));
        db(() => setHeight(window.innerHeight));
    }
    useEffect(() => {
        handleWindowResize()
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, []);

    return [width, height]
}
export default useDeviceSize;
