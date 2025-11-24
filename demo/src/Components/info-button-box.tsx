import { useRef } from 'react';
import Draggable from 'react-draggable';
import type { InfoButtonBoxType } from '../types';
import CancelIcon from '@mui/icons-material/Cancel';
interface InfoButtonBoxProps {
  infoButtonBox: InfoButtonBoxType;
  setInfoButtonBox: React.Dispatch<React.SetStateAction<InfoButtonBoxType>>;
}

export function InfoButtonBox({ infoButtonBox, setInfoButtonBox }: InfoButtonBoxProps) {
  function handleClose() {
    setInfoButtonBox({});
  }
  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable nodeRef={nodeRef} cancel=".clickable">
      <div
        className="w-104 ml-4 left-full top-[5vh] absolute bg-[rgba(17,17,17,0.6)] text-white z-20 p-2 rounded-2xl shadow-[0px_4px_4px_rgba(0,0,0,1)] whitespace-pre-line overflow-y-auto overflow-x-hidden"
        id="info-subsection"
        ref={nodeRef}
      >
        <div className="flex justify-end">
          <CancelIcon
            onClick={handleClose}
            className="clickable cursor-pointer hover:text-yellow-500"
          />
        </div>
        <div className="text-sm text-center pb-1.5 font-bold">{infoButtonBox.title}</div>
        <div className="markdown-content content-center pb-2 pt-3 max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <p>{infoButtonBox.content}</p>
        </div>
      </div>
    </Draggable>
  );
}
