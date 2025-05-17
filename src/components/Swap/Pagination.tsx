import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

function Pagination({
  currentPageNo,
  totalPages,
  setCurrentPageNo,
  onPrev,
  onNext,
}: {
  currentPageNo: number;
  totalPages: number;
  onPrev?: () => void;
  onNext?: () => void;
  setCurrentPageNo: (prop: number) => void;
}) {

  return (
    <div className="flex gap-1 items-center justify-center text-prime-zinc-100">
      <button
        className="p-2 disabled:opacity-30"
        disabled={currentPageNo === 1}
        onClick={() => {
          setCurrentPageNo(currentPageNo - 1);
          onPrev?.();
        }}>
        <MdKeyboardArrowLeft className="size-5" />
      </button>
      <span>
        Page {currentPageNo} of {totalPages ?? 1}
      </span>
      <button
        className="p-2 disabled:opacity-30"
        disabled={currentPageNo === totalPages}
        onClick={() => {
          setCurrentPageNo(currentPageNo + 1);
          onNext?.();
        }}>
        <MdKeyboardArrowRight className="size-5" />
      </button>
    </div>
  );
}

export default Pagination;
