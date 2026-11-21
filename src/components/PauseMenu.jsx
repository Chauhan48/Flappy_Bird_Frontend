import React from "react";
import { sound } from "../utils/audio";

export default function PauseMenu({ onResume, onRestart, onChangeDifficulty }) {
  return (
    <div className="overlay-wrapper">
      <div className="menu-box pause-box">
        <h2 className="modal-title">PAUSED</h2>

        <div className="button-group">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              sound.playClick();
              onResume();
            }}
          >
            Resume
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
          >
            Restart
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              sound.playClick();
              onChangeDifficulty();
            }}
          >
            Main Menu
          </button>
        </div>

        <p className="controls-text">Press P or Esc to resume</p>
      </div>
    </div>
  );
}
