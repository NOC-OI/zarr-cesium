import { useContextHandle } from '../../../application/use-context';
import { FlashMessage, type FlashMessageProps } from 'zarr-maps-explorer';

export function FlashMessages({
  width,
  duration,
  position
}: Pick<FlashMessageProps, 'width' | 'duration' | 'position'>) {
  const { flashMessage, showFlash, setShowFlash } = useContextHandle();

  return (
    <FlashMessage
      message={flashMessage}
      visible={showFlash}
      onClose={() => setShowFlash(false)}
      width={width}
      duration={duration}
      position={position}
    />
  );
}
