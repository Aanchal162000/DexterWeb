import { TCustomImageProp } from "@/interfaces/interfaces";
import clsx from "clsx";
import Image from "next/image";

function ImageNext(prop: TCustomImageProp) {
  const { className, alt, isBg, fullRadius, src, ...restProp } = prop;

  return (
    <div className={clsx("relative", prop?.className)}>
      <Image
        fill
        alt={alt as string}
        className={clsx(
          isBg ? "object-cover" : "object-contain",
          fullRadius && "rounded-full"
        )}
        src={src || "https://imageplaceholder.net/100x100/eeeeee"}
        {...restProp}
      />
    </div>
  );
}

export default ImageNext;
