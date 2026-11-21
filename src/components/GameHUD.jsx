import React from "react";
import { DIFFICULTY_LEVELS } from "../utils/constants";
import { sound } from "../utils/audio";

export default function GameHUD({
  score,
  difficulty,
  onPause,
  isMuted,
  onToggleMute,
  isPlaying,
}) {
  const diff = DIFFICULTY_LEVELS[difficulty];

  return (
    <header className="game-hud">
      <div className="hud-left">
        <span className="hud-diff-tag">{diff.name}</span>
      </div>

      {isPlaying && (
        <div className="hud-center">
          <span className="live-score">{score}</span>
        </div>
      )}

      <div className="hud-right">
        <button
          type="button"
          className="hud-icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        {isPlaying && (
          <button
            type="button"
            className="hud-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onPause();
            }}
            title="Pause (P)"
          >
            ⏸
          </button>
        )}
      </div>
    </header>
  );
}
