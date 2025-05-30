import React from "react";

interface ComingSoonProps {
  title?: string;
  description?: string;
  className?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  description = "This feature is under development. Stay tuned for updates!",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 rounded-lg  ${className}`}
    >
      <div className="text-4xl font-bold text-primary-100 mb-4 animate-[glowPulse_2s_ease-in-out_infinite] ">
        Coming Soon !
      </div>
      {/* <div className="text-gray-400 text-center max-w-md">{description}</div> */}
      {/* <div className="mt-6 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div> */}
    </div>
  );
};

export default ComingSoon;
