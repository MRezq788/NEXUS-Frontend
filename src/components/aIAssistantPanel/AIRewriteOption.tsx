import React, { useEffect, useRef, useState } from "react";
import FullArrowBack from "../svgs/rebrand/shared/FullArrowBack";
import CheckMark from "../svgs/rebrand/shared/CheckMark";
import Reload from "../svgs/rebrand/shared/Reload";
import Rewrite from "../svgs/aiAssist/Rewrite";
import Like from "../svgs/rebrand/Like";
import UndoRedo from "./UndoRedo";
import ComposeRewrite from "./ComposeRewrite";
import { AIAssistCall } from "../../services/aiUtils";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { SmallSpinnerLoader } from "../shared/rebrand/loaders";

type Props = {
  type:
    | "proofread"
    | "rewrite"
    | "friendly"
    | "professional"
    | "concise"
    | "compose";
  title: string;
  changeHeight: (newHeight: number) => void;
  changeWidth: (newWidth: number) => void;
  goBack: () => void;
  originalText: string;
  activeInputIdx: number | null;
  setInputValue: (idx: number, value: string) => void;
  getInputsValue: () => { en: string; ar: string };
  composeText?: string;
  closeModal: () => void;
};

export default function AIRewriteOption({
  type,
  goBack,
  title,
  changeHeight,
  getInputsValue,
  activeInputIdx,
  setInputValue,
  originalText,
  closeModal,
}: Props) {
  useEffect(() => {
    changeHeight(11.25);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [responses, setResponses] = useState<string[]>([
    activeInputIdx === 0 ? getInputsValue().en : getInputsValue().ar,
  ]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRewrite, setIsRewrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<"none" | "like" | "dislike">("none");
  const composeInputRef = useRef<HTMLInputElement>(null);
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const toastPosition = locale === "ar" ? "top-left" : "top-right";
  const undo = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };
  //
  const redo = () => {
    if (currentIdx < responses.length - 1) setCurrentIdx(currentIdx + 1);
  };

  useEffect(() => {
    if (activeInputIdx !== null) {
      setInputValue(activeInputIdx, responses[currentIdx]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, responses]);

  const handleRewrite = async () => {
    setLoading(true);
    const typedText =
      activeInputIdx === 0 ? getInputsValue().en : getInputsValue().ar;
    if (typedText.length === 0) {
      toast.error(t("enter_text_to_rewrite"), { position: toastPosition });
      setLoading(false);
      return;
    }
    if (type == "compose" && composeInputRef?.current?.value.length === 0) {
      toast.error(t("enter_text_to_compose"), { position: toastPosition });
      setLoading(false);
      return;
    }
    try {
      const response = await AIAssistCall(
        type,
        activeInputIdx === 0 ? getInputsValue().en : getInputsValue().ar,
        activeInputIdx === 0 ? "english" : "arabic",
        type === "compose" ? composeInputRef.current?.value : undefined,
      );
      const newResponses = [...responses.slice(0, currentIdx + 1), response];
      setResponses(newResponses);
      setCurrentIdx(newResponses.length - 1);
      if (activeInputIdx !== null) setInputValue(activeInputIdx, response);
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        position: toastPosition,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const canUndo = currentIdx > 0;
  const canRedo = currentIdx < responses.length - 1;

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className={`w-8 h-8 rounded-full ${
            locale == "ar" ? "rotate-180" : ""
          } bg-white dark:bg-[rgba(255,255,255,0.14)] flex items-center justify-center cursor-pointer`}
          aria-label={t("ai_assistant.go_back")}
        >
          <FullArrowBack />
        </button>
        <p>{title}</p>
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer bg-green-400"
          aria-label={t("ai_assistant.confirm")}
          onClick={() => {
            closeModal();
          }}
        >
          <CheckMark />
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 my-4">
        <button
          type="button"
          className={`${
            type != "compose" || !isRewrite ? "w-[141px]" : "w-11"
          } flex transition-all duration-300 items-center justify-center gap-1 p-3  h-11  bg-white dark:bg-[rgba(255,255,255,0.14)] rounded-full cursor-pointer`}
          aria-label={t("ai_assistant.show_original")}
          onClick={() => {
            if (activeInputIdx !== null) {
              setInputValue(activeInputIdx, originalText);
            }
            setIsRewrite(true);
            setResponses((prev) => {
              if (prev[0] !== originalText) {
                return [originalText, ...prev];
              }
              return prev;
            });
            setCurrentIdx(0);
          }}
        >
          <Reload />
          {(type != "compose" || !isRewrite) && (
            <p>{t("ai_assistant.original")}</p>
          )}
        </button>
        {isRewrite ? (
          type === "compose" ? (
            <ComposeRewrite
              composeInputRef={
                composeInputRef as React.RefObject<HTMLInputElement>
              }
              handleCompose={handleRewrite}
            />
          ) : (
            <UndoRedo
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              setInputValue={setInputValue}
              activeInputIdx={activeInputIdx}
              currentText={responses[currentIdx]}
              currentIndex={currentIdx}
              history={responses}
            />
          )
        ) : (
          <button
            type="button"
            className="flex items-center justify-center gap-1 p-3 ps-4 h-11 w-[141px] bg-white dark:bg-[rgba(255,255,255,0.14)] rounded-full cursor-pointer"
            aria-label={t("ai_assistant.show_rewrite")}
            onClick={async () => {
              setIsRewrite(true);
              if (type != "compose") {
                await handleRewrite();
              }
            }}
          >
            {loading ? <SmallSpinnerLoader /> : <Rewrite />}
            <p>{t("ai_assistant.rewrite")}</p>
          </button>
        )}

        {isRewrite && (
          <button
            type="button"
            className="flex items-center justify-center gap-1 p-3  h-11 w-11 bg-white dark:bg-[rgba(255,255,255,0.14)] rounded-full cursor-pointer"
            aria-label={t("ai_assistant.show_rewrite")}
            onClick={handleRewrite}
          >
            {loading ? <SmallSpinnerLoader /> : <Rewrite />}
          </button>
        )}
      </div>
      <div className="flex items-center justify-center gap-4 my-4">
        <button
          type="button"
          aria-label={t("ai_assistant.like")}
          className={`cursor-pointer transition ${
            feedback === "like"
              ? "text-fuze-blue-400"
              : "hover:text-fuze-blue-400"
          }`}
          onClick={() => setFeedback(feedback === "like" ? "none" : "like")}
        >
          <Like />
        </button>
        <p className="text-xs">{t("ai_assistant.share_feedback")}</p>
        <button
          type="button"
          aria-label={t("ai_assistant.dislike")}
          className={`-scale-y-100 cursor-pointer transition ${
            feedback === "dislike" ? "text-red-500" : "hover:text-fuze-blue-400"
          }`}
          onClick={() =>
            setFeedback(feedback === "dislike" ? "none" : "dislike")
          }
        >
          <Like />
        </button>
      </div>
    </div>
  );
}
