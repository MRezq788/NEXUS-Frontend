
type Props = {};

export default function PlayButton({}: Props) {
  return (
    <svg width="58" height="57" viewBox="0 0 58 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <foreignObject x="-9.33398" y="-9.83203" width="76.667" height="76.668">
        <div
          style={{
            backdropFilter: 'blur(5px)',
            clipPath: 'url(#bgblur_0_4421_84101_clip_path)',
            height: '100%',
            width: '100%',
          }}
        ></div>
      </foreignObject>
      <circle
        data-figma-bg-blur-radius="10"
        cx="28.9993"
        cy="28.5013"
        r="28.3333"
        fill="white"
        fill-opacity="0.3"
      />
      <path
        d="M38.7832 29.6173C38.354 31.3931 36.3255 32.6479 32.2687 35.1575C28.3469 37.5836 26.386 38.7966 24.8058 38.309C24.1525 38.1074 23.5572 37.7246 23.0772 37.1972C21.916 35.9215 21.916 33.4472 21.916 28.4987C21.916 23.5501 21.916 21.0759 23.0772 19.8002C23.5572 19.2728 24.1525 18.89 24.8058 18.6884C26.386 18.2008 28.3469 19.4138 32.2687 21.8399C36.3255 24.3495 38.354 25.6043 38.7832 27.3801C38.9603 28.1131 38.9603 28.8843 38.7832 29.6173Z"
        fill="black"
      />
      <defs>
        <clipPath id="bgblur_0_4421_84101_clip_path" transform="translate(9.33398 9.83203)">
          <circle cx="28.9993" cy="28.5013" r="28.3333" />
        </clipPath>
      </defs>
    </svg>
  );
}
