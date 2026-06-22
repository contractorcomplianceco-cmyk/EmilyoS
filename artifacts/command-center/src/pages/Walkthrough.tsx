import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  PlayCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Film,
  MousePointerClick,
  FileText,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WalkthroughScene, CHAPTERS } from "@/components/walkthrough/WalkthroughScenes";

const SEGMENT_COUNT = CHAPTERS.length;
const segUrl = (i: number) => `${import.meta.env.BASE_URL}walkthrough/s${i + 1}.mp3`;
const bedUrl = `${import.meta.env.BASE_URL}walkthrough/bed.mp3`;
const guideUrl = `${import.meta.env.BASE_URL}walkthrough/EmilyOS-User-Guide.pdf`;
const DEFAULT_BED_VOLUME = 0.12;

type Status = "idle" | "playing" | "paused" | "finished";
type Mode = "video" | "guided";

export default function Walkthrough() {
  const [mode, setMode] = useState<Mode>("video");
  const [status, setStatus] = useState<Status>("idle");
  const [scene, setScene] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [muted, setMuted] = useState(false);
  const [bedVolume, setBedVolume] = useState(DEFAULT_BED_VOLUME);
  const [sceneProgress, setSceneProgress] = useState(0);

  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const bedRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);
  const bedVolumeRef = useRef(DEFAULT_BED_VOLUME);
  const { toast } = useToast();

  const stopAll = () => {
    if (narrationRef.current) {
      narrationRef.current.onended = null;
      narrationRef.current.ontimeupdate = null;
      narrationRef.current.onerror = null;
      narrationRef.current.pause();
      narrationRef.current = null;
    }
    if (bedRef.current) {
      bedRef.current.pause();
      bedRef.current = null;
    }
  };

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

  useEffect(() => {
    bedVolumeRef.current = bedVolume;
    if (bedRef.current) bedRef.current.volume = mutedRef.current ? 0 : bedVolume;
  }, [bedVolume]);

  const handleBedVolumeChange = (vals: number[]) => {
    const next = (vals[0] ?? 0) / 100;
    setBedVolume(next);
    if (next > 0 && muted) setMuted(false);
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
      bed.volume = mutedRef.current ? 0 : bedVolumeRef.current;
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
      if (bedRef.current) bedRef.current.volume = nm ? 0 : bedVolumeRef.current;
      return nm;
    });
  };

  // Guided (no-audio) navigation
  const goGuided = (i: number) => {
    const clamped = Math.max(0, Math.min(SEGMENT_COUNT - 1, i));
    setScene(clamped);
    setSceneProgress(0);
    setCycle((c) => c + 1);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    stopAll();
    setStatus("idle");
    setScene(0);
    setSceneProgress(0);
    setCycle((c) => c + 1);
    setMode(next);
  };

  const handleChapterClick = (i: number) => {
    if (mode === "video") jumpTo(i);
    else goGuided(i);
  };

  const started = mode === "video" ? status !== "idle" : true;
  const activeChapter = mode === "video" ? (status !== "idle" ? scene : -1) : scene;
  const labelWord = mode === "video" ? "Chapter" : "Step";

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-primary/5 to-accent/5 p-6 sm:p-8 border border-white shadow-sm text-slate-700">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm text-primary">
              <PlayCircle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">Welcome to EmilyOS</h2>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Get oriented your way — watch the narrated tour, step through the
                guided tour at your own pace, or download the full written user guide.
              </p>
            </div>
          </div>
          <a
            href={guideUrl}
            download
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm border border-slate-200 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            User Guide (PDF)
          </a>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => switchMode("video")}
            aria-pressed={mode === "video"}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === "video"
                ? "bg-primary text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Film className="h-4 w-4" />
            Narrated Video
          </button>
          <button
            type="button"
            onClick={() => switchMode("guided")}
            aria-pressed={mode === "guided"}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === "guided"
                ? "bg-primary text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MousePointerClick className="h-4 w-4" />
            Guided Tour
          </button>
        </div>
        <span className="text-xs text-slate-500">
          {mode === "video"
            ? "Animated tour with voice narration and music."
            : "Step through each section yourself — no audio."}
        </span>
      </div>

      {/* Player */}
      <Card className="overflow-hidden border-slate-100 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="relative w-full aspect-video bg-slate-50/50">
          <AnimatePresence mode="popLayout">
            <WalkthroughScene key={`${mode}-${scene}-${cycle}`} index={scene} />
          </AnimatePresence>

          {/* Start / replay overlay (video mode only) */}
          <AnimatePresence>
            {mode === "video" && (status === "idle" || status === "finished") && (
              <motion.button
                type="button"
                onClick={start}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-white/60 backdrop-blur-[2px]"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105">
                  {status === "finished" ? (
                    <RotateCcw className="h-9 w-9" />
                  ) : (
                    <PlayCircle className="h-12 w-12" />
                  )}
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {status === "finished" ? "Replay walkthrough" : "Play walkthrough"}
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Segmented progress bar */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex gap-1 px-3 pb-2">
            {CHAPTERS.map((_, i) => {
              let fill = 0;
              if (mode === "video") {
                fill =
                  i < scene || (status === "finished" && i <= scene)
                    ? 1
                    : i === scene && started
                    ? sceneProgress
                    : 0;
              } else {
                fill = i <= scene ? 1 : 0;
              }
              return (
                <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200/50">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-150 ease-linear"
                    style={{ width: `${fill * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          {mode === "video" ? (
            <>
              <Button
                size="icon"
                onClick={togglePlay}
                className="h-9 w-9 rounded-full bg-primary text-white hover:bg-primary/90"
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
                className="h-9 w-9 shrink-0 rounded-full"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="flex shrink-0 items-center gap-2">
                <Slider
                  value={[muted ? 0 : Math.round(bedVolume * 100)]}
                  onValueChange={handleBedVolumeChange}
                  min={0}
                  max={100}
                  step={1}
                  className="w-20 sm:w-28"
                  aria-label="Music volume"
                />
                <span className="hidden w-9 text-right text-xs tabular-nums text-slate-400 sm:inline">
                  {muted ? 0 : Math.round(bedVolume * 100)}%
                </span>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goGuided(scene - 1)}
                disabled={scene === 0}
                className="h-9 w-9 rounded-full"
                aria-label="Previous step"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1 text-center">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {`Step ${scene + 1} of ${SEGMENT_COUNT} — ${CHAPTERS[scene].title}`}
                </p>
                <p className="text-xs text-slate-400">
                  {scene === SEGMENT_COUNT - 1
                    ? "End of the guided tour"
                    : "Use Next to continue at your own pace"}
                </p>
              </div>
              {scene === SEGMENT_COUNT - 1 ? (
                <Button
                  size="icon"
                  onClick={() => goGuided(0)}
                  className="h-9 w-9 rounded-full bg-primary text-white hover:bg-primary/90"
                  aria-label="Restart guided tour"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={() => goGuided(scene + 1)}
                  className="h-9 w-9 rounded-full bg-primary text-white hover:bg-primary/90"
                  aria-label="Next step"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Chapter list */}
      <Card className="overflow-hidden border-slate-100 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-primary to-accent" />
            {mode === "video" ? "Chapters" : "Steps"}
          </h3>
          <span className="text-sm font-medium text-slate-500">{SEGMENT_COUNT} sections</span>
        </div>
        <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((ch, i) => {
            const Icon = ch.icon;
            const active = i === activeChapter;
            return (
              <button
                key={ch.title}
                type="button"
                onClick={() => handleChapterClick(i)}
                className={`flex items-center gap-3 bg-white p-4 text-left transition-colors hover:bg-primary/5 ${
                  active ? "bg-primary/5" : ""
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {labelWord} {i + 1}
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-800">{ch.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* User guide card */}
      <Card className="flex flex-col gap-4 border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Detailed User Guide</h3>
            <p className="mt-0.5 max-w-lg text-sm text-slate-500">
              A complete written reference covering every area of EmilyOS — from the
              dashboard to reporting. Download it as a PDF to read or print.
            </p>
          </div>
        </div>
        <a
          href={guideUrl}
          download
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      </Card>
    </div>
  );
}
