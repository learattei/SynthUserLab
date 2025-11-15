
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg">
      <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-slate-300">{message}</p>
    </div>
  );
};

export default Loader;
