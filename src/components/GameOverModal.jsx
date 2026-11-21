import React from "react";
import { DIFFICULTY_LEVELS } from "../utils/constants";
import { sound } from "../utils/audio";

export default function GameOverModal({
  score,
  difficulty,
  highScore,
  isNewHigh,
  onRestart,
  onChangeDifficulty,
}) {
  const diff = DIFFICULTY_LEVELS[difficulty];

  return (
    <div className="overlay-wrapper">
      <div className="menu-box game-over-box">
        <h2 className="modal-title game-over-title">GAME OVER</h2>

        <div className="stats-box">
          <div className="stat-line">
            <span>Difficulty:</span>
            <strong>{diff.name}</strong>
          </div>
          <div className="stat-line">
            <span>Score:</span>
            <strong>{score}</strong>
          </div>
          <div className="stat-line">
            <span>Best:</span>
            <strong>{highScore}</strong>
          </div>
          {isNewHigh && <div className="new-high-tag">New Best Score!</div>}
        </div>

        <div className="button-group">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
          >
            Play Again
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

        <p className="controls-text">Press Space or Enter to restart</p>
      </div>
    </div>
  );
}
