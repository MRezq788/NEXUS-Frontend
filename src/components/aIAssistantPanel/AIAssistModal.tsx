import { useEffect, useState } from "react";
import WritingTools from "./WritingTools";
import InitialMenu from "./InitialMenu";
import { useTranslation } from "react-i18next";

type Props = {
  showAIAssist: boolean;
  getInputsValue: () => { en: string; ar: string };
  activeInputIdx: number | null;
  setInputValue: (idx: number, value: string) => void;
  closeModal: () => void;
  modalPosition?: "up" | "down";
  isLocalized?: boolean;
};

export default function AIAssistModal({
  showAIAssist,
  getInputsValue,
  activeInputIdx,
  setInputValue,
  closeModal,
  modalPosition = "down",
  isLocalized = false,
}: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const [openWritingTools, setOpenWritingTools] = useState(false);
  const [modalHeight, setModalHeight] = useState(2.5);
  const [modalWidth, setModalWidth] = useState(locale == "en" ? 19.25 : 15);
  const isDark = document.documentElement.classList.contains("dark");

  const changeHeight = (newHeight: number) => {
    setModalHeight(newHeight);
  };
  const changeWidth = (newWidth: number) => {
    setModalWidth(newWidth);
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1919) {
        setModalWidth(locale === "en" ? 26.25 : 21.25);
        setModalHeight(openWritingTools ? 24 : 3.75);
      } else {
        setModalWidth(locale === "en" ? 19.25 : openWritingTools ? 19.25 : 15);
        setModalHeight(openWritingTools ? 18 : 2.5);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [locale, openWritingTools]);

  useEffect(() => {
    if (!showAIAssist) {
      // Reset modal dimensions and sub-panel when the AI assist panel closes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModalHeight(2.5);
      setModalWidth(
        window.innerWidth > 1919
          ? locale === "en"
            ? 26.25
            : 21.25
          : locale === "en"
          ? 19.25
          : 15
      );
      setOpenWritingTools(false);
    }
  }, [showAIAssist, locale]);
  if (!showAIAssist) {
    return null;
  }
  return (
    <div
      className={`absolute shadow-xl transition-all duration-150 text-black -start-4 z-30 rounded-3xl  flex items-center justify-center`}
      style={{
        height: `${modalHeight}rem`,
        width: `${modalWidth}rem`,
        ...(modalPosition === "down"
          ? { bottom: `${-(modalHeight + 0.9375)}rem` }
          : { top: `${-(modalHeight + 0.9375)}rem` }),
      }}
    >
      <div
        className={`absolute ${
          modalPosition === "down" ? "-top-3" : "-bottom-3"
        } start-10 w-6 h-4 ${
          openWritingTools ? "opacity-0" : "opacity-100"
        } transition-all duration-150`}
        style={{
          background: isDark
            ? locale === "en"
              ? "linear-gradient(222deg, rgba(34,139,34,1), rgba(0,128,0,1)"
              : "linear-gradient(222deg, rgba(143,188,143,1), rgba(46,139,87,1)"
            : locale === "en"
            ? "linear-gradient(222deg, rgba(144,238,144,1), rgba(152,251,152,1)"
            : "linear-gradient(222deg, rgba(209,250,221,1), rgba(198,246,213,1)",
          clipPath:
            modalPosition === "down"
              ? "polygon(50% 0%, 0% 100%, 100% 100%)"
              : "polygon(50% 100%, 0% 0%, 100% 0%)",
        }}
      />
      <div className="w-full absolute h-full bg-[#D9D9D9] dark:bg-gray-900  rounded-3xl"></div>
      <div
        className="w-full h-full flex items-center justify-center gap-3 absolute rounded-3xl z-10"
        style={{
          background: isDark
            ? "linear-gradient(222deg, rgb(181, 207, 181,0.7) 1.16%,rgb(50, 150, 100,0.7)  98.16%)"
            : "linear-gradient(222deg, rgba(217,251,217,0.72) 1.16%, rgba(130,230,185,0.72) 98.16%), rgba(255,255,255,0.60)",
        }}
      >
        {openWritingTools ? (
          <WritingTools
            setInputValue={setInputValue}
            changeHeight={changeHeight}
            changeWidth={changeWidth}
            closePanel={() => {
              setOpenWritingTools(false);
            }}
            getInputsValue={getInputsValue}
            activeInputIdx={activeInputIdx}
            closeModal={closeModal}
          />
        ) : (
          <InitialMenu
            openWritingTools={() => {
              setOpenWritingTools(true);
              setModalHeight(18);
              setModalWidth(21.25);
            }}
            getInputsValue={getInputsValue}
            activeInputIdx={activeInputIdx}
            setInputValue={setInputValue}
            isLocalized={isLocalized}
          />
        )}
      </div>
    </div>
  );
}
