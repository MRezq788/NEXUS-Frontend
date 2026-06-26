import { useState } from "react";
import TranslationIcon from "../svgs/aiAssist/TranslationIcon";
import AIToolsIcon from "../svgs/aiAssist/AIToolsIcon";
import { AIAutoTranslateCall } from "../../services/aiUtils";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { SmallSpinnerLoader } from "../shared/rebrand/loaders";

type Props = {
  openWritingTools: () => void;
  getInputsValue: () => { en: string; ar: string };
  activeInputIdx: number | null;
  setInputValue: (idx: number, value: string) => void;
  isLocalized?: boolean;
};

export default function InitialMenu({
  openWritingTools,
  getInputsValue,
  activeInputIdx,
  setInputValue,
  isLocalized = false,
}: Props) {
  const { t } = useTranslation();
  const [translationLoading, setTranslationLoading] = useState(false);

  const handleAutoTranslation = async () => {
    if (translationLoading) return;
    setTranslationLoading(true);
    const inputs = getInputsValue();

    try {
      let result = "";
      let targetIdx = activeInputIdx;

      if (isLocalized) {
        // For localized inputs: translate from the OTHER input and put result in CURRENT input
        if (activeInputIdx === 0) {
          // English input clicked: take text from Arabic, translate to English, put in English
          if (!inputs.ar || inputs.ar.trim().length === 0) {
            toast.error(t("ai_assistant.enter_text_to_translate"));
            setTranslationLoading(false);
            return;
          }
          result = await AIAutoTranslateCall(inputs.ar, "english");
          targetIdx = 0; // Put result in English input (current/clicked)
        } else {
          // Arabic input clicked: take text from English, translate to Arabic, put in Arabic
          if (!inputs.en || inputs.en.trim().length === 0) {
            toast.error(t("ai_assistant.enter_text_to_translate"));
            setTranslationLoading(false);
            return;
          }
          result = await AIAutoTranslateCall(inputs.en, "arabic");
          targetIdx = 1; // Put result in Arabic input (current/clicked)
        }
      } else {
        // For non-localized inputs: auto-detect language and translate current input text
        const currentText = activeInputIdx === 0 ? inputs.en : inputs.ar;

        if (!currentText || currentText.trim().length === 0) {
          toast.error(t("ai_assistant.enter_text_to_translate"));
          setTranslationLoading(false);
          return;
        }

        const hasArabic = /[\u0600-\u06FF]/.test(currentText);

        if (hasArabic) {
          // Text is in Arabic, translate to English
          result = await AIAutoTranslateCall(currentText, "english");
        } else {
          // Text is in English (or other), translate to Arabic
          result = await AIAutoTranslateCall(currentText, "arabic");
        }
        targetIdx = activeInputIdx;
      }

      if (targetIdx !== null) {
        setInputValue(targetIdx, result);
      }
    } catch (error) {
      console.error("AIAutoTranslateCall error:", error);
      toast.error(t("ai_assistant.translation_failed"));
    } finally {
      setTranslationLoading(false);
    }
  };
  return (
    <>
      <button
        type="button"
        className="flex items-center text-sm gap-1 dark:text-white bg-transparent border-none p-0 cursor-pointer"
        aria-label={t("ai_assistant.auto_translation")}
        onClick={handleAutoTranslation}
      >
        <span className="text-fuze-blue-400 dark:text-white">
          {translationLoading ? <SmallSpinnerLoader /> : <TranslationIcon />}
        </span>
        <p>{t("ai_assistant.auto_translation")}</p>
      </button>
      <div className="text-white opacity-60">|</div>
      <button
        type="button"
        className="flex cursor-pointer items-center dark:text-white text-sm gap-1 bg-transparent border-none p-0"
        onClick={openWritingTools}
        aria-label={t("ai_assistant.writing_tools")}
      >
        <span className="text-fuze-blue-400 dark:text-white">
          <AIToolsIcon />
        </span>
        <p>{t("ai_assistant.writing_tools")}</p>
      </button>
    </>
  );
}
