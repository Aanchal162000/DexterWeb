import { toastSuccess } from "@/utils/toast";
import { MdContentCopy } from "react-icons/md";

export default function CopyTooltip({ onClick, tooltip = "Copy to clipboard" }: { onClick: (e: any) => any; tooltip?: string }) {
  return (
    <div className="group relative w-fit">
      <button onClick={onClick}>
        <MdContentCopy size="1rem" className="cursor-pointer" />
      </button>
      <span className="pointer-events-none absolute z-50 -top-10 -left-14 w-max opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1.5 bg-zinc-700 rounded">
        {tooltip}
      </span>
    </div>
  );
}
