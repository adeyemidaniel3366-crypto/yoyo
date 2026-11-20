"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Terminal,
  Activity,
  Play,
  RotateCcw,
  Sliders,
  Send,
  Zap,
} from "lucide-react";

export function SceneExperimentsLab() {
  const [activeLab, setActiveLab] = useState<"GENERATIVE_CANVAS" | "HARMONIC_SYNTH" | "TERMINAL_SHELL">("GENERATIVE_CANVAS");

  // --- 1. Generative Canvas State ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; life: number }>>([]);

  useEffect(() => {
    if (activeLab !== "GENERATIVE_CANVAS") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const colors = ["#00CEC8", "#FF9C5F", "#EB4203"];

    const render = () => {
      ctx.fillStyle = "rgba(252, 239, 195, 0.25)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = "#12110E";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeLab]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colors = ["#00CEC8", "#FF9C5F", "#EB4203"];
    for (let i = 0; i < 3; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
    }
  };

  // --- 2. Harmonic Wave Synth State ---
  const [frequency, setFrequency] = useState(3);
  const [amplitude, setAmplitude] = useState(25);
  const synthCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeLab !== "HARMONIC_SYNTH") return;
    const canvas = synthCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let step = 0;
    let animId: number;

    const render = () => {
      ctx.fillStyle = "#FFF8DC";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(18, 17, 14, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Primary Turquoise Wave
      ctx.beginPath();
      ctx.strokeStyle = "#00CEC8";
      ctx.lineWidth = 4;
      for (let x = 0; x < canvas.width; x++) {
        const y =
          canvas.height / 2 +
          Math.sin((x * frequency) / 50 + step) * amplitude +
          Math.cos((x * 2) / 50 + step) * (amplitude * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary Peach Harmonic
      ctx.beginPath();
      ctx.strokeStyle = "#FF9C5F";
      ctx.lineWidth = 2.5;
      for (let x = 0; x < canvas.width; x++) {
        const y =
          canvas.height / 2 +
          Math.cos((x * frequency * 1.5) / 50 - step) * (amplitude * 0.7);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      step += 0.04;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeLab, frequency, amplitude]);

  // --- 3. Terminal Shell State ---
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; output: string }>>([
    { cmd: "scene status", output: "zino one Core 2026 // Lagos Hub // Status: Optimal // 162 routes operational" },
  ]);
  const [terminalInput, setTerminalInput] = useState("");

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = terminalInput.trim().toLowerCase();
    if (!raw) return;

    let out = "";
    if (raw === "help") {
      out = "Available commands: 'projects', 'spaces', 'status', 'goto shop', 'goto admin', 'clear', 'about'";
    } else if (raw === "projects") {
      out = "Active Systems: Zino One (/admin), Device Galaxy (/shop), Zino Apartments (/apartments), Top Builders (/builders), Billstacks (/billstacks), Visitors (/visit)";
    } else if (raw === "spaces") {
      out = "Spaces: 01. About, 02. Projects, 03. Experiments Lab, 04. Internet Portals, 05. Archive";
    } else if (raw === "status") {
      out = "Architecture: Next.js 14 App Router // Full TypeScript // Zero Errors // Multi-Tenant State Synced";
    } else if (raw === "about") {
      out = "Zino company // Creative Technologist & Systems Architect // Lagos, Nigeria";
    } else if (raw === "clear") {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else if (raw.startsWith("goto ")) {
      const dest = raw.replace("goto ", "");
      out = `Routing to /${dest}...`;
      window.location.href = `/${dest}`;
    } else {
      out = `Command '${raw}' not recognized. Type 'help' for commands.`;
    }

    setTerminalHistory((prev) => [...prev, { cmd: terminalInput, output: out }]);
    setTerminalInput("");
  };

  return (
    <div className="rounded-3xl border-2 border-[#12110E] bg-[#FFF8DC] p-6 shadow-[8px_8px_0px_#12110E] space-y-6">
      {/* Lab Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#12110E] pb-4">
        <div>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#EB4203]">
            // SPACE 03 INTERACTIVE PLAYGROUND
          </span>
          <h3 className="text-xl font-mono font-black text-[#12110E]">
            Digital Lab &amp; Prototyping Sandbox
          </h3>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl border-2 border-[#12110E] bg-[#FCEFC3]">
          <button
            type="button"
            onClick={() => setActiveLab("GENERATIVE_CANVAS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeLab === "GENERATIVE_CANVAS"
                ? "bg-[#00CEC8] text-[#12110E] shadow-[2px_2px_0px_#12110E]"
                : "text-[#12110E]/70 hover:text-[#12110E]"
            }`}
          >
            Kinetic Canvas
          </button>
          <button
            type="button"
            onClick={() => setActiveLab("HARMONIC_SYNTH")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeLab === "HARMONIC_SYNTH"
                ? "bg-[#FF9C5F] text-[#12110E] shadow-[2px_2px_0px_#12110E]"
                : "text-[#12110E]/70 hover:text-[#12110E]"
            }`}
          >
            Wave Synthesizer
          </button>
          <button
            type="button"
            onClick={() => setActiveLab("TERMINAL_SHELL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeLab === "TERMINAL_SHELL"
                ? "bg-[#EB4203] text-white shadow-[2px_2px_0px_#12110E]"
                : "text-[#12110E]/70 hover:text-[#12110E]"
            }`}
          >
            Terminal Shell
          </button>
        </div>
      </div>

      {/* Lab 1: Generative Canvas */}
      {activeLab === "GENERATIVE_CANVAS" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#12110E]/80">
            <span>Hover or drag your cursor across the canvas to emit kinetic particle physics:</span>
            <span className="font-bold text-[#00CEC8]">CANVAS READY</span>
          </div>

          <div className="rounded-2xl border-2 border-[#12110E] bg-[#FCEFC3] overflow-hidden shadow-[4px_4px_0px_#12110E]">
            <canvas
              ref={canvasRef}
              width={800}
              height={320}
              onMouseMove={handleCanvasMouseMove}
              className="w-full h-72 cursor-crosshair block"
            />
          </div>
        </div>
      )}

      {/* Lab 2: Harmonic Wave Synthesizer */}
      {activeLab === "HARMONIC_SYNTH" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl border border-[#12110E] bg-[#FCEFC3] space-y-1">
              <label className="text-xs font-mono font-bold text-[#12110E] flex justify-between">
                <span>Oscillation Frequency</span>
                <span className="text-[#00CEC8]">{frequency} Hz</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-[#00CEC8]"
              />
            </div>

            <div className="p-3 rounded-xl border border-[#12110E] bg-[#FCEFC3] space-y-1">
              <label className="text-xs font-mono font-bold text-[#12110E] flex justify-between">
                <span>Waveform Amplitude</span>
                <span className="text-[#FF9C5F]">{amplitude} px</span>
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={amplitude}
                onChange={(e) => setAmplitude(Number(e.target.value))}
                className="w-full accent-[#FF9C5F]"
              />
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#12110E] bg-[#FFF8DC] overflow-hidden shadow-[4px_4px_0px_#12110E]">
            <canvas
              ref={synthCanvasRef}
              width={800}
              height={260}
              className="w-full h-64 block"
            />
          </div>
        </div>
      )}

      {/* Lab 3: Terminal Shell */}
      {activeLab === "TERMINAL_SHELL" && (
        <div className="rounded-2xl border-2 border-[#12110E] bg-[#12110E] text-[#FCEFC3] p-5 font-mono text-xs shadow-[4px_4px_0px_#EB4203] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#FCEFC3]/20 text-[11px] text-[#00CEC8]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EB4203]" />
              <span>SCENE_ONE_SHELL // v2.4</span>
            </div>
            <span>Type 'help' for commands</span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 pr-2">
            {terminalHistory.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <p className="text-[#FF9C5F] font-bold">
                  $ scene-one &gt; {item.cmd}
                </p>
                <p className="text-[#FCEFC3]/90 pl-3 leading-relaxed">{item.output}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleTerminalSubmit} className="pt-2 border-t border-[#FCEFC3]/20 flex items-center gap-2">
            <span className="text-[#00CEC8] font-bold">$</span>
            <input
              type="text"
              placeholder="Enter command (e.g. 'help', 'projects', 'status', 'goto shop')..."
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              className="flex-1 bg-transparent text-[#FCEFC3] focus:outline-none placeholder:text-[#FCEFC3]/40"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded bg-[#EB4203] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#EB4203]/90"
            >
              Run
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
