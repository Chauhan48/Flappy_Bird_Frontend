import { useEffect, useRef, useState, useCallback } from "react";
import "./App.css";
import {
  GROUND_HEIGHT,
  BIRD_CONFIG,
  DIFFICULTY_LEVELS,
} from "./utils/constants";
import { sound } from "./utils/audio";
import StartMenu from "./components/StartMenu";
import GameOverModal from "./components/GameOverModal";
import PauseMenu from "./components/PauseMenu";
import GameHUD from "./components/GameHUD";

const HIGH_SCORES_KEY = "flappy_high_scores_clean";
const DIFFICULTY_KEY = "flappy_difficulty_clean";

export default function App() {
  const canvasRef = useRef(null);

  // Game States: 'MENU' | 'GET_READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
  const [gameState, setGameState] = useState("MENU");
  const [difficulty, setDifficulty] = useState(() => {
    try {
      const saved = localStorage.getItem(DIFFICULTY_KEY);
      return saved && DIFFICULTY_LEVELS[saved] ? saved : "medium";
    } catch {
      return "medium";
    }
  });

  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORES_KEY);
      return saved ? JSON.parse(saved) : { easy: 0, medium: 0, hard: 0 };
    } catch {
      return { easy: 0, medium: 0, hard: 0 };
    }
  });

  const [isNewHigh, setIsNewHigh] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());

  // Game physics refs
  const birdYRef = useRef(200);
  const birdVelocityRef = useRef(0);
  const birdRotationRef = useRef(0);
  const obstaclesRef = useRef([]);
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const groundOffsetRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Bird Image sprite
  const birdImageRef = useRef(null);
  const birdImageLoadedRef = useRef(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/Flappy-Bird-PNG.png";
    img.onload = () => {
      birdImageRef.current = img;
      birdImageLoadedRef.current = true;
    };
  }, []);

  const handleSelectDifficulty = (levelId) => {
    setDifficulty(levelId);
    try {
      localStorage.setItem(DIFFICULTY_KEY, levelId);
    } catch {
      // Ignore
    }
  };

  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const updateHighScore = useCallback(
    (newScore) => {
      const currentBest = highScores[difficulty] || 0;
      if (newScore > currentBest) {
        const updated = { ...highScores, [difficulty]: newScore };
        setHighScores(updated);
        setIsNewHigh(true);
        sound.playHighScore();
        try {
          localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
      } else {
        setIsNewHigh(false);
      }
    },
    [difficulty, highScores]
  );

  const triggerFlap = useCallback(() => {
    const diff = DIFFICULTY_LEVELS[difficulty];
    birdVelocityRef.current = diff.jumpForce;
    sound.playJump();
  }, [difficulty]);

  const triggerGameOver = useCallback(() => {
    setGameState("GAME_OVER");
    sound.playHit();

    setTimeout(() => {
      sound.playDie();
    }, 150);

    updateHighScore(scoreRef.current);
  }, [updateHighScore]);

  const startGetReady = useCallback(() => {
    const canvas = canvasRef.current;
    const initialY = canvas
      ? (canvas.height - GROUND_HEIGHT) * 0.4
      : 250;

    birdYRef.current = initialY;
    birdVelocityRef.current = 0;
    birdRotationRef.current = 0;
    obstaclesRef.current = [];
    frameCountRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setIsNewHigh(false);
    setGameState("GET_READY");
  }, []);

  const startPlaying = useCallback(() => {
    setGameState("PLAYING");
    triggerFlap();
  }, [triggerFlap]);

  // Circle to rectangle collision detection
  const checkCircleRectCollision = (cx, cy, radius, rx, ry, rw, rh) => {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));

    const distanceX = cx - closestX;
    const distanceY = cy - closestY;

    return distanceX * distanceX + distanceY * distanceY < radius * radius;
  };

  const spawnObstacle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const diff = DIFFICULTY_LEVELS[difficulty];
    const playableH = canvas.height - GROUND_HEIGHT;
    const gap = diff.pipeGap;
    const minHeight = 60;
    const maxHeight = Math.max(minHeight + 40, playableH - gap - minHeight);
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

    obstaclesRef.current.push({
      x: canvas.width + 10,
      width: diff.pipeWidth,
      topHeight,
      bottomY: topHeight + gap,
      bottomHeight: playableH - (topHeight + gap),
      passed: false,
      phase: Math.random() * Math.PI * 2,
      dynamicSpeed: diff.dynamicSpeed || 0.04,
      dynamicAmp: diff.dynamicAmplitude || 35,
      yOffset: 0,
    });
  }, [difficulty]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const diff = DIFFICULTY_LEVELS[difficulty];

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const birdX = Math.min(120, Math.max(60, width * 0.18));

      // 1. Clean Flappy Sky Background
      ctx.fillStyle = "#4ec0ca";
      ctx.fillRect(0, 0, width, height);

      // 2. Obstacles
      if (gameState === "PLAYING") {
        frameCountRef.current++;
        if (frameCountRef.current % diff.spawnInterval === 0) {
          spawnObstacle();
        }
      }

      obstaclesRef.current.forEach((obstacle) => {
        if (gameState === "PLAYING") {
          obstacle.x -= diff.pipeSpeed;

          if (diff.dynamicPipes) {
            obstacle.phase += obstacle.dynamicSpeed;
            obstacle.yOffset = Math.sin(obstacle.phase) * obstacle.dynamicAmp;
          }
        }

        const topH = obstacle.topHeight + obstacle.yOffset;
        const botY = obstacle.bottomY + obstacle.yOffset;
        const botH = height - GROUND_HEIGHT - botY;

        // Draw upper and lower pipes
        drawPipe(ctx, obstacle.x, 0, obstacle.width, topH, true);
        drawPipe(ctx, obstacle.x, botY, obstacle.width, botH, false);

        // Check Collisions
        if (gameState === "PLAYING") {
          const birdRadius = BIRD_CONFIG.hitboxRadius;
          const birdY = birdYRef.current;

          const hitTop = checkCircleRectCollision(
            birdX,
            birdY,
            birdRadius,
            obstacle.x,
            0,
            obstacle.width,
            topH
          );

          const hitBottom = checkCircleRectCollision(
            birdX,
            birdY,
            birdRadius,
            obstacle.x,
            botY,
            obstacle.width,
            botH
          );

          if (hitTop || hitBottom) {
            triggerGameOver();
          }

          if (!obstacle.passed && obstacle.x + obstacle.width < birdX) {
            obstacle.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
            sound.playScore();
          }
        }
      });

      // Filter off-screen obstacles
      obstaclesRef.current = obstaclesRef.current.filter(
        (obs) => obs.x + obs.width > -30
      );

      // 3. Ground
      if (gameState === "PLAYING" || gameState === "GET_READY") {
        groundOffsetRef.current = (groundOffsetRef.current + diff.pipeSpeed) % 20;
      }
      drawGround(ctx, width, height, groundOffsetRef.current);

      // 4. Bird Physics & State
      if (gameState === "PLAYING") {
        birdVelocityRef.current += diff.gravity;
        birdYRef.current += birdVelocityRef.current;

        // Ceiling clamp
        if (birdYRef.current < BIRD_CONFIG.hitboxRadius) {
          birdYRef.current = BIRD_CONFIG.hitboxRadius;
          birdVelocityRef.current = 0;
        }

        // Ground collision
        const groundY = height - GROUND_HEIGHT - BIRD_CONFIG.hitboxRadius + 4;
        if (birdYRef.current >= groundY) {
          birdYRef.current = groundY;
          triggerGameOver();
        }

        // Smooth rotation
        if (birdVelocityRef.current < 0) {
          birdRotationRef.current = Math.max(
            BIRD_CONFIG.maxTiltUp,
            birdRotationRef.current - 0.12
          );
        } else {
          birdRotationRef.current = Math.min(
            BIRD_CONFIG.maxTiltDown,
            birdRotationRef.current + 0.05
          );
        }
      } else if (gameState === "GET_READY" || gameState === "MENU") {
        const baseY = (height - GROUND_HEIGHT) * 0.42;
        birdYRef.current = baseY + Math.sin(Date.now() / 240) * 8;
        birdRotationRef.current = Math.sin(Date.now() / 320) * 0.06;
      }

      // 5. Draw Bird
      drawBird(
        ctx,
        birdX,
        birdYRef.current,
        birdRotationRef.current,
        birdImageLoadedRef.current ? birdImageRef.current : null
      );

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gameState, difficulty, spawnObstacle, triggerGameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;

      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (gameState === "MENU") {
          sound.playClick();
          startGetReady();
        } else if (gameState === "GET_READY") {
          startPlaying();
        } else if (gameState === "PLAYING") {
          triggerFlap();
        } else if (gameState === "GAME_OVER") {
          sound.playClick();
          startGetReady();
        }
      } else if (e.code === "KeyP" || e.code === "Escape") {
        if (gameState === "PLAYING") {
          setGameState("PAUSED");
        } else if (gameState === "PAUSED") {
          setGameState("PLAYING");
        }
      } else if (e.code === "Enter") {
        if (gameState === "GAME_OVER" || gameState === "MENU") {
          sound.playClick();
          startGetReady();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, startGetReady, startPlaying, triggerFlap]);

  const handleUserTap = () => {
    if (gameState === "MENU") {
      sound.playClick();
      startGetReady();
    } else if (gameState === "GET_READY") {
      startPlaying();
    } else if (gameState === "PLAYING") {
      triggerFlap();
    }
  };

  return (
    <div className="fullscreen-container">
      <canvas
        ref={canvasRef}
        className="fullscreen-canvas"
        onClick={handleUserTap}
        onTouchStart={(e) => {
          e.preventDefault();
          handleUserTap();
        }}
      />

      {/* In-Game HUD */}
      {(gameState === "PLAYING" ||
        gameState === "GET_READY" ||
        gameState === "PAUSED") && (
        <GameHUD
          score={score}
          difficulty={difficulty}
          onPause={() => setGameState("PAUSED")}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isPlaying={gameState === "PLAYING"}
        />
      )}

      {/* Simple Get Ready prompt */}
      {gameState === "GET_READY" && (
        <div className="get-ready-message">
          <p className="ready-title">GET READY</p>
          <p className="ready-subtitle">Press Space or Tap to Fly</p>
        </div>
      )}

      {/* Clean Main Menu */}
      {gameState === "MENU" && (
        <StartMenu
          currentDifficulty={difficulty}
          onSelectDifficulty={handleSelectDifficulty}
          onStartGame={startGetReady}
          highScores={highScores}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Simple Pause Menu */}
      {gameState === "PAUSED" && (
        <PauseMenu
          onResume={() => setGameState("PLAYING")}
          onRestart={startGetReady}
          onChangeDifficulty={() => setGameState("MENU")}
        />
      )}

      {/* Simple Game Over Modal */}
      {gameState === "GAME_OVER" && (
        <GameOverModal
          score={score}
          difficulty={difficulty}
          highScore={highScores[difficulty] || 0}
          isNewHigh={isNewHigh}
          onRestart={startGetReady}
          onChangeDifficulty={() => setGameState("MENU")}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------
// Clean, Classic Flappy Bird Drawing Functions
// ---------------------------------------------------------

function drawPipe(ctx, x, y, width, height, isTop) {
  if (height <= 0) return;

  const rimHeight = 24;
  const rimOverhang = 3;
  const rimWidth = width + rimOverhang * 2;
  const rimX = x - rimOverhang;

  // Classic pipe green
  ctx.fillStyle = "#73bf2e";
  ctx.strokeStyle = "#1e3b09";
  ctx.lineWidth = 2.5;

  if (isTop) {
    const stemH = Math.max(0, height - rimHeight);
    // Stem
    ctx.fillRect(x, 0, width, stemH);
    ctx.strokeRect(x, -2, width, stemH + 2);

    // Rim at bottom of top pipe
    const rimY = height - rimHeight;
    ctx.fillRect(rimX, rimY, rimWidth, rimHeight);
    ctx.strokeRect(rimX, rimY, rimWidth, rimHeight);

    // Subtle highlight on stem and rim
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(x + 5, 0, 7, stemH);
    ctx.fillRect(rimX + 5, rimY, 7, rimHeight);
  } else {
    // Rim at top of bottom pipe
    ctx.fillRect(rimX, y, rimWidth, rimHeight);
    ctx.strokeRect(rimX, y, rimWidth, rimHeight);

    // Stem
    const stemY = y + rimHeight;
    const stemH = Math.max(0, height - rimHeight);
    ctx.fillRect(x, stemY, width, stemH);
    ctx.strokeRect(x, stemY, width, stemH + 2);

    // Subtle highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(rimX + 5, y, 7, rimHeight);
    ctx.fillRect(x + 5, stemY, 7, stemH);
  }
}

function drawGround(ctx, width, height, offset) {
  const groundY = height - GROUND_HEIGHT;

  // Tan ground base
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, groundY, width, GROUND_HEIGHT);

  // Green top grass bar
  ctx.fillStyle = "#73bf2e";
  ctx.fillRect(0, groundY, width, 12);

  // Border line between grass and ground
  ctx.strokeStyle = "#53a81a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 12);
  ctx.lineTo(width, groundY + 12);
  ctx.stroke();

  // Scrolling ground stripes
  ctx.strokeStyle = "#cbbf75";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = -20; x < width + 20; x += 16) {
    const startX = x - offset;
    ctx.moveTo(startX, groundY + 15);
    ctx.lineTo(startX - 8, groundY + GROUND_HEIGHT);
  }
  ctx.stroke();

  // Ground top border
  ctx.strokeStyle = "#38290f";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();
}

function drawBird(ctx, x, y, rotation, image) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (image) {
    const rw = BIRD_CONFIG.renderWidth;
    const rh = BIRD_CONFIG.renderHeight;
    ctx.drawImage(image, -rw / 2, -rh / 2, rw, rh);
  } else {
    // Clean vector flappy bird
    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = "#854d0e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(6, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupil
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(8, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#f97316";
    ctx.strokeStyle = "#9a3412";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.lineTo(19, 2);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wing
    ctx.fillStyle = "#fef08a";
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-6, 1, 8, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
