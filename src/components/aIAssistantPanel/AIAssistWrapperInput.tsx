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

type InputComponentProps = Record<string, unknown>;

type ProgrammaticEvent = Event & { isProgrammatic?: boolean };

function AIAssistWrapperInput<P extends InputComponentProps>(
  InputComponent: ComponentType<P>,
) {
  return function WrappedWithModals(props: P) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [targets, setTargets] = useState<HTMLElement[]>([]);
    const [activeInputIdx, setActiveInputIdx] = useState<number | null>(null);

    // Find portal targets as soon as the DOM is ready.
    useLayoutEffect(() => {
      const container = wrapperRef.current;
      if (!container) return;
      const relativeParents = container.querySelectorAll(".relative");
      const wrappers = Array.from(relativeParents).filter((el) =>
        el.querySelector("input"),
      );
      setTargets(wrappers as HTMLElement[]);
    }, []);

    // Close panel when the user types (ignore programmatic value changes).
    // The state update is deferred so it doesn't race with React's own
    // onChange handler that updates the controlled input value.
    useEffect(() => {
      const container = wrapperRef.current;
      if (!container) return;
      const handleInput = (e: Event) => {
        const pe = e as ProgrammaticEvent;
        if (pe.isProgrammatic) return;
        setTimeout(() => setActiveInputIdx(null), 0);
      };
      const inputs = container.querySelectorAll("input");
      inputs.forEach((input) => input.addEventListener("input", handleInput));
      return () =>
        inputs.forEach((input) =>
          input.removeEventListener("input", handleInput),
        );
    }, [targets]);

    // Close panel when clicking outside the wrapper.
    useEffect(() => {
      const handleDocumentClick = (event: MouseEvent) => {
        const isInside = wrapperRef.current?.contains(event.target as Node);
        if (!isInside) setActiveInputIdx(null);
      };
      document.addEventListener("mousedown", handleDocumentClick);
      return () => document.removeEventListener("mousedown", handleDocumentClick);
    }, []);

    const openPanelForElement = (target: HTMLElement) => {
      const inputs = wrapperRef.current?.querySelectorAll("input") ?? [];
      const idx = Array.from(inputs).findIndex(
        (input) => input === target || input.contains(target),
      );
      if (idx !== -1) setActiveInputIdx(idx);
    };

    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      openPanelForElement(e.target as HTMLElement);
    };

    const handleWrapperFocus = (e: FocusEvent<HTMLDivElement>) => {
      openPanelForElement(e.target as HTMLElement);
    };

    const handleCloseModal = () => setActiveInputIdx(null);

    const getInputValues = () => {
      const container = wrapperRef.current;
      if (!container) return { en: "", ar: "" };
      const inputs = container.querySelectorAll("input");
      return {
        en: inputs[0]?.value ?? "",
        ar: inputs[1]?.value ?? "",
      };
    };

    const setInputValue = (idx: number, value: string) => {
      const container = wrapperRef.current;
      if (!container) return;
      const inputs = container.querySelectorAll("input");
      const input = inputs[idx] as HTMLInputElement | undefined;
      if (!input) return;

      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(input, value);
      } else {
        input.value = value;
      }

      const inputEvent = new Event("input", { bubbles: true }) as ProgrammaticEvent;
      inputEvent.isProgrammatic = true;
      input.dispatchEvent(inputEvent);

      const changeEvent = new Event("change", { bubbles: true }) as ProgrammaticEvent;
      changeEvent.isProgrammatic = true;
      input.dispatchEvent(changeEvent);
    };

    const inputType = (props.type as string | undefined) ?? "text";

    return (
      <>
        <div
          ref={wrapperRef}
          className="w-full"
          onClick={handleWrapperClick}
          onFocus={handleWrapperFocus}
        >
          <InputComponent {...props} />
        </div>
        {targets.map((target, idx) =>
          createPortal(
            <AIAssistModal
              showAIAssist={
                inputType === "text" && activeInputIdx === idx
              }
              getInputsValue={getInputValues}
              setInputValue={setInputValue}
              key={idx}
              activeInputIdx={idx}
              closeModal={handleCloseModal}
              modalPosition={(props.modalPosition as "up" | "down" | undefined) || "down"}
              isLocalized={Boolean(props.localizedInput)}
            />,
            target,
          ),
        )}
      </>
    );
  };
}

export default AIAssistWrapperInput;
