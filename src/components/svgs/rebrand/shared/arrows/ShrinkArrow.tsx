import React from 'react';

type Props = { width?: number; height?: number };

export default function ShrinkArrow({ width = 18, height = 18 }: Props) {
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
        d="M2.25 15.75L7.125 10.875M7.35261 13.5L7.48432 11.319C7.50839 10.9204 7.52042 10.7211 7.39968 10.6004C7.27894 10.4796 7.07964 10.4916 6.68104 10.5156L4.5 10.6471"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 15.75L10.875 10.875M10.6456 13.5L10.5154 11.3182C10.4917 10.9201 10.4798 10.721 10.6004 10.6004C10.7211 10.4797 10.9201 10.4917 11.3182 10.5155L13.5 10.646"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 2.25L10.875 7.125M13.5 7.3147L11.3243 7.47882C10.9264 7.50883 10.7275 7.52384 10.6052 7.40438C10.483 7.28493 10.4924 7.08475 10.5111 6.68437L10.6135 4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.25 2.25L7.125 7.125M7.35622 4.5L7.48501 6.68659C7.50822 7.08056 7.51982 7.27754 7.40049 7.39767C7.28116 7.51779 7.08383 7.50779 6.68916 7.48777L4.5 7.37675"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
