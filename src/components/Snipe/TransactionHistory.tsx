import React from "react";
import ComingSoon from "../common/ComingSoon";

const TransactionHistory: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <ComingSoon
        title="Transaction History"
        description="Track all your smart buy  transactions and their status in one place. Coming soon!"
        className="w-full max-w-2xl"
      />
    </div>
  );
};

export default TransactionHistory;
