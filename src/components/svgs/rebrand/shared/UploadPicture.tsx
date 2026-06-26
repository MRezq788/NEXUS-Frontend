import * as React from "react";
import { useTheme } from "../../../../context/useDarkSide";

const UploadPic = () => {
  const { themeColor } = useTheme();
  const color = themeColor === 'light' ? '#000' : '#fff';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 22 22"
    >
      <path
        fill={color}
        d="M21 5.75a.75.75 0 0 0 0-1.5zm-8-1.5a.75.75 0 0 0 0 1.5zM17.75 1a.75.75 0 0 0-1.5 0zm-1.5 8a.75.75 0 0 0 1.5 0zM21 4.25h-4v1.5h4zm-4 0h-4v1.5h4zM16.25 1v4h1.5V1zm0 4v4h1.5V5z"
      ></path>
      <path
        stroke={color}
        strokeLinecap="round"
        strokeWidth="1.5"
        d="M10.5 2C6.022 2 3.782 2 2.391 3.391S1 7.021 1 11.5c0 4.478 0 6.718 1.391 8.109S6.021 21 10.5 21c4.478 0 6.718 0 8.109-1.391S20 15.979 20 11.5V11"
      ></path>
      <path
        stroke={color}
        strokeWidth="1.5"
        d="M4 20c4.21-4.751 8.941-11.052 16-6.327"
      ></path>
    </svg>
  );
};

export default UploadPic;
