import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Minus, 
  Square, 
  Play, 
  Sparkles, 
  RefreshCw, 
  HardDrive, 
  CheckCircle2, 
  Terminal, 
  Activity,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Project } from '../types';

interface TkinterPreviewModalProps {
  project: Project;
  onClose: () => void;
  onLogOutput: (text: string, stream?: 'stdout' | 'stderr' | 'system') => void;
}

export const TkinterPreviewModal: React.FC<TkinterPreviewModalProps> = ({
  project,
  onClose,
  onLogOutput,
}) => {
  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState('');
  const [expression, setExpression] = useState('');

  // Cleaner utility state
  const [isScanning, setIsScanning] = useState(false);
  const [cleanedSize, setCleanedSize] = useState<string | null>(null);

  // Arcade game state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [arcadeScore, setArcadeScore] = useState(0);
  const [arcadeGameOver, setArcadeGameOver] = useState(false);

  const isCleaner = project.name.toLowerCase().includes('cleaner');
  const isArcade = project.name.toLowerCase().includes('arcade');

  // Arcade game loop
  useEffect(() => {
    if (!isArcade) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let paddleX = 180;
    const paddleWidth = 80;
    const paddleHeight = 10;
    let ballX = 220;
    let ballY = 160;
    let ballDX = 2.5;
    let ballDY = -2.5;
    const ballRadius = 6;
    let score = 0;
    let animationId: number;

    // Bricks
    const brickRows = 4;
    const brickCols = 7;
    const brickWidth = 48;
    const brickHeight = 14;
    const brickPadding = 6;
    const brickOffsetTop = 20;
    const brickOffsetLeft = 14;

    const bricks: { x: number; y: number; active: boolean; color: string }[] = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#10b981'];

    for (let r = 0; r < brickRows; r++) {
      for (let c = 0; c < brickCols; c++) {
        bricks.push({
          x: c * (brickWidth + brickPadding) + brickOffsetLeft,
          y: r * (brickHeight + brickPadding) + brickOffsetTop,
          active: true,
          color: colors[r % colors.length],
        });
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paddleX = Math.max(0, paddleX - 25);
      if (e.key === 'ArrowRight') paddleX = Math.min(canvas.width - paddleWidth, paddleX + 25);
    };
    window.addEventListener('keydown', handleKeyDown);

    const render = () => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bricks
      bricks.forEach((b) => {
        if (!b.active) return;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
      });

      // Draw paddle
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(paddleX, canvas.height - 20, paddleWidth, paddleHeight);

      // Draw ball
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ball move
      ballX += ballDX;
      ballY += ballDY;

      // Wall bounce
      if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) ballDX = -ballDX;
      if (ballY - ballRadius < 0) ballDY = -ballDY;

      // Paddle bounce
      if (
        ballY + ballRadius >= canvas.height - 20 &&
        ballX >= paddleX &&
        ballX <= paddleX + paddleWidth
      ) {
        ballDY = -Math.abs(ballDY);
      }

      // Brick collision
      bricks.forEach((b) => {
        if (!b.active) return;
        if (
          ballX >= b.x &&
          ballX <= b.x + brickWidth &&
          ballY >= b.y &&
          ballY <= b.y + brickHeight
        ) {
          b.active = false;
          ballDY = -ballDY;
          score += 10;
          setArcadeScore(score);
          onLogOutput(`[Tkinter Canvas] Brick hit! Score: ${score}`);
        }
      });

      // Bottom death
      if (ballY > canvas.height) {
        setArcadeGameOver(true);
        onLogOutput(`[Tkinter Canvas] Ball dropped. Game Over. Final Score: ${score}`);
        return;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationId);
    };
  }, [isArcade]);

  // Calculator logic
  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setExpression('');
      setCalcHistory('');
      setCalcDisplay('0');
      onLogOutput('[Tkinter] Display cleared');
    } else if (val === 'DEL') {
      const next = expression.slice(0, -1);
      setExpression(next);
      setCalcDisplay(next || '0');
    } else if (val === '=') {
      if (!expression) return;
      try {
        const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');
        const res = Function(`'use strict'; return (${sanitized})`)();
        const formatted = String(res);
        setCalcHistory(`${expression} =`);
        setCalcDisplay(formatted);
        setExpression(formatted);
        onLogOutput(`[Tkinter Event] Calculation evaluated: ${expression} -> ${formatted}`);
      } catch (e) {
        setCalcDisplay('Error');
        setExpression('');
        onLogOutput('[Tkinter Exception] SyntaxError in mathematical expression', 'stderr');
      }
    } else if (['+', '-', '×', '÷'].includes(val)) {
      if (expression && !['+', '-', '×', '÷'].includes(expression.slice(-1))) {
        setExpression(expression + val);
        setCalcDisplay(expression + val);
      }
    } else {
      const next = expression === '0' ? val : expression + val;
      setExpression(next);
      setCalcDisplay(next);
    }
  };

  // Cleaner logic
  const handleCleanerScan = () => {
    setIsScanning(true);
    onLogOutput('[Cleaner Task] Initiating disk sector scan on %LOCALAPPDATA%\\PyWStudio...');
    setTimeout(() => {
      setIsScanning(false);
      onLogOutput('[Cleaner Task] Scan finished: Found 264.4 MB reclaimable staging files.');
    }, 800);
  };

  const handleCleanerClean = () => {
    onLogOutput('[Cleaner Task] Purging staging cache directories...');
    setTimeout(() => {
      setCleanedSize('264.4 MB');
      onLogOutput('[Cleaner Task] SUCCESS: 264.4 MB reclaimed successfully.');
    }, 600);
  };

  const titleText = isArcade
    ? 'Retro 2D Arcade - Breakout (Tkinter Canvas)'
    : isCleaner
    ? 'PyW Studio - Workspace Cleaner (Tkinter)'
    : 'Modern Calculator & Unit Converter (ttk)';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Windows Tkinter Simulated Frame */}
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-lg shadow-2xl overflow-hidden w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
        {/* Windows OS Title Bar */}
        <div className="h-9 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-sky-500 flex items-center justify-center text-[9px] font-bold text-white">
              Tk
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {titleText}
            </span>
            <span className="text-[9px] px-1 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono">
              Running
            </span>
          </div>

          {/* Windows Minimize/Maximize/Close buttons */}
          <div className="flex items-center gap-2 text-slate-400">
            <button className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded">
              <Minus className="w-3 h-3" />
            </button>
            <button className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded">
              <Square className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={onClose}
              title="Close Tkinter mainloop"
              className="p-1 hover:text-white hover:bg-rose-600 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tkinter Application Content */}
        {isArcade ? (
          <div className="p-4 bg-slate-950 text-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-200">
                Score: <strong className="text-sky-400 font-mono text-sm">{arcadeScore}</strong>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Use Arrow Keys or Buttons</span>
            </div>

            <canvas
              ref={canvasRef}
              width={400}
              height={260}
              className="w-full bg-slate-900 rounded-lg border border-slate-800 shadow-inner block mx-auto"
            />

            {arcadeGameOver && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
                Game Over! Final Score: {arcadeScore}
              </div>
            )}
          </div>
        ) : isCleaner ? (
          <div className="p-5 bg-slate-900 text-slate-100 space-y-4">
            <div className="text-center">
              <h3 className="text-base font-bold text-sky-400">Cache & Workspace Cleaner</h3>
              <p className="text-xs text-slate-400 mt-1">ttk.Treeview & Multi-Threaded Process Demo</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs space-y-2">
              <div className="flex justify-between text-slate-400 font-semibold border-b border-slate-800 pb-1">
                <span>Directory</span>
                <span>Size</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>%LOCALAPPDATA%\PyWStudio\cache</span>
                <span>148 MB</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>%TEMP%\pyinstaller_staging</span>
                <span>116 MB</span>
              </div>
            </div>

            {cleanedSize && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cleaned {cleanedSize} safely!</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCleanerScan}
                disabled={isScanning}
                className="flex-1 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {isScanning ? 'Scanning...' : '🔍 Scan Caches'}
              </button>
              <button
                onClick={handleCleanerClean}
                className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                🗑️ Clean Safe Items
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-900 text-slate-100 space-y-3 font-sans">
            {/* Calculator Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-right">
              <div className="text-xs font-mono text-slate-400 h-4">{calcHistory}</div>
              <div className="text-2xl font-mono font-bold text-slate-100 tracking-wider truncate">
                {calcDisplay}
              </div>
            </div>

            {/* Calculator Keypad */}
            <div className="grid grid-cols-4 gap-1.5 text-sm font-semibold select-none">
              <button
                onClick={() => handleCalcBtn('C')}
                className="p-3 rounded bg-rose-600 hover:bg-rose-500 text-white shadow-sm cursor-pointer"
              >
                C
              </button>
              <button
                onClick={() => handleCalcBtn('DEL')}
                className="p-3 rounded bg-slate-700 hover:bg-slate-600 text-slate-100 cursor-pointer"
              >
                DEL
              </button>
              <button
                onClick={() => handleCalcBtn('%')}
                className="p-3 rounded bg-slate-700 hover:bg-slate-600 text-slate-100 cursor-pointer"
              >
                %
              </button>
              <button
                onClick={() => handleCalcBtn('÷')}
                className="p-3 rounded bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
              >
                ÷
              </button>

              <button
                onClick={() => handleCalcBtn('7')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                7
              </button>
              <button
                onClick={() => handleCalcBtn('8')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                8
              </button>
              <button
                onClick={() => handleCalcBtn('9')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                9
              </button>
              <button
                onClick={() => handleCalcBtn('×')}
                className="p-3 rounded bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
              >
                ×
              </button>

              <button
                onClick={() => handleCalcBtn('4')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                4
              </button>
              <button
                onClick={() => handleCalcBtn('5')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                5
              </button>
              <button
                onClick={() => handleCalcBtn('6')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                6
              </button>
              <button
                onClick={() => handleCalcBtn('-')}
                className="p-3 rounded bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
              >
                -
              </button>

              <button
                onClick={() => handleCalcBtn('1')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                1
              </button>
              <button
                onClick={() => handleCalcBtn('2')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                2
              </button>
              <button
                onClick={() => handleCalcBtn('3')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                3
              </button>
              <button
                onClick={() => handleCalcBtn('+')}
                className="p-3 rounded bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
              >
                +
              </button>

              <button
                onClick={() => handleCalcBtn('0')}
                className="col-span-2 p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                0
              </button>
              <button
                onClick={() => handleCalcBtn('.')}
                className="p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer"
              >
                .
              </button>
              <button
                onClick={() => handleCalcBtn('=')}
                className="p-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                =
              </button>
            </div>
          </div>
        )}

        {/* Footer simulation status */}
        <div className="h-7 bg-slate-950 border-t border-slate-800 px-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>backend: tkinter.Tk()</span>
          <span>PID: 8492</span>
        </div>
      </div>
    </div>
  );
};
