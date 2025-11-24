import { CSSTransition } from 'react-transition-group';
import styles from './FlashMessages.module.css';
import classnames from 'classnames';
import type { FlashMessagesProps } from '../../../types';
import { useContextHandle } from '../../../application/use-context';

export function FlashMessages({ width, duration, position }: FlashMessagesProps) {
  const { flashMessage, showFlash, setShowFlash } = useContextHandle();

  const ToastClassNames = {
    [styles.error]: flashMessage.messageType === 'error',
    [styles.warning]: flashMessage.messageType === 'warning',
    [styles.info]: flashMessage.messageType === 'info',
    [styles.success]: flashMessage.messageType === 'success',
    [styles.bleft]: position === 'bleft',
    [styles.bright]: position === 'bright',
    [styles.tright]: position === 'tright',
    [styles.tleft]: position === 'tleft',
    [styles.tcenter]: position === 'tcenter',
    [styles.bcenter]: position === 'bcenter',
    [styles.bcenter]: position === 'bcenter',
    [styles.fullWidth]: width === 'full',
    [styles.smallWidth]: width === 'small',
    [styles.mediumWidth]: width === 'medium',
    [styles.largeWidth]: width === 'large'
  };

  setTimeout(() => {
    setShowFlash(false);
  }, flashMessage.duration || duration);
  return (
    <>
      {showFlash && (
        <CSSTransition
          in={showFlash}
          timeout={flashMessage.duration || duration}
          classNames="toast"
          unmountOnExit
          onExit={() => setShowFlash(!showFlash)}
        >
          <div id="flash-message" className={classnames(styles.toast, ToastClassNames)}>
            <div className={styles.toastMessage}>{flashMessage.content}</div>
            <button className={styles.toastDismiss} onClick={() => setShowFlash(!showFlash)}>
              &#10005;
            </button>
          </div>
        </CSSTransition>
      )}
    </>
  );
}
