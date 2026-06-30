"use client";

import { useState, useEffect } from "react";
import { MY_MOVIES } from "@/lib/movies";

const ARCHIVE_KEY = "movie-archive";
const DEFAULT_GENRES = [
  "Drama", "Romance", "Thriller", "Crime", "Comedy", "Fantasy",
  "Mystery", "Horror", "Science Fiction", "Adventure", "Animation",
  "War", "Music", "Family", "Action",
];

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex gap-[2px] text-[#d5b178]">
      {[0, 1, 2, 3, 4].map((i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>⯨</span>;
        return <span key={i} className="text-[#3a3226]">★</span>;
      })}
    </div>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "top-3 left-3 sm:top-7 sm:left-7",
    tr: "top-3 right-3 sm:top-7 sm:right-7",
    bl: "bottom-12 left-3 sm:bottom-7 sm:left-7",
    br: "bottom-12 right-3 sm:bottom-7 sm:right-7",
  };
  const rotate = { tl: 0, tr: 90, bl: 270, br: 180 };
  return (
    <div className={`fixed ${map[pos]} z-20 pointer-events-none hidden sm:block`} style={{ transform: `rotate(${rotate[pos]}deg)` }}>
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
        <path d="M2 40 L2 2 L40 2" stroke="rgba(201,169,110,.3)" strokeWidth="1" />
        <circle cx="2" cy="2" r="2" fill="#c9a96e" />
      </svg>
    </div>
  );
}

