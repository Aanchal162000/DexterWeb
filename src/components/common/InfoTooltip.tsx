import { IoMdInformationCircleOutline } from "react-icons/io";

export default function InfoTooltip({ tooltip = "Copy to clipboard" }: { tooltip?: string }) {
  return (
    <div className="group relative w-fit h-fit flex items-center">
      <button>
        <IoMdInformationCircleOutline size="1rem" />
      </button>
      <span className="pointer-events-none absolute z-40 -top-10 -left-16 w-max opacity-0 transition-opacity group-hover:opacity-100 px-2 py-2 bg-zinc-700 rounded">
        {tooltip}
      </span>
    </div>
  );
}
