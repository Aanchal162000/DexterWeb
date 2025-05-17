const DialogToast = ({ closeToast, toastProps }: any) => (
  <div className="flex flex-col justify-start text-white">
    <h6 className="text-[15px] font-semibold mt-2">{toastProps.heading}</h6>
    <p className="text-xs mt-2">
      {toastProps.info} <br />
      <span>{toastProps.content}</span>
    </p>
    <button onClick={closeToast} className="px-4 py-2 rounded bg-zinc-900 w-fit mt-3 text-xs self-end">
      Close
    </button>
  </div>
);

export default DialogToast;
