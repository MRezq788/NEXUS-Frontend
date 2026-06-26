
type Props = {
  size?: number;
};
function Close({ size = 12 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      className="stroke-current"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 10 10"
      fill="none"
    >
      <path
        d="M9.08366 0.916504L0.916992 9.08317M0.916992 0.916504L9.08366 9.08317"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Close;
