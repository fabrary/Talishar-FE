import React, { useEffect, useMemo, useState } from 'react';
import { submitButton } from 'features/game/GameSlice';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './PassTurnDisplay.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import useSound from 'use-sound';
import passTurnSound from 'sounds/prioritySound.wav';
import { createPortal } from 'react-dom';

export default function PassTurnDisplay() {
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );
  const hasPriority = useAppSelector(
    (state: RootState) => state.game.hasPriority
  );
  const frameNumber = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastUpdate
  );
  const [areYouSure, setAreYouSure] = useState<boolean>(false);
  const [showAreYouSureModal, setShowAreYouSureModal] =
    useState<boolean>(false);
  const [canPassController, setCanPassController] = useState<boolean>(false);
  const [playPassTurnSound] = useSound(passTurnSound);
  const preventPassPrompt = useAppSelector(
    (state: RootState) => state.game.preventPassPrompt
  );

  const dispatch = useAppDispatch();

  useMemo(() => {
    if (hasPriority) {
      playPassTurnSound();
    }
  }, [frameNumber]);

  useEffect(() => {
    let link = document.getElementById('favicon') as HTMLLinkElement;
    if (hasPriority && link) {
      link.href = '/images/priorityGreen.ico';
    } else if (link) {
      link.href = '/images/priorityGrey.ico';
    }
  }, [hasPriority]);

  const onPassTurn = () => {
    if (preventPassPrompt && !showAreYouSureModal) {
      setShowAreYouSureModal(true);
    } else {
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
    }
    setCanPassController(true);
  };

  useShortcut(DEFAULT_SHORTCUTS.PASS_TURN, onPassTurn);

  const clickYes = (e: any) => {
    e.preventDefault();
    console.log('yes!');
    setShowAreYouSureModal(false);
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const clickNo = (e: any) => {
    e.preventDefault();
    console.log('no!');
    setShowAreYouSureModal(false);
  };

  if (canPassPhase === undefined) {
    return <div className={styles.passTurnDisplay}></div>;
  }

  if (canPassPhase === true) {
    return (
      <>
        <div className={styles.passTurnDisplayActive} onClick={onPassTurn}>
          <div> PASS </div>
          <div className={styles.subThing}>[spacebar]</div>
        </div>
        {showAreYouSureModal &&
          createPortal(
            <>
              <dialog open={showAreYouSureModal} className={styles.modal}>
                <article>
                  <header>{preventPassPrompt}</header>
                  <button onClick={clickYes}>YES</button>
                  <button onClick={clickNo}>NO</button>
                </article>
              </dialog>
            </>,
            document.body
          )}
      </>
    );
  }

  if (canPassPhase === false) {
    return <div className={styles.passTurnDisplay}>WAIT</div>;
  }

  return null;
}