function GenreTicker({ genres, slow }: { genres: string[]; slow: boolean }) {
  const all = Array(10).fill(genres).flat();
  return (
    <div className="fixed bottom-0 left-0 right-0 h-7 sm:h-8 overflow-hidden z-30 border-t border-[#1a1a1a] bg-black">
      <div
        className="flex gap-6 sm:gap-10 items-center whitespace-nowrap h-full text-[10px] sm:text-[12px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-zinc-700"
        style={{ animation: `move ${slow ? 42 : 18}s linear infinite` }}
      >
        {all.map((g, i) => (
          <div key={i} className="flex gap-6 sm:gap-10">
            {g}
            <span className="text-[#c9a96e] opacity-40">✦</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes move{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

function ArchiveOverlay({
  archived,
  onRestore,
  onClose,
}: {
  archived: string[];
  onRestore: (title: string) => void;
  onClose: () => void;
}) {
  const archivedMovies = MY_MOVIES.filter((m) => archived.includes(m.title));
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center px-3 sm:px-0" onClick={onClose}>
      <div
        className="relative mt-10 sm:mt-16 w-full max-w-[720px] max-h-[80vh] sm:max-h-[75vh] overflow-y-auto border border-[#2a2a2a] bg-[#090909]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#090909] border-b border-[#1a1a1a] px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between z-10">
          <div>
            <div className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-zinc-600 mb-1">watched</div>
            <div className="text-lg sm:text-xl font-black text-[#f2ede5]">Archive</div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-[#c9a96e] text-[11px] tracking-[0.3em] uppercase transition"
          >
            ✕ close
          </button>
        </div>
        {archivedMovies.length === 0 ? (
          <div className="px-4 sm:px-8 py-12 text-center text-zinc-600 text-sm tracking-[0.2em] uppercase">
            archive is empty
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {archivedMovies.map((m) => (
              <div key={m.title} className="flex items-center gap-3 sm:gap-5 px-4 sm:px-8 py-3 sm:py-4 group hover:bg-[#0f0f0f] transition">
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-9 h-12 sm:w-10 sm:h-14 object-cover rounded-sm opacity-70 group-hover:opacity-100 transition flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[#f2ede5] text-sm font-bold truncate">{m.title}</div>
                  <div className="text-zinc-600 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase mt-0.5">
                    {m.year} · {m.director}
                  </div>
                </div>
                <button
                  onClick={() => onRestore(m.title)}
                  className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 hover:text-[#c9a96e] transition whitespace-nowrap"
                >
                  ↩ restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  const [movie, setMovie] = useState<(typeof MY_MOVIES)[number] | null>(null);
  const [last, setLast] = useState(-1);
  const [history, setHistory] = useState<number[]>([]);
  const [future, setFuture] = useState<number[]>([]);
  const [seen, setSeen] = useState<string[]>([]);
  const [genres, setGenres] = useState(DEFAULT_GENRES);
  const [sessionCount, setSession] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [archived, setArchived] = useState<string[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [previewMovies, setPreviewMovies] = useState<(typeof MY_MOVIES)[number][]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(ARCHIVE_KEY);
    if (saved) setArchived(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const shuffled = [...MY_MOVIES].sort(() => Math.random() - 0.5).slice(0, 5);
    setPreviewMovies(shuffled);
  }, []);

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.code === "Space") { e.preventDefault(); spin(); }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const posterTransforms = [
    "translate(-250px,80px) rotate(-24deg)",
    "translate(-120px,35px) rotate(-12deg)",
    "translate(0px,0px) rotate(0deg)",
    "translate(120px,35px) rotate(12deg)",
    "translate(250px,80px) rotate(24deg)",
  ];

  function addToArchive(title: string) {
    const next = archived.includes(title) ? archived : [...archived, title];
    setArchived(next);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
  }

  function restoreFromArchive(title: string) {
    const next = archived.filter((t) => t !== title);
    setArchived(next);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
  }

  const availableMovies = MY_MOVIES.filter((m) => !archived.includes(m.title));

  async function spin() {
    if (rolling || availableMovies.length === 0) return;
    setRolling(true);

    for (let i = 0; i < 18; i++) {
      const temp = availableMovies[Math.floor(Math.random() * availableMovies.length)];
      setMovie(temp);
      await new Promise((r) => setTimeout(r, 40 + i * 10));
    }

    let chosen = availableMovies[Math.floor(Math.random() * availableMovies.length)];
    if (availableMovies.length > 1 && movie && chosen.title === movie.title) {
      chosen = availableMovies[Math.floor(Math.random() * availableMovies.length)];
    }

    const idx = MY_MOVIES.indexOf(chosen);
    if (last !== -1) setHistory((p) => [...p, last]);
    setFuture([]);
    setLast(idx);
    setMovie(chosen);
    setGenres(chosen.genres);
    setSession((v) => v + 1);
    setSeen((p) => (p.includes(chosen.title) ? p : [chosen.title, ...p].slice(0, 6)));
    setRolling(false);
  }

  function goBack() {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const copy = [...prev];
      const index = copy.pop()!;
      setFuture((f) => [last, ...f]);
      setLast(index);
      setMovie(MY_MOVIES[index]);
      setGenres(MY_MOVIES[index].genres);
      return copy;
    });
  }

  function goForward() {
    setFuture((prev) => {
      if (!prev.length) return prev;
      const copy = [...prev];
      const index = copy.shift()!;
      setHistory((h) => [...h, last]);
      setLast(index);
      setMovie(MY_MOVIES[index]);
      setGenres(MY_MOVIES[index].genres);
      return copy;
    });
  }

  function reset() {
    setMovie(null);
    setLast(-1);
    setHistory([]);
    setFuture([]);
    setSeen([]);
    setSession(0);
    setGenres(DEFAULT_GENRES);
  }

  return (
    <div className="min-h-screen overflow-hidden relative text-[#f2ede5] bg-[radial-gradient(circle_at_50%_0%,rgba(201,169,110,.09),transparent_45%),linear-gradient(#090909,#000)]">

      {/* decorative props — hidden on small screens, shown from md up */}
      <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden hidden md:block">
        <div className="absolute left-10 bottom-18 w-[420px] opacity-20">
          <img src="/popco.svg" alt="" className="w-full drop-shadow-2xl" style={{ transform: "rotate(-14deg)" }} />
        </div>
        <div className="absolute right-10 top-[18%] w-[400px] opacity-20">
          <img src="/glasse.svg" alt="" className="w-full drop-shadow-2xl" style={{ transform: "rotate(18deg)" }} />
        </div>
        <div className="absolute right-0 top-0 h-full w-[420px] bg-gradient-to-l from-black/90 via-black/30 to-transparent" />
      </div>

      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {sessionCount > 0 && (
        <div className="fixed bottom-9 left-3 sm:bottom-16 sm:left-9 z-20 flex flex-col gap-0.5 sm:gap-1">
          <div className="text-[0.6rem] sm:text-[0.7rem] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-zinc-600">this session</div>
          <div className="text-xl sm:text-3xl font-bold text-[#c9a96e] leading-none">{String(sessionCount).padStart(2, "0")}</div>
          <div className="text-[0.6rem] sm:text-[0.7rem] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-zinc-600 hidden sm:block">shuffled</div>
        </div>
      )}

      {showArchive && (
        <ArchiveOverlay
          archived={archived}
          onRestore={restoreFromArchive}
          onClose={() => setShowArchive(false)}
        />
      )}

      <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[180px] bg-[#c9a96e]/[0.04] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] sm:min-h-0 pt-10 sm:pt-20 pb-12 sm:pb-20 px-4">
        <div className="text-[10px] sm:text-[12px] tracking-[0.3em] sm:tracking-[0.45em] uppercase text-zinc-600 mb-2 sm:mb-3 text-center">movie archive</div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3 sm:mb-4 text-center">Random Movie</h1>

        <div className="text-[9px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-zinc-600 mb-6 sm:mb-8 text-center">
          {MY_MOVIES.length} films loaded / {availableMovies.length} available
        </div>

        <button
          type="button"
          onClick={() => spin()}
          disabled={rolling}
          className="cursor-pointer border border-[#c9a96e] px-8 sm:px-14 py-4 sm:py-5 uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-black transition active:scale-95 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto max-w-[320px] sm:max-w-none"
        >
          {rolling ? "selecting..." : movie ? "✦ reshuffle ✦" : "✦ shuffle ✦"}
        </button>

        {!movie ? (
          <div className="relative mt-6 sm:mt-10 w-full max-w-[1200px] h-[300px] sm:h-[460px] md:h-[650px] flex flex-col items-center justify-center">
            <div className="absolute w-[280px] sm:w-[600px] md:w-[850px] h-[200px] sm:h-[300px] md:h-[420px] rounded-full bg-[#c9a96e]/10 blur-[80px] sm:blur-[110px] md:blur-[140px] pointer-events-none" />

            <div className="relative w-full h-full flex items-center justify-center scale-[0.42] xs:scale-[0.5] sm:scale-[0.75] md:scale-100 origin-center">
              {previewMovies.map((m, i) => (
                <img
                  key={m.title}
                  src={m.poster}
                  alt={m.title}
                  className="absolute w-[350px] rounded border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,.6)] transition-all duration-300 hover:-translate-y-4 hover:scale-[1.03]"
                  style={{ transform: posterTransforms[i], zIndex: 20 - Math.abs(i - 2) }}
                />
              ))}
            </div>

            <button
              onClick={() => setShowArchive(true)}
              className="relative z-10 mt-4 sm:mt-6 text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.35em] uppercase text-zinc-600 hover:text-[#c9a96e] transition border border-[#1e1e1e] hover:border-[#c9a96e]/30 px-4 sm:px-6 py-2 sm:py-2.5"
            >
              ✦ archive{archived.length > 0 ? ` (${archived.length})` : ""}
            </button>
          </div>
        ) : (
          <div className="mt-8 sm:mt-12 w-full flex flex-col items-center">
            <div className="flex gap-5 sm:gap-10 mb-6 sm:mb-8 items-center text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] flex-wrap justify-center">
              <button onClick={goBack} disabled={!history.length} className="text-zinc-500 hover:text-[#c9a96e] disabled:opacity-30">← previous</button>
              <button onClick={goForward} disabled={!future.length} className="text-zinc-500 hover:text-[#c9a96e] disabled:opacity-30">next →</button>
              <button onClick={reset} className="text-zinc-500 hover:text-[#c9a96e] transition">↺ reset</button>
            </div>

            <div
              className="relative z-0 w-full max-w-[900px] border border-[#2a2a2a] grid grid-cols-1 md:grid-cols-[340px_1fr] overflow-hidden min-h-0 md:min-h-[460px]"
              style={
                movie.backdrop
                  ? { backgroundImage: `url(${movie.backdrop})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            >
              {movie.backdrop && <div className="absolute inset-0 bg-black/75 z-0" />}

              <div className="relative z-10 p-4 sm:p-6 flex items-center justify-center h-full">
                <div className="relative p-2 bg-black/20">
                  <div className="absolute inset-0 border border-white/5 rounded-sm pointer-events-none" />
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] pointer-events-none" />
                  <div className="absolute inset-0 ring-1 ring-[#c9a96e]/10 pointer-events-none" />
                  <img src={movie.poster} alt={movie.title} className="w-full max-h-[260px] sm:max-h-[340px] md:max-h-[420px] object-cover relative z-10 contrast-[1.03] saturate-[1.02] rounded-sm" />
                </div>
              </div>

              <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col">
                <div className="mb-4 sm:mb-5">
                  <div className="text-[#c9a96e] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px]">{movie.genres.join(" / ")}</div>
                  <div className="flex items-start sm:items-center justify-between flex-wrap gap-1 sm:gap-0">
                    <div className="text-2xl sm:text-3xl font-black leading-tight">{movie.title}</div>
                    <div className="text-xs sm:text-sm text-zinc-400 whitespace-nowrap sm:ml-6">{movie.year} · {movie.runtime}</div>
                  </div>
                </div>

                <div className="text-zinc-500 text-sm mb-3 sm:mb-4">
                  Directed by <span className="text-zinc-200 ml-2">{movie.director}</span>
                </div>

                <div className="text-[#c9a96e] uppercase text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] mb-4 sm:mb-5">{movie.country.join(" • ")}</div>

                <div className="w-12 h-px mb-4 sm:mb-6" />

                <div className="leading-7 sm:leading-8 text-sm sm:text-base text-zinc-300 mb-8 sm:mb-10">{movie.description}</div>

                <div className="mt-auto flex justify-between items-end">
                  <div className="flex gap-3 sm:gap-4 items-center">
                    <Stars rating={movie.rating} />
                    <div className="text-zinc-500 text-sm">{movie.rating}/5</div>
                  </div>

                  <button
                    onClick={() => addToArchive(movie.title)}
                    disabled={archived.includes(movie.title)}
                    className="transition border p-2 disabled:opacity-40 disabled:cursor-default hover:border-[#c9a96e]/50"
                    style={
                      archived.includes(movie.title)
                        ? { borderColor: "#2a2a2a", color: "#555" }
                        : { borderColor: "rgba(201,169,110,0.3)", color: "#c9a96e" }
                    }
                    title={archived.includes(movie.title) ? "Archived" : "Mark as watched"}
                  >
                    {archived.includes(movie.title) ? (
                      <img src="archived.svg" alt="archived" className="w-4 h-4 opacity-40" />
                    ) : (
                      <svg xmlns="http://w3.org" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                        <path d="M13 5v2" />
                        <path d="M13 17v2" />
                        <path d="M13 11v2" />
                      </svg>

                    )}
                  </button>
                </div>
              </div>
            </div>

            {seen.length > 1 && (
              <div className="hidden lg:block fixed right-10 bottom-16 text-right z-50">
                <div className="text-[10px] uppercase tracking-[0.4em] text-zinc-700 mb-3">recent</div>
                {seen.slice(1).map((title, i) => (
                  <div key={i} className="text-sm mb-2 text-zinc-600" style={{ opacity: 1 - i * 0.2 }}>{title}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <GenreTicker genres={genres} slow={!movie} />
    </div>
  );
}