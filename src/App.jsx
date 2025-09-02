import { useEffect, useRef } from "react";

function App() {
  const canvasRef = useRef(null);
  const birdSize = 100;
  const positionRef = useRef(10);
  const obstaclesRef = useRef([]);
  const frameCountRef = useRef(0);

  useEffect(() => {
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
      const gap = 200;
      const minHeight = 50;
      const maxHeight = canvas.height - gap - minHeight;
      const topHeight = Math.random() * maxHeight + minHeight;

      obstaclesRef.current.push({
        x: canvas.width,
        width: birdSize,
        topHeight,
        bottomY: topHeight + gap,
        bottomHeight: canvas.height - (topHeight + gap),
      });
    };

    const gameAnimation = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bird
      ctx.beginPath();
      ctx.rect(10, positionRef.current, birdSize, birdSize);
      ctx.fillStyle = "blue";
      ctx.fill();

      // Update and draw obstacles
      obstaclesRef.current.forEach((obstacle) => {
        obstacle.x -= 3;

        // Top pipe
        ctx.beginPath();
        ctx.rect(obstacle.x, 0, obstacle.width, obstacle.topHeight);
        ctx.fillStyle = "red";
        ctx.fill();

        // Bottom pipe
        ctx.beginPath();
        ctx.rect(obstacle.x, obstacle.bottomY, obstacle.width, obstacle.bottomHeight);
        ctx.fillStyle = "red";
        ctx.fill();
      });

      // Remove off-screen obstacles
      obstaclesRef.current = obstaclesRef.current.filter(
        (obstacle) => obstacle.x + obstacle.width > 0
      );

      // Move bird down
      positionRef.current += 3;

      // Spawn new obstacles every 150 frames (~2.5 seconds at 60fps)
      frameCountRef.current++;
      if (frameCountRef.current % 150 === 0) {
        spawnObstacle();
      }

      animationFrameId = requestAnimationFrame(gameAnimation);
    };

    // Start with one obstacle
    spawnObstacle();
    gameAnimation();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.key === "ArrowUp") {
        positionRef.current -= 100; // Move bird up
      }
    };

    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
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
  );
}

export default App;
