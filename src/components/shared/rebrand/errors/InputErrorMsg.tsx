import type { ReactNode } from 'react';

const InputErrorMsg = ({ children }: { children: ReactNode }) => {
  return (
    <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">
      {children}
    </p>
  );
};

export default InputErrorMsg;
