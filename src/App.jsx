import { useEffect, useRef } from "react"

function App() {

  const canvasRef = useRef(null);
  async function canva() {
    let canvas = canvasRef.current;
    let ctx = canvas.getContext('2d');

    for(let i=0; i<1000; i++){
      ctx.clearRect(0,0,1600,900)
      ctx.beginPath();
      ctx.rect(10, i, 150, 100);
      ctx.fillStyle = 'blue'
      ctx.fill();
      await new Promise((resolve) => setTimeout(resolve, 3));

    }
  }

  useEffect(() => {
    canva()
  }, [])

  return (
    <>
      <canvas ref={canvasRef} height={600} width={600} style={{border: '1px solid black', height: '60vh'}} ></canvas>
    </>
  )
}

export default App
