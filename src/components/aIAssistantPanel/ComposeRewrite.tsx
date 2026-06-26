import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  composeInputRef: React.RefObject<HTMLInputElement>;
  handleCompose: () => void;
};

function ComposeRewrite({ composeInputRef, handleCompose }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <input
        ref={composeInputRef}
        type="text"
        className="w-full h-11 bg-white dark:bg-[rgba(255,255,255,0.14)] dark:placeholder:text-gray-300 rounded-full px-4 outline-none"
        placeholder={t('ai_assistant.compose_placeholder')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleCompose();
          }
        }}
      />
    </div>
  );
}

export default ComposeRewrite;
