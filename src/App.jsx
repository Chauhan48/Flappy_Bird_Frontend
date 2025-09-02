import { useEffect, useRef } from "react"

function App() {
  const canvasRef = useRef(null);
  const positionRef = useRef(10);
  const obstacleXRef = useRef(300);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gameAnimation = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Blue rectangle (bird)
      ctx.beginPath();
      ctx.rect(10, positionRef.current, 150, 100);
      ctx.fillStyle = 'blue';
      ctx.fill();

      // Red rectangle (obstacle)
      ctx.beginPath();
      ctx.rect(obstacleXRef.current, 0, 150, 200);
      ctx.fillStyle = 'red';
      ctx.fill();

      ctx.beginPath();
      ctx.rect(obstacleXRef.current, canvas.height - 200, 150, 200);
      ctx.fillStyle = 'red';
      ctx.fill();

      positionRef.current += 3;

      obstacleXRef.current -= 3;

      animationFrameId = requestAnimationFrame(gameAnimation);
    };

    gameAnimation();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.key === 'ArrowUp') {
        positionRef.current = 10;
      }
    };

    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        border: '5px solid black'
      }}
    />
  );
}

export default App;
