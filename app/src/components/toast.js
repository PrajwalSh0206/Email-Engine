import React, { useState, useEffect } from "react";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Automatically close after 5 seconds
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [message, onClose]);

  return (
    <div className={`fixed bottom-5 right-5 max-w-xs w-full p-4 text-white rounded-lg shadow-lg bg-gray-600`} role="alert">
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-lg font-bold">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;
