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
    infoButtonBox.onClose?.();
    setInfoButtonBox({});
  }
  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable nodeRef={nodeRef} cancel=".clickable">
      <div
        className="info-panel absolute left-full top-0 z-20 ml-4 overflow-x-hidden overflow-y-auto whitespace-pre-line p-3 text-white max-sm:fixed! max-sm:bottom-2 max-sm:left-2! max-sm:top-auto! max-sm:m-0 max-sm:max-h-[52vh]"
        id="info-subsection"
        ref={nodeRef}
      >
        <div className="info-panel__topbar">
          <span>{infoButtonBox.title}</span>
          <CancelIcon
            onClick={handleClose}
            className="clickable cursor-pointer hover:text-yellow-500"
          />
        </div>
        <div className="markdown-content max-h-[82vh] overflow-y-auto overflow-x-hidden">
          <div>{infoButtonBox.content}</div>
        </div>
      </div>
    </Draggable>
  );
}
