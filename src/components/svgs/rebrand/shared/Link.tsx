import React from 'react';

type Props = {
  width?: number;
  height?: number;
};

export default function Link({ width = 22, height = 12 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 22 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-current"
    >
      <path
        d="M12.5 11H16C18.7614 11 21 8.76142 21 6C21 3.23858 18.7614 1 16 1H12.5M9.5 11H6C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1H9.5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M8 6H14" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
