import React from "react";

const Loader: React.FC = () => (
  <div className="loader">
    <style jsx>{`
      .loader {
        border: 8px solid #686b6e; /* Light grey */
        border-top: 8px solid #336ce1; /* Blue */
        border-radius: 50%;
        width: 40px;
        height: 40px;
        margin: auto;
        animation: spin 2s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

export default Loader;
