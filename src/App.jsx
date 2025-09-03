import { useEffect, useRef, useState } from "react";

function App() {
  const canvasRef = useRef(null);
  const birdSize = 60;
  const positionRef = useRef(200);
  const obstaclesRef = useRef([]);
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isGameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const spawnObstacle = () => {
      const gap = 180;
      const minHeight = 50;
      const maxHeight = canvas.height - gap - minHeight - 50;
      const topHeight = Math.random() * maxHeight + minHeight;

      obstaclesRef.current.push({
        x: canvas.width,
        width: 70,
        topHeight,
        bottomY: topHeight + gap,
        bottomHeight: canvas.height - (topHeight + gap),
        passed: false,
      });
    };

    const checkCollision = (obstacle) => {
      const birdX = 10;
      const birdY = positionRef.current;

      if (
        birdX < obstacle.x + obstacle.width &&
        birdX + birdSize > obstacle.x &&
        (birdY < obstacle.topHeight || birdY + birdSize > obstacle.bottomY)
      ) {
        return true;
      }

      if (birdY + birdSize > canvas.height || birdY < 0) return true;

      return false;
    };

    const gameAnimation = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.rect(10, positionRef.current, birdSize, birdSize);
      ctx.fillStyle = "blue";
      ctx.fill();

      obstaclesRef.current.forEach((obstacle) => {
        obstacle.x -= 3;

        ctx.beginPath();
        ctx.rect(obstacle.x, 0, obstacle.width, obstacle.topHeight);
        ctx.fillStyle = "red";
        ctx.fill();

        ctx.beginPath();
        ctx.rect(obstacle.x, obstacle.bottomY, obstacle.width, obstacle.bottomHeight);
        ctx.fillStyle = "red";
        ctx.fill();

        if (!obstacle.passed && obstacle.x + obstacle.width < 10) {
          obstacle.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }

        if (checkCollision(obstacle)) {
          setIsGameOver(true);
        }
      });

      obstaclesRef.current = obstaclesRef.current.filter(
        (obstacle) => obstacle.x + obstacle.width > 0
      );

      positionRef.current += 3;

      frameCountRef.current++;
      if (frameCountRef.current % 150 === 0) {
        spawnObstacle();
      }

      ctx.font = "30px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(`Score: ${scoreRef.current}`, 20, 40);

      if (!isGameOver) {
        animationFrameId = requestAnimationFrame(gameAnimation);
      }
    };

    obstaclesRef.current = [];
    positionRef.current = 200;
    frameCountRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    spawnObstacle(300);
    gameAnimation();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isGameOver]);

  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.key === "ArrowUp" && !isGameOver) {
        positionRef.current -= 80;
      }
    };

    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isGameOver]);

  const restartGame = () => {
    setIsGameOver(false);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          position: "fixed",
          top: 0,
          left: 0,
          border: "5px solid black",
        }}
      />
      {isGameOver && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px 40px",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
          }}
        >
          <h1>Game Over</h1>
          <p>Score: {score}</p>
          <button
            onClick={restartGame}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
