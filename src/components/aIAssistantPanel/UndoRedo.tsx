import { useEffect } from 'react';
import Undo from '../svgs/Undo';
import Redo from '../svgs/Redo';

type Props = {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  setInputValue: (idx: number, value: string) => void;
  activeInputIdx: number | null;
  currentText: string;
  currentIndex: number;
  history: string[];
};

export default function UndoRedo({
  undo,
  redo,
  canUndo,
  canRedo,
  activeInputIdx,
  currentText,
  setInputValue,
  currentIndex,
  history,
}: Props) {
  useEffect(() => {
    if (activeInputIdx !== null) {
      setInputValue(activeInputIdx, currentText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, history]);
  return (
    <div className="flex gap-0.5">
      <button
        type="button"
        className={`p-3 h-11 w-11 bg-white dark:bg-[rgba(255,255,255,0.14)] rounded-s-full ${
          canUndo ? '' : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={() => {
          undo();
        }}
        disabled={!canUndo}
      >
        <Undo />
      </button>
      <button
        type="button"
        className={`p-3 h-11 w-11 bg-white dark:bg-[rgba(255,255,255,0.14)] rounded-e-full ${
          canRedo ? '' : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={() => {
          redo();
        }}
        disabled={!canRedo}
      >
        <Redo />
      </button>
    </div>
  );
}
