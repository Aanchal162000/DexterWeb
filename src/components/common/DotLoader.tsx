const DotLoader = () => {
  return (
    <div className="grid gap-2 px-1">
      <div className="flex items-center justify-center space-x-2 py-2">
        <div className={`w-[6px] delay-100 animate-pulse h-[6px] bg-prime-blue rounded-full`}></div>
        <div className={`w-[6px] delay-150 animate-pulse h-[6px] bg-prime-blue rounded-full`}></div>
        <div className={`w-[6px] delay-200 animate-pulse h-[6px] bg-prime-blue rounded-full`}></div>
      </div>
    </div>
  );
};

export default DotLoader;
