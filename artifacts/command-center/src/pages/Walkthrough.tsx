import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clapperboard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WalkthroughScene, CHAPTERS } from "@/components/walkthrough/WalkthroughScenes";

const SEGMENT_COUNT = CHAPTERS.length;
const segUrl = (i: number) => `${import.meta.env.BASE_URL}walkthrough/s${i + 1}.mp3`;
const bedUrl = `${import.meta.env.BASE_URL}walkthrough/bed.mp3`;
const BED_VOLUME = 0.16;

type Status = "idle" | "playing" | "paused" | "finished";

export default function Walkthrough() {
  const [status, setStatus] = useState<Status>("idle");
  const [scene, setScene] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [muted, setMuted] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);

  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const bedRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);
  const { toast } = useToast();

  const reportPlaybackError = () => {
    stopAll();
    setStatus("idle");
    setSceneProgress(0);
    toast({
      variant: "destructive",
      title: "Playback unavailable",
      description: "The walkthrough audio could not be played. Please try again.",
    });
  };

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const stopAll = () => {
    if (narrationRef.current) {
      narrationRef.current.onended = null;
      narrationRef.current.ontimeupdate = null;
      narrationRef.current.pause();
      narrationRef.current = null;
    }
    if (bedRef.current) {
      bedRef.current.pause();
      bedRef.current = null;
    }
  };

  useEffect(() => stopAll, []);

  const finish = () => {
    if (narrationRef.current) {
      narrationRef.current.onended = null;
      narrationRef.current.ontimeupdate = null;
      narrationRef.current.onerror = null;
      narrationRef.current = null;
    }
    setStatus("finished");
    setSceneProgress(1);
    if (bedRef.current) {
      bedRef.current.pause();
      bedRef.current = null;
    }
  };

  const playFrom = (i: number) => {
    if (narrationRef.current) {
      narrationRef.current.onended = null;
      narrationRef.current.ontimeupdate = null;
      narrationRef.current.onerror = null;
      narrationRef.current.pause();
    }
    setScene(i);
    setSceneProgress(0);
    const a = new Audio(segUrl(i));
    a.volume = mutedRef.current ? 0 : 1;
    narrationRef.current = a;
    a.ontimeupdate = () => {
      if (a.duration) setSceneProgress(a.currentTime / a.duration);
    };
    a.onended = () => {
      if (i + 1 < SEGMENT_COUNT) playFrom(i + 1);
      else finish();
    };
    a.onerror = () => {
      if (narrationRef.current === a) reportPlaybackError();
    };
    a.play().catch(() => {
      if (narrationRef.current === a) reportPlaybackError();
    });
  };

  const ensureBed = () => {
    if (!bedRef.current) {
      const bed = new Audio(bedUrl);
      bed.loop = true;
      bed.volume = mutedRef.current ? 0 : BED_VOLUME;
      bedRef.current = bed;
      bed.play().catch(() => {});
    }
  };

  const start = () => {
    stopAll();
    setStatus("playing");
    setCycle((c) => c + 1);
    ensureBed();
    playFrom(0);
  };

  const togglePlay = () => {
    if (status === "idle" || status === "finished") {
      start();
      return;
    }
    if (status === "playing") {
      narrationRef.current?.pause();
      bedRef.current?.pause();
      setStatus("paused");
    } else if (status === "paused") {
      const a = narrationRef.current;
      bedRef.current?.play().catch(() => {});
      if (a) {
        a.play()
          .then(() => setStatus("playing"))
          .catch(() => {
            if (narrationRef.current === a) reportPlaybackError();
          });
      } else {
        setStatus("playing");
      }
    }
  };

  const jumpTo = (i: number) => {
    setStatus("playing");
    setCycle((c) => c + 1);
    ensureBed();
    if (bedRef.current && bedRef.current.paused) bedRef.current.play().catch(() => {});
    playFrom(i);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const nm = !m;
      if (narrationRef.current) narrationRef.current.volume = nm ? 0 : 1;
      if (bedRef.current) bedRef.current.volume = nm ? 0 : BED_VOLUME;
      return nm;
    });
  };

  const started = status !== "idle";

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <Clapperboard className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Product Walkthrough</h2>
            <p className="mt-1.5 max-w-xl text-sm text-white/70">
              A narrated, animated tour of EmilyOS — from the dashboard to agencies,
              the regulatory tracker, change monitor, and insights.
            </p>
          </div>
        </div>
      </div>

      {/* Player */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="relative w-full aspect-video bg-[#0a0f2c]">
          <AnimatePresence mode="popLayout">
            <WalkthroughScene key={`${scene}-${cycle}`} index={scene} />
          </AnimatePresence>

          {/* Start / replay overlay */}
          <AnimatePresence>
            {(status === "idle" || status === "finished") && (
              <motion.button
                type="button"
                onClick={start}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#0a0f2c]/60 backdrop-blur-[2px]"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-600/90 text-white shadow-[0_0_40px_rgba(20,184,166,0.75)] transition-transform hover:scale-105">
                  {status === "finished" ? (
                    <RotateCcw className="h-9 w-9" />
                  ) : (
                    <PlayCircle className="h-12 w-12" />
                  )}
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
                  {status === "finished" ? "Replay walkthrough" : "Play walkthrough"}
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Segmented progress bar */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex gap-1 px-3 pb-2">
            {CHAPTERS.map((_, i) => {
              const fill =
                i < scene || (status === "finished" && i <= scene)
                  ? 1
                  : i === scene && started
                  ? sceneProgress
                  : 0;
              return (
                <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-teal-400 transition-[width] duration-150 ease-linear"
                    style={{ width: `${fill * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <Button
            size="icon"
            onClick={togglePlay}
            className="h-9 w-9 rounded-full bg-teal-600 text-white hover:bg-teal-700"
            aria-label={status === "playing" ? "Pause" : "Play"}
          >
            {status === "playing" ? (
              <Pause className="h-4 w-4" />
            ) : status === "finished" ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {`Chapter ${scene + 1} of ${SEGMENT_COUNT} — ${CHAPTERS[scene].title}`}
            </p>
            <p className="text-xs text-slate-400">
              {status === "idle"
                ? "Press play to start the narrated tour"
                : status === "finished"
                ? "Walkthrough complete"
                : status === "paused"
                ? "Paused"
                : "Now playing"}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className="h-9 w-9 rounded-full"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      {/* Chapter list */}
      <Card className="overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-teal-600" />
            Chapters
          </h3>
          <span className="text-sm font-medium text-slate-500">{SEGMENT_COUNT} sections</span>
        </div>
        <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((ch, i) => {
            const Icon = ch.icon;
            const active = started && i === scene;
            return (
              <button
                key={ch.title}
                type="button"
                onClick={() => jumpTo(i)}
                className={`flex items-center gap-3 bg-white p-4 text-left transition-colors hover:bg-teal-50/60 ${
                  active ? "bg-teal-50" : ""
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Chapter {i + 1}
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-800">{ch.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
