import { useState } from "react";
import ImageNext from "../common/ImageNext";
import { FaTrophy } from "react-icons/fa6";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function FirstTimerDialog({ isModalOpen, onCloseModal }: { isModalOpen: boolean; onCloseModal: () => void }) {
  const [play, setPlay] = useState(true);
  const video = document.getElementById("bgvideo") as HTMLVideoElement;
  return (
    <Dialog
      open={isModalOpen}
      as="div"
      onClose={() => {}}
      className="fixed inset-0 z-[40] focus:outline-none flex items-center justify-center backdrop-blur-sm">
      <DialogPanel className="flex flex-col w-[min(540px,90vw)] text-white rounded bg-prime-background">
        <h2 className=" flex flex-col text-center font-bold border-b-[1px] border-prime-zinc-200 w-[100%] py-6 gap-2 text-lg md:text-xl text-white">
          <span>Welcome to Arbitrum zkCrossDEX</span>
          <span className="text-center font-normal w-[100%] text-base text-white">Phase One: Beta Version</span>
        </h2>
        <div className="py-10 sm:px-12 px-4 flex flex-col items-center justify-center gap-4">
          <h2 className="text-white font-semibold w-[100%] text-center text-base md:text-lg">
            Congratulations on being one of our first-ever users!
          </h2>
          <button
            id="thumbnail"
            onClick={() => {
              setPlay(true);
              video.play();
            }}
            className="flex items-center justify-center">
            <img
              src="/Logos 2.0/Thumbnail.png"
              className={`${play ? "hidden" : "block"} object-cover border border-white cursor-pointer rounded w-[92%]`}
            />
          </button>

          <video
            id="bgvideo"
            onEnded={() => setPlay(false)}
            controls
            controlsList="nodownload noplaybackrate no"
            disablePictureInPicture
            className={`${play ? "block" : "hidden"} object-cover border border-slate-200 rounded w-[92%]`}>
            <source
              src="https://zkcross.nyc3.cdn.digitaloceanspaces.com/Partisia-zkCrossDEX.mp4"
              type="video/mp4"
              className="object-cover"
            />
          </video>
          <button className="py-3 px-16 bg-prime-blue rounded w-fit mt-4 text-sm font-bold disabled:opacity-60" onClick={onCloseModal}>
            Continue
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
