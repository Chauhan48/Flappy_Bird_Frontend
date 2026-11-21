export const GROUND_HEIGHT = 75;

export const BIRD_CONFIG = {
  renderWidth: 48,
  renderHeight: 34,
  hitboxRadius: 16,
  maxTiltDown: 75 * (Math.PI / 180),
  maxTiltUp: -25 * (Math.PI / 180),
};

export const DIFFICULTY_LEVELS = {
  easy: {
    id: "easy",
    name: "Easy",
    color: "#22c55e",
    gravity: 0.30,
    jumpForce: -6.8,
    pipeSpeed: 2.3,
    pipeGap: 180,
    spawnInterval: 140,
    pipeWidth: 68,
    dynamicPipes: false,
  },
  medium: {
    id: "medium",
    name: "Medium",
    color: "#eab308",
    gravity: 0.40,
    jumpForce: -8.0,
    pipeSpeed: 3.2,
    pipeGap: 145,
    spawnInterval: 110,
    pipeWidth: 70,
    dynamicPipes: false,
  },
  hard: {
    id: "hard",
    name: "Hard",
    color: "#ef4444",
    gravity: 0.48,
    jumpForce: -8.8,
    pipeSpeed: 4.0,
    pipeGap: 122,
    spawnInterval: 90,
    pipeWidth: 72,
    dynamicPipes: true,
    dynamicAmplitude: 35,
    dynamicSpeed: 0.04,
  },
};
