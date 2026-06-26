import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type FocusEvent,
} from "react";
import { createPortal } from "react-dom";
import AIAssistModal from "./AIAssistModal";

type TextAreaComponentProps = Record<string, unknown>;

type ProgrammaticEvent = Event & { isProgrammatic?: boolean };

function AIAssistWrapperTextarea<P extends TextAreaComponentProps>(
  TextAreaComponent: ComponentType<P>,
) {
  return function WrappedWithModals(props: P) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [targets, setTargets] = useState<HTMLElement[]>([]);
    const [activeTextareaIdx, setActiveTextareaIdx] = useState<number | null>(
      null,
    );

    // Find portal targets as soon as the DOM is ready.
    useLayoutEffect(() => {
      const container = wrapperRef.current;
      if (!container) return;
      const relativeParents = container.querySelectorAll(".relative");
      const wrappers = Array.from(relativeParents).filter((el) =>
        el.querySelector("textarea"),
      );
      setTargets(wrappers as HTMLElement[]);
    }, []);

    // Close panel when the user types (ignore programmatic value changes).
    // The state update is deferred so it doesn't race with React's own
    // onChange handler that updates the controlled textarea value.
    useEffect(() => {
      const container = wrapperRef.current;
      if (!container) return;
      const handleInput = (e: Event) => {
        const pe = e as ProgrammaticEvent;
        if (pe.isProgrammatic) return;
        setTimeout(() => setActiveTextareaIdx(null), 0);
      };
      const textareas = container.querySelectorAll("textarea");
      textareas.forEach((textarea) =>
        textarea.addEventListener("input", handleInput),
      );
      return () =>
        textareas.forEach((textarea) =>
          textarea.removeEventListener("input", handleInput),
        );
    }, [targets]);

    // Close panel when clicking outside the wrapper.
    useEffect(() => {
      const handleDocumentClick = (event: MouseEvent) => {
        const isInside = wrapperRef.current?.contains(event.target as Node);
        if (!isInside) setActiveTextareaIdx(null);
      };
      document.addEventListener("mousedown", handleDocumentClick);
      return () => document.removeEventListener("mousedown", handleDocumentClick);
    }, []);

    const openPanelForElement = (target: HTMLElement) => {
      const textareas = wrapperRef.current?.querySelectorAll("textarea") ?? [];
      const idx = Array.from(textareas).findIndex(
        (textarea) => textarea === target || textarea.contains(target),
      );
      if (idx !== -1) setActiveTextareaIdx(idx);
    };

    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      openPanelForElement(e.target as HTMLElement);
    };

    const handleWrapperFocus = (e: FocusEvent<HTMLDivElement>) => {
      openPanelForElement(e.target as HTMLElement);
    };

    const handleCloseModal = () => setActiveTextareaIdx(null);

    const getTextAreaValues = () => {
      const container = wrapperRef.current;
      if (!container) return { en: "", ar: "" };
      const textareas = container.querySelectorAll("textarea");
      return {
        en: textareas[0]?.value ?? "",
        ar: textareas[1]?.value ?? "",
      };
    };

    const setTextAreaValue = (idx: number, value: string) => {
      const container = wrapperRef.current;
      if (!container) return;
      const textareas = container.querySelectorAll("textarea");
      const textarea = textareas[idx] as HTMLTextAreaElement | undefined;
      if (!textarea) return;

      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(textarea, value);
      } else {
        textarea.value = value;
      }

      const inputEvent = new Event("input", { bubbles: true }) as ProgrammaticEvent;
      inputEvent.isProgrammatic = true;
      textarea.dispatchEvent(inputEvent);

      const changeEvent = new Event("change", { bubbles: true }) as ProgrammaticEvent;
      changeEvent.isProgrammatic = true;
      textarea.dispatchEvent(changeEvent);
    };

    return (
      <>
        <div ref={wrapperRef} onClick={handleWrapperClick} onFocus={handleWrapperFocus}>
          <TextAreaComponent {...props} />
        </div>

        {targets.map((target, idx) =>
          createPortal(
            <AIAssistModal
              showAIAssist={activeTextareaIdx === idx}
              getInputsValue={getTextAreaValues}
              setInputValue={setTextAreaValue}
              key={idx}
              activeInputIdx={idx}
              closeModal={handleCloseModal}
              isLocalized={Boolean(props.localizedInput)}
            />,
            target,
          ),
        )}
      </>
    );
  };
}

export default AIAssistWrapperTextarea;
