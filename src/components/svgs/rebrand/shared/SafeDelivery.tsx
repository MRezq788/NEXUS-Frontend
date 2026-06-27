
type Props = {
  width?: number;
  height?: number;
};

export default function SafeDelivery({ width = 22, height = 23 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 22 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-current"
    >
      <path
        d="M10.9993 2.33301C6.94926 2.33301 3.66602 5.20585 3.66602 8.74967L18.3327 8.74967C18.3327 5.20585 15.0494 2.33301 10.9993 2.33301Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.33398 16.3889C7.33398 14.6193 7.65054 14.25 9.16732 14.25L12.834 14.25C14.3508 14.25 14.6673 14.6193 14.6673 16.3889V18.5278C14.6673 20.2974 14.3508 20.6667 12.834 20.6667H9.16732C7.65054 20.6667 7.33398 20.2974 7.33398 18.5278V16.3889Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.008 16.5415H10.9998"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.66602 8.75L10.9993 14.25L18.3327 8.75"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
