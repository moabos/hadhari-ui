import { useEffect } from 'react';
import { Message, Prediction } from 'shared/types';

interface ControlsProps {
  message: Message;
  onDelete: () => void;
  onValidate: (validation: Prediction) => void;
  onNext: () => void;
}

function Controls({ onDelete, onValidate, onNext }: ControlsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toUpperCase()) {
        case 'H':
          onValidate('Ham');
          break;
        case 'S':
          onValidate('Spam');
          break;
        case 'N':
          onNext();
          break;
        case 'D':
          onDelete();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDelete, onValidate, onNext]);

  return (
    <div className="flex w-full justify-self-center border-4 bg-amber-200 p-3 font-bold md:w-11/12">
      <button
        type="button"
        onClick={onDelete}
        className="border-2 bg-red-500 p-2 hover:cursor-pointer"
      >
        DELETE FROM DB <span className="font-mono font-medium">(D)</span>
      </button>
      <div className="ml-auto flex gap-4">
        <button
          type="button"
          onClick={() => onValidate('Ham')}
          className="border-2 bg-green-300 p-2 hover:cursor-pointer"
        >
          Ham <span className="font-mono font-medium">(H)</span>
        </button>
        <button
          type="button"
          onClick={() => onValidate('Spam')}
          className="border-2 bg-red-300 p-2 hover:cursor-pointer"
        >
          Spam <span className="font-mono font-medium">(S)</span>
        </button>
      </div>
      <button
        type="button"
        className="ml-auto border-2 bg-cyan-200 p-2 hover:cursor-pointer"
        onClick={onNext}
      >
        Next <span className="font-mono font-medium">(N)</span>
      </button>
    </div>
  );
}

export default Controls;
