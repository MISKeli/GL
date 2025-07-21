import { useState } from "react";

const useSkipFetchingQuery = () => {
  const [isSkip, setIsSkip] = useState(true); // Initially skip the query

  // Call this when you're ready to fetch
  const triggerQuery = () => {
    setIsSkip(false);
  };

  // Optional: Reset to true if you need to skip again later
  const resetSkip = () => {
    setIsSkip(true);
  };

  return {
    isSkip,
    triggerQuery,
    resetSkip,
  };
};

export default useSkipFetchingQuery;
