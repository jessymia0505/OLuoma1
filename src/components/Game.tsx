import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameStatus, Entity } from '../types';
import { Shield, Zap, Target, Play, Coins, Trophy, Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { sounds } from '../lib/sounds';

interface GameProps {
  onGameEnd: (distance: number, coins: number) => void;
}

export default function Game({ onGameEnd }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('verse_speedrun_highscore');
    return saved ? parseInt(saved) : 0;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  
  // Game state refs for the loop
  const gameState = useRef({
    player: { x: 0, y: 0, width: 40, height: 70, lane: 1, targetX: 0 },
    obstacles: [] as Entity[],
    coins: [] as Entity[],
    powerups: [] as Entity[],
    particles: [] as any[],
    roadOffset: 0,
    speed: 8,
    distance: 0,
    coinCount: 0,
    shieldActive: false,
    shieldTimer: 0,
    speedBoostTimer: 0,
    coinBoostTimer: 0,
    keys: {} as Record<string, boolean>,
    frameId: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    lastSpawnTime: 0,
    laneWidth: 0,
    screenShake: 0
  });

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    gameState.current.canvasWidth = canvas.width = rect.width;
    gameState.current.canvasHeight = canvas.height = rect.height;
    gameState.current.laneWidth = canvas.width / 3;
    
    gameState.current.player.lane = 1;
    gameState.current.player.x = (gameState.current.laneWidth * 1) + (gameState.current.laneWidth / 2);
    gameState.current.player.targetX = gameState.current.player.x;
    gameState.current.player.y = canvas.height - 120;
    
    gameState.current.obstacles = [];
    gameState.current.coins = [];
    gameState.current.powerups = [];
    gameState.current.particles = [];
    gameState.current.distance = 0;
    gameState.current.coinCount = 0;
    gameState.current.speed = 8;
    gameState.current.shieldActive = false;
    gameState.current.shieldTimer = 0;
    gameState.current.speedBoostTimer = 0;
    gameState.current.coinBoostTimer = 0;
    gameState.current.screenShake = 0;
    
    sounds.playStart();
    setDistance(0);
    setCoins(0);
    setStatus('playing');
  }, []);

  const spawnEntity = useCallback(() => {
    const { canvasWidth, laneWidth, speed } = gameState.current;
    const lane = Math.floor(Math.random() * 3);
    const x = (lane * laneWidth) + (laneWidth / 2);
    const y = -100;
    
    const rand = Math.random();
    if (rand < 0.7) {
      // Spawn obstacle
      gameState.current.obstacles.push({
        id: Math.random().toString(),
        x, y, width: 60, height: 60, speed,
        type: 'obstacle',
        color: '#ff0055'
      });
    } else if (rand < 0.9) {
      // Spawn coin
      gameState.current.coins.push({
        id: Math.random().toString(),
        x, y, width: 30, height: 30, speed,
        type: 'coin',
        color: '#00f2ff'
      });
    } else {
      // Spawn powerup
      const types: ('shield' | 'speed' | 'coinBoost')[] = ['shield', 'speed', 'coinBoost'];
      const pType = types[Math.floor(Math.random() * types.length)];
      gameState.current.powerups.push({
        id: Math.random().toString(),
        x, y, width: 40, height: 40, speed,
        type: 'powerup',
        powerupType: pType,
        color: pType === 'shield' ? '#bc13fe' : pType === 'speed' ? '#ffaa00' : '#00ff00'
      });
    }
  }, []);

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 12; i++) {
      gameState.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1,
        color
      });
    }
  };

  const update = () => {
    const { player, obstacles, coins, powerups, particles, keys, canvasWidth, canvasHeight, laneWidth } = gameState.current;

    // Player lane movement
    if (keys['ArrowLeft'] || keys['a']) {
      if (player.lane > 0 && !keys.prevLeft) {
        player.lane--;
        keys.prevLeft = true;
        sounds.playLaneSwitch();
      }
    } else {
      keys.prevLeft = false;
    }

    if (keys['ArrowRight'] || keys['d']) {
      if (player.lane < 2 && !keys.prevRight) {
        player.lane++;
        keys.prevRight = true;
        sounds.playLaneSwitch();
      }
    } else {
      keys.prevRight = false;
    }

    player.targetX = (player.lane * laneWidth) + (laneWidth / 2);
    player.x += (player.targetX - player.x) * 0.2;

    // Speed and Distance
    const currentSpeed = gameState.current.speedBoostTimer > 0 ? gameState.current.speed * 1.8 : gameState.current.speed;
    gameState.current.distance += currentSpeed / 60;
    setDistance(Math.floor(gameState.current.distance));
    
    // Gradually increase base speed
    gameState.current.speed += 0.001;

    // Road animation
    gameState.current.roadOffset = (gameState.current.roadOffset + currentSpeed) % 100;

    // Timers
    if (gameState.current.shieldTimer > 0) gameState.current.shieldTimer--;
    else gameState.current.shieldActive = false;
    
    if (gameState.current.speedBoostTimer > 0) gameState.current.speedBoostTimer--;
    if (gameState.current.coinBoostTimer > 0) gameState.current.coinBoostTimer--;

    // Spawning
    const now = Date.now();
    const spawnInterval = Math.max(400, 1000 - (gameState.current.speed * 20));
    if (now - gameState.current.lastSpawnTime > spawnInterval) {
      spawnEntity();
      gameState.current.lastSpawnTime = now;
    }

    // Update Entities
    const updateList = (list: Entity[], onCollision: (e: Entity) => void) => {
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].y += currentSpeed;
        
        // Collision
        const dx = list[i].x - player.x;
        const dy = list[i].y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (list[i].width + player.width) / 2.5) {
          onCollision(list[i]);
          list.splice(i, 1);
          continue;
        }

        if (list[i].y > canvasHeight + 100) list.splice(i, 1);
      }
    };

    updateList(obstacles, (obs) => {
      if (gameState.current.shieldActive) {
        gameState.current.shieldActive = false;
        gameState.current.shieldTimer = 0;
        gameState.current.screenShake = 10;
        createParticles(obs.x, obs.y, obs.color!);
        sounds.playCrash();
      } else {
        createParticles(player.x, player.y, '#bc13fe');
        gameState.current.screenShake = 20;
        sounds.playCrash();
        sounds.stopMusic();
        setStatus('lost');
        if (Math.floor(gameState.current.distance) > highScore) {
          setHighScore(Math.floor(gameState.current.distance));
          localStorage.setItem('verse_speedrun_highscore', Math.floor(gameState.current.distance).toString());
        }
        onGameEnd(Math.floor(gameState.current.distance), gameState.current.coinCount);
      }
    });

    updateList(coins, () => {
      const boost = gameState.current.coinBoostTimer > 0 ? 5 : 1;
      gameState.current.coinCount += boost;
      setCoins(gameState.current.coinCount);
      sounds.playCoin();
    });

    updateList(powerups, (p) => {
      sounds.playPowerup();
      if (p.powerupType === 'shield') {
        gameState.current.shieldActive = true;
        gameState.current.shieldTimer = 600; // 10 seconds at 60fps
      } else if (p.powerupType === 'speed') {
        gameState.current.speedBoostTimer = 300; // 5 seconds
      } else if (p.powerupType === 'coinBoost') {
        gameState.current.coinBoostTimer = 600; // 10 seconds
      }
    });

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].x += particles[i].vx;
      particles[i].y += particles[i].vy;
      particles[i].life -= 0.02;
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    if (gameState.current.screenShake > 0) {
      gameState.current.screenShake *= 0.9;
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const { player, obstacles, coins, powerups, particles, canvasWidth, canvasHeight, laneWidth, roadOffset, screenShake, shieldActive } = gameState.current;

    ctx.save();
    if (screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw Road
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Road Lines
    ctx.strokeStyle = 'rgba(188, 19, 254, 0.3)';
    ctx.setLineDash([40, 60]);
    ctx.lineDashOffset = -roadOffset;
    ctx.lineWidth = 4;
    
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * laneWidth, 0);
      ctx.lineTo(i * laneWidth, canvasHeight);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Side Glow
    const gradient = ctx.createLinearGradient(0, 0, 20, 0);
    gradient.addColorStop(0, '#bc13fe');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 10, canvasHeight);
    
    const gradientRight = ctx.createLinearGradient(canvasWidth - 20, 0, canvasWidth, 0);
    gradientRight.addColorStop(0, 'transparent');
    gradientRight.addColorStop(1, '#bc13fe');
    ctx.fillStyle = gradientRight;
    ctx.fillRect(canvasWidth - 10, 0, 10, canvasHeight);

    // Draw Coins
    coins.forEach(c => {
      ctx.fillStyle = '#00f2ff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2ff';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Powerups
    powerups.forEach(p => {
      ctx.fillStyle = p.color!;
      ctx.shadowBlur = 20;
      ctx.shadowColor = p.color!;
      ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
      ctx.shadowBlur = 0;
    });

    // Draw Obstacles
    obstacles.forEach(o => {
      ctx.fillStyle = '#ff0055';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0055';
      ctx.fillRect(o.x - o.width / 2, o.y - o.height / 2, o.width, o.height);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(o.x - o.width / 2 + 5, o.y - o.height / 2 + 5, o.width - 10, o.height - 10);
      ctx.shadowBlur = 0;
    });

    // Draw Player
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // Shield Glow
    if (shieldActive) {
      ctx.strokeStyle = '#bc13fe';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#bc13fe';
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Car Body
    ctx.fillStyle = '#bc13fe';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#bc13fe';
    ctx.beginPath();
    ctx.roundRect(-player.width / 2, -player.height / 2, player.width, player.height, 10);
    ctx.fill();
    
    // Windshield
    ctx.fillStyle = 'rgba(0, 242, 255, 0.6)';
    ctx.fillRect(-player.width / 2 + 5, -player.height / 2 + 10, player.width - 10, 20);
    
    // Tail lights
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(-player.width / 2 + 5, player.height / 2 - 5, 10, 5);
    ctx.fillRect(player.width / 2 - 15, player.height / 2 - 5, 10, 5);
    
    ctx.restore();

    // Particles
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1;

    ctx.restore();
  };

  const loop = () => {
    if (status !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update();
    draw(ctx);
    gameState.current.frameId = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (status === 'playing') {
      gameState.current.frameId = requestAnimationFrame(loop);
    } else {
      sounds.stopMusic();
    }
    return () => {
      cancelAnimationFrame(gameState.current.frameId);
      sounds.stopMusic();
    };
  }, [status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => gameState.current.keys[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => gameState.current.keys[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Swipe/Touch controls
  const touchStart = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchEnd - touchStart.current;
    if (Math.abs(diff) > 30) {
      if (diff > 0 && gameState.current.player.lane < 2) {
        gameState.current.player.lane++;
        sounds.playLaneSwitch();
      }
      else if (diff < 0 && gameState.current.player.lane > 0) {
        gameState.current.player.lane--;
        sounds.playLaneSwitch();
      }
    }
  };

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const toggleMusic = () => {
    const muted = sounds.toggleMusicMute();
    setIsMusicMuted(muted);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center">
      {/* HUD */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass p-4 rounded-2xl flex items-center gap-3">
          <Target className="text-cyber-blue" />
          <div>
            <p className="text-[10px] text-white/50 uppercase">Distance</p>
            <p className="font-display font-bold text-xl">{distance}m</p>
          </div>
        </div>
        <div className="glass p-4 rounded-2xl flex items-center gap-3">
          <Coins className="text-yellow-400" />
          <div>
            <p className="text-[10px] text-white/50 uppercase">Coins</p>
            <p className="font-display font-bold text-xl">{coins}</p>
          </div>
        </div>
        <div className="glass p-4 rounded-2xl flex items-center gap-3">
          <Trophy className="text-cyber-purple" />
          <div>
            <p className="text-[10px] text-white/50 uppercase">Best</p>
            <p className="font-display font-bold text-xl">{highScore}m</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleMute}
            title="Toggle Sound Effects"
            className="flex-1 glass p-4 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {isMuted ? <VolumeX className="text-red-500" /> : <Volume2 className="text-cyber-blue" />}
          </button>
          <button 
            onClick={toggleMusic}
            title="Toggle Music"
            className="flex-1 glass p-4 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {isMusicMuted ? <Music className="text-red-500 opacity-50" /> : <Music2 className="text-cyber-purple" />}
          </button>
        </div>
      </div>

      {/* Game Canvas */}
      <div 
        className="relative w-full aspect-[4/5] md:aspect-[16/9] glass rounded-3xl overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
        />

        <AnimatePresence>
          {status === 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20"
            >
              <div className="text-center p-8">
                <Zap className="w-16 h-16 text-cyber-purple mx-auto mb-6 animate-pulse" />
                <h2 className="text-4xl font-display font-black mb-4">VERSE SPEED RUN</h2>
                <p className="text-white/60 mb-8 max-w-xs mx-auto">
                  Switch lanes to avoid obstacles. Collect coins and powerups to survive.
                </p>
                <button
                  onClick={initGame}
                  className="px-12 py-4 bg-cyber-purple text-white font-display font-bold rounded-full neon-border-purple flex items-center gap-2 mx-auto"
                >
                  <Play className="w-5 h-5 fill-current" />
                  START RACE
                </button>
              </div>
            </motion.div>
          )}

          {status === 'lost' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-20"
            >
              <div className="text-center p-8">
                <h2 className="text-5xl font-display font-black text-red-500 mb-2">CRASHED</h2>
                <p className="text-white/40 mb-8">Your neural link has been severed.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="glass p-4 rounded-2xl">
                    <p className="text-xs text-white/50 uppercase mb-1">Distance</p>
                    <p className="text-2xl font-display font-black text-cyber-blue">{distance}m</p>
                  </div>
                  <div className="glass p-4 rounded-2xl">
                    <p className="text-xs text-white/50 uppercase mb-1">Coins</p>
                    <p className="text-2xl font-display font-black text-yellow-400">{coins}</p>
                  </div>
                </div>
                <button
                  onClick={initGame}
                  className="px-12 py-4 bg-white text-black font-display font-bold rounded-full flex items-center gap-2 mx-auto"
                >
                  RETRY RACE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Powerups */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
          {gameState.current.shieldTimer > 0 && (
            <div className="px-3 py-1 bg-cyber-purple/80 rounded-full text-[10px] font-bold flex items-center gap-2">
              <Shield className="w-3 h-3" /> SHIELD
            </div>
          )}
          {gameState.current.speedBoostTimer > 0 && (
            <div className="px-3 py-1 bg-orange-500/80 rounded-full text-[10px] font-bold flex items-center gap-2">
              <Zap className="w-3 h-3" /> BOOST
            </div>
          )}
          {gameState.current.coinBoostTimer > 0 && (
            <div className="px-3 py-1 bg-green-500/80 rounded-full text-[10px] font-bold flex items-center gap-2">
              <Coins className="w-3 h-3" /> 5X COINS
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-8 text-white/30 text-xs uppercase tracking-widest font-bold">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyber-purple rounded-full" />
          <span>A/D or Arrows to Move</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full" />
          <span>Swipe on Mobile</span>
        </div>
      </div>
    </div>
  );
}
