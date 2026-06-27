import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Close from "../svgs/rebrand/shared/Close";
import Proofread from "../svgs/aiAssist/Proofread";
import Rewrite from "../svgs/aiAssist/Rewrite";
import Friendly from "../svgs/aiAssist/Friendly";
import Professional from "../svgs/aiAssist/Professional";
import Concise from "../svgs/aiAssist/Concise";
import Compose from "../svgs/aiAssist/Compose";
import AIRewriteOption from "./AIRewriteOption";
import { AIAssistCall } from "../../services/aiUtils";
import type { AIToolType } from "../../models/aiMessage";
import toast from "react-hot-toast";
// import { useSnapshot } from 'valtio';
// import { aiChatState } from '../../store/aiChat';
import { useTranslation } from "react-i18next";
import { SmallSpinnerLoader } from "../shared/rebrand/loaders";

type Props = {
  changeHeight: (newHeight: number) => void;
  changeWidth: (newWidth: number) => void;
  closePanel: () => void;
  getInputsValue: () => { en: string; ar: string };
  activeInputIdx: number | null;
  setInputValue: (idx: number, value: string) => void;
  closeModal: () => void;
};

export default function WritingTools({
  changeHeight,
  getInputsValue,
  activeInputIdx,
  changeWidth,
  closePanel,
  setInputValue,
  closeModal,
}: Props) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const toastPosition = locale === "ar" ? "top-left" : "top-right";
  const [selectedComponent, setSelectedComponent] = useState<ReactNode | null>(
    null
  );
  const [loadingOp, setLoadingOp] = useState<number | null>(null);
  const originalTextRef = useRef("");
  const [isComposingMode, setIsComposingMode] = useState(false);
  const composeRef = useRef<HTMLInputElement>(null);
  const composeAreaRef = useRef<HTMLDivElement>(null);
  // const aiChat = useSnapshot(aiChatState);
  const handleBack = () => {
    setSelectedComponent(null);

    changeHeight(18);
    changeWidth(21.25);
  };
  useEffect(() => {
    if (isComposingMode) {
      composeRef.current?.focus();
    }
  }, [isComposingMode]);

  useEffect(() => {
    if (!isComposingMode) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        composeAreaRef.current &&
        !composeAreaRef.current.contains(event.target as Node)
      ) {
        setIsComposingMode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isComposingMode]);

  const tools = [
    {
      name: t("ai_assistant.proofread"),
      type: "proofread",
      icon: loadingOp == 0 ? <SmallSpinnerLoader /> : <Proofread />,
    },
    {
      name: t("ai_assistant.rewrite"),
      type: "rewrite",
      icon: loadingOp == 1 ? <SmallSpinnerLoader /> : <Rewrite />,
    },
    {
      name: t("ai_assistant.friendly"),
      type: "friendly",
      icon: loadingOp == 2 ? <SmallSpinnerLoader /> : <Friendly />,
    },
    {
      name: t("ai_assistant.professional"),
      type: "professional",
      icon: loadingOp == 3 ? <SmallSpinnerLoader /> : <Professional />,
    },
    {
      name: t("ai_assistant.concise"),
      type: "concise",
      icon: loadingOp == 4 ? <SmallSpinnerLoader /> : <Concise />,
    },
  ];

  const handleOperationClick = async (index: number, type: AIToolType) => {
    setLoadingOp(index);
    const original =
      activeInputIdx == 0 ? getInputsValue().en : getInputsValue().ar;
    originalTextRef.current = original;
    if (original.length === 0) {
      toast.error(t("ai_assistant.enter_text_to_rewrite"), {
        position: toastPosition,
      });
      setLoadingOp(null);
      return;
    }
    try {
      const response = await AIAssistCall(
        type,
        original,
        activeInputIdx === 0 ? "english" : "arabic"
      );
      if (activeInputIdx !== null) {
        if (activeInputIdx !== null) {
          if (activeInputIdx !== null) {
            if (activeInputIdx !== null) {
              if (activeInputIdx !== null) {
                setInputValue(activeInputIdx, response);
              }
            }
          }
        }
      }
      setSelectedComponent(
        <AIRewriteOption
          type={type}
          title={tools[index].name}
          changeHeight={changeHeight}
          changeWidth={changeWidth}
          goBack={handleBack}
          getInputsValue={getInputsValue}
          activeInputIdx={activeInputIdx}
          setInputValue={setInputValue}
          originalText={originalTextRef.current}
          closeModal={closeModal}
        />
      );
      setIsComposingMode(false);
    } catch (error) {
      toast.error(t("ai_assistant.something_went_wrong"), {
        position: toastPosition,
      });
      console.error(error);
    } finally {
      setLoadingOp(null);
    }
  };

  const handleCompose = async () => {
    setLoadingOp(5);
    if (composeRef.current?.value.length == 0) {
      toast.error(t("ai_assistant.enter_text_to_compose"), {
        position: toastPosition,
      });
      setLoadingOp(null);
      return;
    }
    const original =
      activeInputIdx == 0 ? getInputsValue().en : getInputsValue().ar;
    originalTextRef.current = original;
    const response = await AIAssistCall(
      "compose",
      original,
      activeInputIdx === 0 ? "english" : "arabic",
      composeRef.current?.value || ""
    );
    if (activeInputIdx !== null) {
      setInputValue(activeInputIdx, response);
    }
    setLoadingOp(null);
    setSelectedComponent(
      <AIRewriteOption
        type="compose"
        title={t("ai_assistant.compose")}
        changeHeight={changeHeight}
        changeWidth={changeWidth}
        goBack={handleBack}
        getInputsValue={getInputsValue}
        activeInputIdx={activeInputIdx}
        setInputValue={setInputValue}
        originalText={originalTextRef.current}
        composeText={composeRef.current?.value || ""}
        closeModal={closeModal}
      />
    );
    setIsComposingMode(false);
  };

  return (
    <div className="w-full h-full p-6 dark:text-white">
      {selectedComponent ? (
        <>{selectedComponent}</>
      ) : (
        <>
          <div className="flex justify-between mb-5">
            <h1>{t("ai_assistant.writing_tools")}</h1>
            <span
              className="cursor-pointer"
              onClick={() => {
                changeHeight(2.5);
                changeWidth(locale == "en" ? 19.25 : 15);
                setSelectedComponent(null);
                closePanel();
              }}
            >
              <Close />
            </span>
          </div>
          {/* <div
            className="flex gap-2 my-4 items-center w-full bg-white dark:bg-[rgba(255,255,255,0.14)] rounded-full px-4 py-2 cursor-pointer"
            onClick={() => {
              if (activeInputIdx == 0 && getInputsValue().en.length === 0) {
                toast.error(t('ai_assistant.enter_english_to_add_to_chat'), {
                  position: toastPosition,
                });
                return;
              }
              if (activeInputIdx == 1 && getInputsValue().ar.length === 0) {
                toast.error(t('ai_assistant.enter_arabic_to_add_to_chat'), {
                  position: toastPosition,
                });
                return;
              }

              aiChatState.showAiChat = true;
              aiChatState.addToChat =
                activeInputIdx === 0 ? getInputsValue().en : getInputsValue().ar;
              closeModal();
            }}
          >
            <span className="text-fuze-blue-400 dark:text-white">
              <AIToolsIcon />
            </span>
            <p className="text-fuze-blue-400 dark:text-white">{t('ai_assistant.add_to_chat')}</p>
          </div> */}
          <div className="grid grid-rows-2 gap-2">
            <div className="grid grid-cols-2 gap-2">
              {tools.slice(0, 2).map((tool, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center py-3 px-2 bg-white dark:bg-[rgba(255,255,255,0.14)] rounded-xl cursor-pointer"
                  onClick={() => {
                    if (loadingOp !== null) return;
                    handleOperationClick(index, tool.type as AIToolType);
                  }}
                >
                  {tool.icon}
                  <p className="mt-2 text-xs text-center">{tool.name}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {tools.slice(2, 5).map((tool, index) => (
                <div
                  key={index + 2}
                  className="flex flex-col items-center justify-center py-3 px-2 bg-white dark:bg-[rgba(255,255,255,0.14)] rounded-xl cursor-pointer"
                  onClick={() => {
                    if (loadingOp !== null) return;
                    handleOperationClick(index + 2, tool.type as AIToolType);
                  }}
                >
                  {tool.icon}
                  <p className="mt-2 text-xs text-center">{tool.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className={`flex gap-2 my-4 relative items-center w-full bg-white dark:bg-[rgba(255,255,255,0.14)] rounded-full   ${
              isComposingMode ? "py-5" : " px-4 py-2"
            }`}
          >
            {isComposingMode ? (
              <div
                ref={composeAreaRef}
                className="flex items-center justify-between w-full h-full"
              >
                <input
                  ref={composeRef}
                  type="text"
                  className="h-full dark:bg-transparent dark:placeholder:text-gray-300 focus:outline-none absolute w-[90%] px-4 rounded-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCompose();
                    }
                  }}
                  placeholder={t("ai_assistant.compose_placeholder")}
                />
                <span
                  onClick={handleCompose}
                  className="absolute bg-white cursor-pointer  px-3 rounded-full dark:bg-transparent end-2"
                >
                  {loadingOp == 5 ? <SmallSpinnerLoader /> : <Compose />}
                </span>
              </div>
            ) : (
              <span
                className="flex items-center w-full gap-2 cursor-pointer"
                onClick={() => {
                  setIsComposingMode(true);
                }}
              >
                <Compose />
                <p className="">{t("ai_assistant.compose")}</p>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
