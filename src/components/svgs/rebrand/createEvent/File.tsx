


function File({ fileType }: { fileType?: string }) {
  const truncateText = (text: string, maxChars = 5) => {
    if (!text) return '';
    return text.length > maxChars ? `${text.substring(0, maxChars)}...` : text;
  };
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="40"
        viewBox="0 0 30 40"
        fill="none"
      >
        <g clipPath="url(#clip0_378_16872)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24 38.5H6C3.51472 38.5 1.5 36.4853 1.5 34V6C1.5 3.51472 3.51472 1.5 6 1.5H16.25V9C16.25 11.6234 18.3766 13.75 21 13.75H28.5V34C28.5 36.4853 26.4853 38.5 24 38.5ZM27.6287 12.25L17.75 2.37132V9C17.75 10.7949 19.2051 12.25 21 12.25H27.6287ZM6 0H17.5L30 12.5V34C30 37.3137 27.3137 40 24 40H6C2.68629 40 0 37.3137 0 34V6C0 2.68629 2.68629 0 6 0Z"
            fill="#D7D7D9"
          />
        </g>
        <defs>
          <clipPath id="clip0_378_16872">
            <rect width="30" height="40" fill="white" />
          </clipPath>
        </defs>
      </svg>
      {fileType && (
        <div
          className="absolute py-0.5 px-[3px] text-fuze-rebrand-white font-bold bg-fuze-rebrand-primary text-[10px] bottom-1 -start-1 rounded-[4px]"
          title={fileType}
        >
          {truncateText(fileType)}
        </div>
      )}
    </div>
  );
}

export default File;
