'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Droplets, 
  Flame, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Wifi, 
  Sparkles, 
  Gauge, 
  ArrowUpRight,
  Radio
} from 'lucide-react';

interface TumblerStatus {
  device_id: string;
  bottle_volume_ml: number;
  bottle_percent: number;
  current_water_ml: number;
  target_water_ml: number;
  goal_percent: number;
  gender: string;
  weight_kg: number;
  env_condition: string;
  act_level: string;
  timer_interval: number;
  is_locked: boolean;
  updated_at: string;
}

export default function Dashboard() {
  const [data, setData] = useState<TumblerStatus | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data: status, error } = await supabase
          .from('tumbler_status')
          .select('*')
          .eq('device_id', 'SD MUH SAPEN')
          .maybeSingle();

        if (error) console.warn('Supabase handshake notice:', error.message);

        if (status) {
          setData(status);
          setIsLive(true);
        } else {
          // Robust Fallback Mockup
          setData({
            device_id: 'SD MUH SAPEN',
            bottle_volume_ml: 650,
            bottle_percent: 79,
            current_water_ml: 1250,
            target_water_ml: 2350,
            goal_percent: 53,
            gender: 'Male',
            weight_kg: 60,
            env_condition: 'Heatwave (El Nino)',
            act_level: 'Light Exercise',
            timer_interval: 1,
            is_locked: false,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Network degraded, rendering local telemetry frame:', err);
      }
    };

    fetchStatus();

    // Supabase Live Sync Subscriber
    const channel = supabase
      .channel('realtime_tumbler')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tumbler_status' },
        (payload) => {
          if (payload.new) {
            setData(payload.new as TumblerStatus);
            setIsLive(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] text-cyan-400 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-blue-500 animate-ping opacity-30"></div>
        </div>
        <p className="text-slate-400 text-xs tracking-widest font-mono uppercase">Initializing Telemetry Stream...</p>
      </div>
    );
  }

  // Clamped values for visual components
  const clampedGoal = Math.min(Math.max(data.goal_percent, 0), 100);
  const clampedBottle = Math.min(Math.max(data.bottle_percent, 0), 100);

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.08),rgba(255,255,255,0))]"></div>

      {/* TOP APPARATUS BAR */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]"></span>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              HYDRO HERO <span className="text-cyan-400 text-base font-medium">TUMBLER</span>
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              ID: {data.device_id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">
            Development and Evaluation of an Adaptive Hydration Reminder System to Promote Healthy Drinking Habits 
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-slate-300">{isLive ? 'ONLINE / STREAMING' : 'OFFLINE CACHED'}</span>
          </div>

          <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 text-xs font-mono font-medium ${
            data.is_locked 
              ? 'bg-amber-950/40 border-amber-600/70 text-amber-300' 
              : 'bg-cyan-950/40 border-cyan-700/60 text-cyan-300'
          }`}>
            {data.is_locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
            {data.is_locked ? 'INTAKE SESSION LOCKED' : 'STANDBY MONITORING'}
          </div>
        </div>
      </div>

      {/* PRIMARY INSTRUMENT GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
        
        {/* PANEL 1: WATER DROPLET GOAL FILL ILLUSTRATION (Goal Target) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0c1322] to-[#080d19] border border-slate-800/90 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                <Droplets className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">Daily Hydration Target</h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
              Target: {data.target_water_ml} ml
            </span>
          </div>

          {/* Large Droplet Graphic */}
          <div className="my-6 relative flex flex-col items-center justify-center">
            {/* SVG Masked Water Drop */}
            <div className="relative w-52 h-64 flex items-center justify-center drop-shadow-[0_15px_30px_rgba(6,182,212,0.2)]">
              <svg viewBox="0 0 100 120" className="w-full h-full">
                <defs>
                  {/* Clip Path shaped exactly as a sleek water tear */}
                  <clipPath id="dropletClip">
                    <path d="M50 0 C50 0, 95 62, 95 87 C95 105.2, 74.8 120, 50 120 C25.2 120, 5 105.2, 5 87 C5 62, 50 0, 50 0 Z" />
                  </clipPath>
                  
                  {/* Liquid Gradient */}
                  <linearGradient id="liquidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>

                {/* Droplet Outline Base (Empty) */}
                <path 
                  d="M50 0 C50 0, 95 62, 95 87 C95 105.2, 74.8 120, 50 120 C25.2 120, 5 105.2, 5 87 C5 62, 50 0, 50 0 Z" 
                  fill="#0f172a" 
                  stroke="#1e293b" 
                  strokeWidth="2.5"
                />

                {/* Liquid Fill masked inside the droplet */}
                <g clipPath="url(#dropletClip)">
                  <rect 
                    x="0" 
                    y={`${120 - (clampedGoal * 1.2)}`} 
                    width="100" 
                    height="120" 
                    fill="url(#liquidGrad)"
                    className="transition-all duration-1000 ease-out"
                  />

                  {/* Surface Wave Crest line */}
                  <line 
                    x1="0" 
                    y1={`${120 - (clampedGoal * 1.2)}`} 
                    x2="100" 
                    y2={`${120 - (clampedGoal * 1.2)}`} 
                    stroke="#ffffff" 
                    strokeWidth="1.5" 
                    strokeOpacity="0.6"
                  />
                  
                  {/* Bubbles / Shimmer effect */}
                  <circle cx="45" cy={`${125 - (clampedGoal * 0.9)}`} r="2.5" fill="#ffffff" fillOpacity="0.3" className="animate-pulse" />
                  <circle cx="60" cy={`${135 - (clampedGoal * 0.7)}`} r="1.5" fill="#ffffff" fillOpacity="0.4" />
                </g>

                {/* Glass Light Reflection Accent (Curved Specular Highlight) */}
                <path 
                  d="M22 65 C20 75, 23 90, 32 102" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeOpacity="0.25"
                />
              </svg>

              {/* Centered Readout Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-12">
                <span className="text-5xl font-black text-white tracking-tighter drop-shadow-md">
                  {clampedGoal}<span className="text-2xl font-semibold text-cyan-300">%</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-300/90 mt-0.5 bg-slate-900/70 px-2 py-0.5 rounded-full border border-slate-700/60">
                  Target Met
                </span>
              </div>
            </div>
          </div>

          {/* Metric Barometer Bottom */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 font-mono">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
              <span className="text-[10px] uppercase text-slate-400 block">Consumed</span>
              <span className="text-xl font-bold text-cyan-400 mt-0.5 block">{data.current_water_ml} ml</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
              <span className="text-[10px] uppercase text-slate-400 block">Remaining</span>
              <span className="text-xl font-bold text-slate-200 mt-0.5 block">
                {Math.max(data.target_water_ml - data.current_water_ml, 0)} ml
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 2: PHYSICAL BOTTLE LEVEL (Frustum Geometric Sensor) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#0c1322] to-[#080d19] border border-slate-800/90 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-400">
                <Gauge className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">Tumbler Capacity</h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300">
              ToF Live Scan
            </span>
          </div>

          {/* Realistic Frustum Flask Container */}
          <div className="my-4 flex items-center justify-center gap-6">
            <div className="relative w-36 h-64 flex flex-col items-center">
              
              {/* Lid / Cap with ToF Sensor Eye */}
              <div className="w-24 h-6 bg-slate-800 rounded-t-lg border-x-2 border-t-2 border-slate-600 flex items-center justify-center relative shadow-md">
                <div className="w-4 h-1.5 rounded-full bg-cyan-400/80 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
                <div className="absolute -top-1 w-10 h-1 bg-slate-700 rounded-t-sm"></div>
              </div>

              {/* Frustum Bottle Body */}
              <div className="relative w-32 flex-1 border-2 border-slate-700/80 rounded-b-3xl bg-slate-950/80 overflow-hidden flex flex-col justify-end p-1 shadow-inner">
                
                {/* Laser ToF Beam effect */}
                <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>

                {/* Liquid Level */}
                <div 
                  className="w-full bg-gradient-to-t from-cyan-600 via-sky-500 to-cyan-300 rounded-b-2xl transition-all duration-700 ease-out relative"
                  style={{ height: `${clampedBottle}%` }}
                >
                  {/* Liquid Meniscus & Highlight */}
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-white/40 blur-[1px]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
                </div>

                {/* Graduation Volume Markings */}
                <div className="absolute inset-y-3 left-2 flex flex-col justify-between text-[9px] font-mono text-slate-500 pointer-events-none select-none">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-[1px] bg-slate-600"></span> 800ml</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-[1px] bg-slate-600"></span> 600ml</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-[1px] bg-slate-600"></span> 400ml</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-[1px] bg-slate-600"></span> 200ml</div>
                </div>

                {/* Glass Specular Reflection Streak */}
                <div className="absolute inset-y-0 right-3 w-1.5 bg-white/10 rounded-full pointer-events-none"></div>
              </div>
            </div>

            {/* Side Readout Panel */}
            <div className="flex flex-col gap-3 font-mono">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Volume</span>
                <span className="text-3xl font-black text-cyan-400 leading-tight">{data.bottle_volume_ml}</span>
                <span className="text-xs text-slate-400">milliliters</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Fill Ratio</span>
                <span className="text-lg font-bold text-white leading-tight">{clampedBottle}%</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Status</span>
                <span className="text-xs font-semibold text-emerald-400 leading-tight">
                  {clampedBottle > 20 ? 'Optimal' : 'Refill Req.'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60 flex items-center justify-between">
            <span>Unlimited Energy</span>
            <span className="text-cyan-400 font-semibold">Be a Health Hero Every Day!</span>
          </div>
        </div>

        {/* PANEL 3: TELEMETRY PARAMETERS & CLIMATE LOGIC */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          
          {/* Card: Climate Index */}
          <div className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Environment</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-lg font-bold text-white leading-tight block">{data.env_condition}</span>
              <span className="text-[11px] text-orange-400 font-mono mt-0.5 block">+450 ml climate offset applied</span>
            </div>
          </div>

          {/* Card: Biometric & Metabolic Profile */}
          <div className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">User Biometrics</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-white">{data.gender}, {data.weight_kg} kg</span>
              <span className="text-[11px] font-mono text-cyan-300">
                {data.gender === 'Pria' || data.gender === 'Male' ? '35 ml/kg' : '30 ml/kg'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">Activity: {data.act_level}</span>
          </div>

          {/* Card: Alert Interval Engine */}
          <div className="bg-[#0c1322] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Hydration Cadence</span>
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-lg font-bold text-white">Every {data.timer_interval} Minute(s)</span>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">5x Chaser LED + Piezo Alert</span>
            </div>
          </div>

          {/* Card: Architectural Spec Note */}
          <div className="bg-gradient-to-br from-cyan-950/30 to-blue-950/20 border border-cyan-900/40 rounded-2xl p-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HYDRO HERO TEAM</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-mono">
              Syaquila Ravabia Fakhrurriza,
              Naureen Annasya Yudiarto,
              Citra Aulia Aisha El Berta,
              Geanita Elthiana Lakisha Riawan,
              Talina Ardhani Prasetyo,
              Adeeva Khumaira Farzana Pratama,  
            </p>
            <div className="mt-3 pt-2 border-t border-cyan-950 flex items-center justify-between text-[10px] font-mono text-cyan-400/80">
              <span>NVS SYNC: VERIFIED</span>
              <span>REST v1</span>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}