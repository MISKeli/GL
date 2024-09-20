import { useState, useCallback } from "react";

const useDropImport = (onFileDrop) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        onFileDrop(files); // Call the function to handle the dropped files
      }
    },
    [onFileDrop]
  );

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};

export default useDropImport;
