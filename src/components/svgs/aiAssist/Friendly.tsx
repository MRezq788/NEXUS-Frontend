import React from 'react';

type Props = {};

export default function Friendly({}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="18"
      viewBox="0 0 19 18"
      fill="none"
      className="stroke-current"
    >
      <circle
        cx="9.33333"
        cy="9.00033"
        r="8.33333"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 11.5C6.7601 12.512 7.97028 13.1667 9.33333 13.1667C10.6964 13.1667 11.9066 12.512 12.6667 11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.00748 6.5L6 6.5M12.6667 6.5L12.6592 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
