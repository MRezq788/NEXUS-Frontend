import React from 'react';

type Props = { width?: number; height?: number };

export default function ExpandArrow({ width = 18, height = 18 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-current"
    >
      <path
        d="M10.5 7.50003L15.375 2.62503M15.6758 6L15.7462 3.01761C15.7547 2.65649 15.7589 2.47593 15.6482 2.36297C15.5374 2.25 15.3561 2.25 14.9935 2.25H12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.49997 7.50005L2.62497 2.62505M6 2.25H3C2.64645 2.25 2.46967 2.25 2.35983 2.35983C2.25 2.46967 2.25 2.64645 2.25 3V6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.49998 10.5L2.62498 15.375M2.25 12V15C2.25 15.3535 2.25 15.5303 2.35983 15.6401C2.46967 15.75 2.64645 15.75 3 15.75H6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 10.5L15.375 15.375M12 15.7499H15C15.3536 15.7499 15.5304 15.7499 15.6402 15.6401C15.75 15.5303 15.75 15.3535 15.75 14.9999V11.9999"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
