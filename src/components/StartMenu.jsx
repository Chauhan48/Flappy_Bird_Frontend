import React from "react";
import { DIFFICULTY_LEVELS } from "../utils/constants";
import { sound } from "../utils/audio";

export default function StartMenu({
  currentDifficulty,
  onSelectDifficulty,
  onStartGame,
  highScores,
  isMuted,
  onToggleMute,
}) {
  const currentBest = highScores[currentDifficulty] || 0;

  return (
    <div className="overlay-wrapper">
      <div className="menu-box">
        <h1 className="game-title">FLAPPY BIRD</h1>

        <div className="difficulty-selector">
          <span className="selector-label">DIFFICULTY</span>
          <div className="difficulty-tabs">
            {Object.values(DIFFICULTY_LEVELS).map((level) => {
              const isActive = level.id === currentDifficulty;
              return (
                <button
                  key={level.id}
                  type="button"
                  className={`tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => {
                    sound.playClick();
                    onSelectDifficulty(level.id);
                  }}
                >
                  {level.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="best-score-display">
          <span>Best Score:</span>
          <strong>{currentBest}</strong>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            sound.playClick();
            onStartGame();
          }}
        >
          START GAME
        </button>

        <div className="menu-bottom">
          <p className="controls-text">Press Space, Arrow Up, or Click to flap</p>
          <button
            type="button"
            className="btn-text-sound"
            onClick={onToggleMute}
          >
            {isMuted ? "Sound: OFF" : "Sound: ON"}
          </button>
        </div>
      </div>
    </div>
  );
}
