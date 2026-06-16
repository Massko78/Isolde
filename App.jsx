import { useState, useEffect, useRef } from "react";
import { BookOpen, PenLine, User, ArrowLeft, ArrowRight, Heart, Bookmark, MessageCircle, Image as ImageIcon, EyeOff, Send, LogIn, LogOut, Star, Trash2, Flag, Search, Share2, ShieldCheck, X, Moon, Sun, Maximize2, Minimize2, UserPlus, UserMinus, Trophy, Users, FileEdit, Upload, Mail, Zap, Crown } from "lucide-react";
import { supabase } from "./supabaseClient";

// Stable identifier used for the like system, even for visitors without an account
function getVoterId(session) {
  if (session?.user?.id) return session.user.id;
  let id = localStorage.getItem("anon_voter_id");
  if (!id) {
    id = "anon-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("anon_voter_id", id);
  }
  return id;
}


function BookOpenAnimation({ spineColor, title, seal }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(10,9,20,0.85)",
      animation: "bookFadeOut 0.9s ease-in-out forwards",
      pointerEvents: "none",
    }}>
      <style>{`
        @keyframes bookFadeOut {
          0%   { opacity: 1; }
          60%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes leftPageOpen {
          0%   { transform: perspective(800px) rotateY(0deg); }
          70%  { transform: perspective(800px) rotateY(-85deg); }
          100% { transform: perspective(800px) rotateY(-88deg); }
        }
        @keyframes rightPageOpen {
          0%   { transform: perspective(800px) rotateY(0deg); }
          70%  { transform: perspective(800px) rotateY(85deg); }
          100% { transform: perspective(800px) rotateY(88deg); }
        }
        @keyframes spineGlow {
          0%   { box-shadow: 0 0 0 rgba(201,168,124,0); }
          40%  { box-shadow: 0 0 32px rgba(201,168,124,0.4); }
          100% { box-shadow: 0 0 0 rgba(201,168,124,0); }
        }
      `}</style>

      <div style={{ position: "relative", width: 280, height: 340 }}>
        {/* Left page */}
        <div style={{
          position: "absolute", right: "50%", top: 0, width: 130, height: 340,
          transformOrigin: "right center",
          animation: "leftPageOpen 0.75s cubic-bezier(0.4,0,0.2,1) 0.1s forwards",
          background: `linear-gradient(to right, #0F0E18, ${spineColor}22)`,
          borderRadius: "4px 0 0 4px",
          border: "1px solid rgba(201,168,124,0.15)",
          borderRight: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {/* Decorative lines on left page */}
          <svg width="100" height="200" viewBox="0 0 100 200" style={{ opacity: 0.15 }}>
            {[30,55,80,105,130,155,175].map((y,i) => (
              <line key={i} x1="10" y1={y} x2="90" y2={y} stroke="rgba(201,168,124,0.8)" strokeWidth="0.8"/>
            ))}
            <ellipse cx="50" cy="20" rx="20" ry="9" fill="none" stroke="rgba(201,168,124,0.6)" strokeWidth="0.8"/>
          </svg>
        </div>

        {/* Spine */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          width: 20, height: 340,
          background: `linear-gradient(to bottom, ${spineColor}ee, ${spineColor}88)`,
          animation: "spineGlow 0.85s ease-in-out 0.1s forwards",
          zIndex: 2,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Fraunces', serif", fontStyle: "italic",
            fontSize: 11, color: "rgba(255,255,255,0.7)",
            writingMode: "vertical-rl", transform: "rotate(180deg)",
            letterSpacing: "0.08em", maxHeight: 200, overflow: "hidden",
          }}>{title}</span>
        </div>

        {/* Right page */}
        <div style={{
          position: "absolute", left: "50%", top: 0, width: 130, height: 340,
          transformOrigin: "left center",
          animation: "rightPageOpen 0.75s cubic-bezier(0.4,0,0.2,1) 0.1s forwards",
          background: `linear-gradient(to left, #0F0E18, ${spineColor}22)`,
          borderRadius: "0 4px 4px 0",
          border: "1px solid rgba(201,168,124,0.15)",
          borderLeft: "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          overflow: "hidden",
        }}>
          {/* Big sigil on right page */}
          <span style={{
            fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 300,
            fontSize: 72, color: spineColor, opacity: 0.3,
            textShadow: `0 0 20px ${spineColor}`,
            lineHeight: 1,
          }}>{seal}</span>
          <svg width="80" height="1" viewBox="0 0 80 1">
            <line x1="0" y1="0" x2="80" y2="0" stroke="rgba(201,168,124,0.3)" strokeWidth="1"/>
          </svg>
        </div>

        {/* Petal burst from spine */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 3, pointerEvents: "none" }}>
          {["#F4B8C8","#F0A0B8","#E8C0D0","rgba(201,168,124,0.8)"].map((color, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 8 + i * 2, height: 5 + i,
              borderRadius: "50%",
              background: color,
              opacity: 0,
              left: `${Math.cos((i * 90 + 45) * Math.PI / 180) * 30}px`,
              top: `${Math.sin((i * 90 + 45) * Math.PI / 180) * 30}px`,
              animation: `bookFadeOut 0.6s ease-out ${0.3 + i * 0.07}s forwards`,
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}


function WaxSeal({ letter, color, size = 36 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-display"
      style={{
        width: size,
        height: size,
        background: color,
        color: "var(--paper-warm)",
        fontSize: size * 0.46,
        fontStyle: "italic",
        fontWeight: 600,
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.18)",
      }}
    >
      {letter}
    </div>
  );
}

function ImageField({ label, value, onChange, session, maxHeightPreview = 220 }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop();
    const path = `${session.user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("images").upload(path, file);
    if (uploadError) {
      setError("L'envoi a échoué. Réessaie.");
    } else {
      const { data } = supabase.storage.from("images").getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <label className="flex flex-col gap-2">
      <span className="font-ui text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--ink-light)" }}>
        <ImageIcon size={13} />
        {label}
      </span>
      <div className="flex gap-2 flex-wrap">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Coller un lien d'image..."
          className="flex-1 min-w-[160px] font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
          style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !session}
          className="flex items-center gap-1.5 font-ui text-xs px-4 py-3 rounded-md border whitespace-nowrap disabled:opacity-50 transition-opacity"
          style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
        >
          <Upload size={14} />
          {uploading ? "Envoi..." : "Depuis mes fichiers"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {error && (
        <span className="font-ui text-xs" style={{ color: "var(--wine)" }}>
          {error}
        </span>
      )}
      {value && (
        <div className="rounded-lg overflow-hidden border mt-1" style={{ borderColor: "var(--rule)" }}>
          <img src={value} alt="Aperçu" className="w-full h-auto object-cover" style={{ maxHeight: maxHeightPreview }} />
        </div>
      )}
    </label>
  );
}

function AuthorBadge({ avatarUrl, letter, color, size = 36 }) {
  const resolvedColor = color || colorFromString(letter);
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return <WaxSeal letter={letter} color={resolvedColor} size={size} />;
}

function TopNav({ view, setView, session, profile, goToWrite, notifCount, dmCount, discoverNewCount, onOpenDiscover }) {
  const items = [
    { key: "home", label: "Découvrir", icon: BookOpen, badge: discoverNewCount },
    { key: "library", label: "Inspiration", icon: Bookmark },
    { key: "write", label: "Écrire", icon: PenLine },
  ];
  if (session) {
    items.push({ key: "following", label: "Abonnements", icon: Users });
    items.push({ key: "interactions", label: "Interactions", icon: MessageCircle, badge: notifCount });
    items.push({ key: "dm", label: "Messages", icon: Mail, badge: dmCount });
    items.push({ key: "collab", label: "Collabs", icon: Crown });
  }

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ background: "var(--paper)", borderColor: "var(--rule)" }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4 gap-2">
        <button
          onClick={() => setView("home")}
          className="font-display italic text-xl sm:text-2xl tracking-tight shrink-0"
          style={{ color: "var(--ink)" }}
        >
          Dreams
        </button>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {items.map(({ key, label, icon: Icon, badge }) => {
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => {
                  if (key === "write") { goToWrite(); return; }
                  if (key === "home" && onOpenDiscover) onOpenDiscover();
                  setView(key);
                }}
                className="relative flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-full text-sm font-ui transition-colors"
                style={{
                  color: active ? "var(--paper-warm)" : "var(--ink)",
                  background: active ? "var(--ink)" : "transparent",
                }}
              >
                <Icon size={15} strokeWidth={2} />
                <span className="hidden sm:inline">{label}</span>
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-mono text-[10px] font-bold"
                    style={{ background: "var(--wine)", color: "var(--paper-warm)", lineHeight: 1 }}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </button>
            );
          })}

          {profile?.is_moderator && (
            <button
              onClick={() => setView("moderation")}
              className="flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-full text-sm font-ui transition-colors"
              style={{
                color: view === "moderation" ? "var(--paper-warm)" : "var(--ink)",
                background: view === "moderation" ? "var(--ink)" : "transparent",
              }}
            >
              <ShieldCheck size={15} strokeWidth={2} />
              <span className="hidden sm:inline">Modération</span>
            </button>
          )}

          {session ? (
            <button
              onClick={() => setView("profile")}
              className="flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-full text-sm font-ui transition-colors max-w-[7rem] sm:max-w-none"
              style={{
                color: view === "profile" ? "var(--paper-warm)" : "var(--ink)",
                background: view === "profile" ? "var(--ink)" : "transparent",
              }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
              ) : (
                <User size={15} strokeWidth={2} className="shrink-0" />
              )}
              <span className="truncate">{profile?.username || "Profil"}</span>
            </button>
          ) : (
            <button
              onClick={() => setView("auth")}
              className="flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-full text-sm font-ui transition-colors"
              style={{
                color: view === "auth" ? "var(--paper-warm)" : "var(--ink)",
                background: view === "auth" ? "var(--ink)" : "transparent",
              }}
            >
              <LogIn size={15} strokeWidth={2} />
              <span className="hidden sm:inline">Connexion</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function HomeView({ collections, topLiked, freePoems, openCollection, openFreePoem, goToAuthor, currentChallenge, onChallenge }) {
  const [query, setQuery] = useState("");

  if (collections.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>
          Chargement des recueils...
        </p>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? collections.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q) ||
          c.theme.toLowerCase().includes(q)
      )
    : collections;

  const featured = collections[0];
  const featuredPoem = featured.poems[0];
  const excerptLines = featuredPoem.lines.filter((l) => l).slice(0, 3);

  // All poems (from collections + free), sorted by most recent
  const allRecentPoems = [
    ...collections.flatMap(c =>
      (c.poems || []).map(p => ({ ...p, collection: c, isFree: false }))
    ),
    ...(freePoems || []).map(p => ({ ...p, collection: null, isFree: true })),
  ].sort((a, b) => {
    const dateA = a.created_at || a.collection?.updated_at || a.collection?.created_at || "1970";
    const dateB = b.created_at || b.collection?.updated_at || b.collection?.created_at || "1970";
    return new Date(dateB) - new Date(dateA);
  }).slice(0, 20);

  return (
    <div className="max-w-5xl mx-auto px-6 view-enter">

      {/* Challenge banner */}
      {currentChallenge && (
        <button
          onClick={onChallenge}
          className="w-full text-left mt-8 mb-2 rounded-2xl overflow-hidden transition-all hover:opacity-95 hover:shadow-lg"
          style={{ background: "var(--ink)" }}
        >
          <div className="px-7 pt-7 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} style={{ color: "var(--sage)" }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--sage)" }}>
                Challenge · semaine {currentChallenge.week_number}
              </span>
            </div>
            <p className="font-display italic leading-tight mb-3" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: "var(--paper-warm)" }}>
              {currentChallenge.title}
            </p>
            {currentChallenge.description && (
              <p className="font-ui text-sm leading-relaxed mb-5" style={{ color: "rgba(240,235,225,0.55)" }}>
                {currentChallenge.description}
              </p>
            )}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="font-mono text-xs" style={{ color: "rgba(240,235,225,0.4)" }}>
                Écris et soumets ton poème
              </span>
              <span className="flex items-center gap-1.5 font-ui text-sm px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "var(--paper-warm)" }}>
                Participer <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </button>
      )}

      {/* Hero */}
      <section className="pt-16 pb-14 grid md:grid-cols-[1fr_auto] gap-10 items-end border-b" style={{ borderColor: "var(--rule)" }}>
        <div>
          <p className="font-mono text-xs tracking-[0.2em] uppercase mb-6" style={{ color: "var(--sage)" }}>
            En lecture cette semaine
          </p>
          <p
            className="font-display italic leading-tight mb-6"
            style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)", color: "var(--ink)" }}
          >
            {excerptLines.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </p>
          <div className="flex items-center gap-3 mb-8">
            <AuthorBadge avatarUrl={featured.authorAvatar} letter={featured.seal} color={featured.sealColor} />
            <div className="font-ui text-sm">
              <p style={{ color: "var(--ink)" }}>{featuredPoem.title}</p>
              <p style={{ color: "var(--ink-light)" }}>
                extrait de « {featured.title} »,{" "}
                {featured.author_id ? (
                  <span role="button" onClick={() => goToAuthor(featured.author_id)} className="hover:underline">
                    {featured.author}
                  </span>
                ) : (
                  featured.author
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => openCollection(featured, 0)}
            className="inline-flex items-center gap-2 font-ui text-sm px-5 py-2.5 rounded-full transition-transform hover:translate-x-0.5"
            style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
          >
            Lire le recueil <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Top liked poems */}
      {topLiked.length > 0 && (
        <section className="py-14 border-b" style={{ borderColor: "var(--rule)" }}>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
              Les plus aimés
            </h2>
            <Heart size={14} style={{ color: "var(--wine)" }} fill="var(--wine)" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {topLiked.filter((p) => p.collection && p.collection.poems).map((p) => {
              const idx = p.collection.poems.findIndex((x) => x.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => openCollection(p.collection, idx)}
                  className="text-left p-6 rounded-lg border transition-colors hover:shadow-sm flex items-center justify-between gap-4"
                  style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
                >
                  <div className="flex items-center gap-4">
                    <AuthorBadge avatarUrl={p.collection.authorAvatar} letter={p.collection.seal} color={p.collection.sealColor} />
                    <div>
                      <h3 className="font-display italic text-lg" style={{ color: "var(--ink)" }}>
                        {p.title}
                      </h3>
                      <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                        {p.collection.title} ·{" "}
                        {p.collection.author_id ? (
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              goToAuthor(p.collection.author_id);
                            }}
                            className="hover:underline"
                          >
                            {p.collection.author}
                          </span>
                        ) : (
                          p.collection.author
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 font-mono text-xs shrink-0" style={{ color: "var(--wine)" }}>
                    <Heart size={13} fill="var(--wine)" />
                    {p.likes_count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Fil des nouveaux poèmes ── */}
      {allRecentPoems.length > 0 && (
        <section className="pb-14">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
              Nouveaux poèmes
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "var(--wine)", color: "var(--paper-warm)" }}>
              {allRecentPoems.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {allRecentPoems.map((p) => {
              const preview = (p.lines || []).filter(l => l.trim()).slice(0, 2);
              const sc = p.isFree
                ? colorFromString(p.author || "?")
                : (p.collection.sealColor || colorFromString(p.collection.title));

              const authorName = p.isFree ? p.author : p.collection.author;
              const authorId = p.isFree ? p.author_id : p.collection.author_id;
              const dateRef = p.collection?.updated_at || p.collection?.created_at || p.created_at;

              return (
                <button
                  key={`${p.isFree ? "free" : "col"}-${p.id}`}
                  onClick={() => {
                    if (p.isFree) openFreePoem(p);
                    else openCollection(p.collection, (p.collection.poems || []).findIndex(x => x.id === p.id));
                  }}
                  className="flex items-start gap-4 p-4 rounded-xl border text-left transition-all hover:shadow-md"
                  style={{ background: "var(--paper-warm)", borderColor: "var(--rule)", borderLeft: `3px solid ${sc}` }}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-display italic text-sm shrink-0 mt-0.5" style={{ background: sc, color: "var(--paper-warm)" }}>
                    {p.isFree ? (p.author || "?").charAt(0).toUpperCase() : p.collection.seal}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title + collection badge */}
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-display italic text-base" style={{ color: "var(--ink)" }}>
                        {p.title}
                      </p>
                      {!p.isFree && (
                        <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                          style={{ color: sc, border: `1px solid ${sc}44`, background: `${sc}15` }}>
                          {p.collection.title}
                        </span>
                      )}
                      {p.isFree && (
                        <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                          style={{ color: "var(--ink-light)", border: "1px solid var(--rule)" }}>
                          Poème libre
                        </span>
                      )}
                    </div>

                    {/* Author + date */}
                    <p className="font-ui text-xs mb-1.5" style={{ color: "var(--ink-light)" }}>
                      {authorId ? (
                        <span role="button" onClick={e => { e.stopPropagation(); goToAuthor(authorId); }} className="hover:underline">
                          {authorName}
                        </span>
                      ) : authorName}
                      {" · "}
                      {timeAgo(dateRef)}
                    </p>

                    {/* Preview lines */}
                    <div className="font-display italic text-sm leading-relaxed" style={{ color: "var(--ink-light)" }}>
                      {preview.map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                  </div>

                  {/* Likes */}
                  <div className="flex items-center gap-1 shrink-0 mt-1" style={{ color: "var(--wine)" }}>
                    <Heart size={12} fill={(p.likes_count || 0) > 0 ? "var(--wine)" : "none"} />
                    <span className="font-mono text-xs">{p.likes_count || 0}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}

function ReaderView({ collection, poemIndex, setPoemIndex, back, session, profile, refresh, onDeleted, goToAuthor, editDraft }) {
  const poem = collection.poems[poemIndex];
  const [fullscreen, setFullscreen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(poem.likes_count);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [commentAnon, setCommentAnon] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [poemReported, setPoemReported] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [bookOpening, setBookOpening] = useState(!collection.isFree);

  useEffect(() => {
    if (!collection.isFree) {
      const t = setTimeout(() => setBookOpening(false), 900);
      return () => clearTimeout(t);
    }
  }, [collection.id]);

  const canManage = session && (profile?.is_moderator || collection.author_id === session.user.id);

  // Reset/load per-poem state whenever the displayed poem changes
  useEffect(() => {
    setLikesCount(poem.likes_count);
    setShareCopied(false);
    setPoemReported(false);
    setCommentError("");

    const voterId = getVoterId(session);
    let active = true;

    supabase
      .from("comments")
      .select("*")
      .eq("poem_id", poem.id)
      .order("created_at", { ascending: true })
      .then(async ({ data, error }) => {
        if (!active || error || !data) return;
        const authorIds = [...new Set(data.map((c) => c.author_id).filter(Boolean))];
        let avatarMap = {};
        if (authorIds.length > 0) {
          const { data: profs } = await supabase.from("profiles").select("id, avatar_url").in("id", authorIds);
          (profs || []).forEach((p) => {
            avatarMap[p.id] = p.avatar_url;
          });
        }
        if (active) setComments(data.map((c) => ({ ...c, authorAvatar: c.author_id ? avatarMap[c.author_id] : null })));
      });

    supabase
      .from("ratings")
      .select("*")
      .eq("poem_id", poem.id)
      .then(({ data, error }) => {
        if (active && !error && data) setRatings(data);
      });

    supabase
      .from("likes")
      .select("voter_id")
      .eq("poem_id", poem.id)
      .then(({ data, error }) => {
        if (active && !error && data) setLiked(data.some((r) => r.voter_id === voterId));
      });

    return () => {
      active = false;
    };
  }, [poem.id]);

  const avgRating = ratings.length ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
  const userRating = ratings.find((r) => r.user_id === session?.user?.id)?.rating || 0;

  const handleRate = async (value) => {
    if (!session) return;
    setRatings((prev) => [
      ...prev.filter((r) => r.user_id !== session.user.id),
      { poem_id: poem.id, user_id: session.user.id, rating: value },
    ]);
    const { data, error } = await supabase
      .from("ratings")
      .upsert({ poem_id: poem.id, user_id: session.user.id, rating: value }, { onConflict: "poem_id,user_id" })
      .select()
      .single();
    if (!error && data) {
      setRatings((prev) => [...prev.filter((r) => r.user_id !== session.user.id), data]);
    }
  };

  const toggleLike = async () => {
    const voterId = getVoterId(session);
    const next = !liked;
    const newCount = Math.max(0, likesCount + (next ? 1 : -1));
    setLiked(next);
    setLikesCount(newCount);

    if (next) {
      // Try the likes table first (exists after supabase-likes-fix.sql)
      const { error } = await supabase.from("likes").insert({ poem_id: poem.id, voter_id: voterId });
      if (error && error.code === "42P01") {
        // Table doesn't exist yet — fall back to direct count update
        await supabase.from("poems").update({ likes_count: newCount }).eq("id", poem.id);
      } else if (!error) {
        // Table exists but trigger may not — always sync the count too
        await supabase.from("poems").update({ likes_count: newCount }).eq("id", poem.id);
      }
    } else {
      const { error } = await supabase.from("likes").delete().eq("poem_id", poem.id).eq("voter_id", voterId);
      if (error && error.code === "42P01") {
        await supabase.from("poems").update({ likes_count: newCount }).eq("id", poem.id);
      } else if (!error) {
        await supabase.from("poems").update({ likes_count: newCount }).eq("id", poem.id);
      }
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?poem=${poem.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard unavailable, ignore silently
    }
  };

  const handleReportPoem = async () => {
    await supabase.from("reports").insert({ target_type: "poem", target_id: poem.id, reason: "Signalé depuis la lecture" });
    setPoemReported(true);
  };

  const handleReportComment = async (commentId) => {
    await supabase.from("reports").insert({ target_type: "comment", target_id: commentId, reason: "Signalé depuis la lecture" });
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleEdit = () => {
    editDraft({ ...poem, collection: collection.isFree ? null : collection });
  };

  const handleDeletePoem = async () => {
    if (!window.confirm(`Supprimer le poème « ${poem.title} » ?`)) return;
    if (collection.isFree) {
      await supabase.from("poems").delete().eq("id", poem.id);
      await refresh();
      onDeleted();
      return;
    }
    if (collection.poems.length === 1) {
      // Last poem: delete the whole collection
      await supabase.from("collections").delete().eq("id", collection.id);
      await refresh();
      onDeleted();
      return;
    }
    await supabase.from("poems").delete().eq("id", poem.id);
    await refresh();
    if (poemIndex >= collection.poems.length - 1) setPoemIndex(Math.max(0, poemIndex - 1));
  };

  const handleDeleteCollection = async () => {
    if (!window.confirm(`Supprimer tout le recueil « ${collection.title} » et ses ${collection.poems.length} poèmes ?`)) return;
    await supabase.from("collections").delete().eq("id", collection.id);
    await refresh();
    onDeleted();
  };

  const submitComment = async (content, parentId = null) => {
    if (!content.trim()) return;
    const lastTime = parseInt(localStorage.getItem("last_comment_time") || "0", 10);
    const elapsed = Date.now() - lastTime;
    if (elapsed < 30000) {
      setCommentError(`Attends encore ${Math.ceil((30000 - elapsed) / 1000)}s avant de publier un nouveau commentaire.`);
      return;
    }
    setCommentError("");
    const newComment = {
      poem_id: poem.id,
      parent_id: parentId,
      author: commentAnon ? null : profile?.username || "Anonyme",
      author_id: commentAnon ? null : session?.user?.id || null,
      anonymous: commentAnon,
      content: content.trim(),
    };
    const { data, error } = await supabase.from("comments").insert(newComment).select().single();
    if (!error && data) {
      setComments((prev) => [...prev, { ...data, authorAvatar: commentAnon ? null : profile?.avatar_url }]);
      localStorage.setItem("last_comment_time", String(Date.now()));
      if (parentId) {
        setReplyingTo(null);
        setReplyDraft("");
      } else {
        setDraft("");
      }
    }
  };

  if (bookOpening && !collection.isFree) {
    const sc = collection.sealColor || colorFromString(collection.title);
    return (
      <>
        <BookOpenAnimation spineColor={sc} title={collection.title} seal={collection.seal} />
        <div className="max-w-5xl mx-auto px-6 py-10" style={{ opacity: 0 }} />
      </>
    );
  }

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 overflow-y-auto view-enter"
        style={{ background: "var(--paper)", zIndex: 50 }}
      >
        <div className="max-w-2xl mx-auto px-6 py-10 sm:py-16">
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-2 font-ui text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--ink-light)" }}
            >
              <Minimize2 size={15} />
              Quitter le plein écran
            </button>
            <span className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
              {poemIndex + 1} / {collection.poems.length}
            </span>
          </div>

          <h1 className="font-display italic mb-8" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "var(--ink)" }}>
            {poem.title}
          </h1>

          {poem.image_url && (
            <div className="mb-8 rounded-lg overflow-hidden border" style={{ borderColor: "var(--rule)" }}>
              <img src={poem.image_url} alt={poem.title} className="w-full h-auto object-cover" style={{ maxHeight: 360 }} />
            </div>
          )}

          <div
            className="flex flex-col gap-[0.05em] font-display italic mb-12"
            style={{ fontSize: "1.5rem", lineHeight: "2.4rem", color: "var(--ink)" }}
          >
            {poem.lines.map((line, i) => (
              <span key={i}>{line || "\u00A0"}</span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: "var(--rule)" }}>
            <button
              disabled={poemIndex === 0}
              onClick={() => setPoemIndex(poemIndex - 1)}
              className="flex items-center gap-2 font-ui text-sm px-3 py-2 rounded-full disabled:opacity-30 transition-opacity"
              style={{ color: "var(--ink-light)" }}
            >
              <ArrowLeft size={15} /> Précédent
            </button>
            <button
              disabled={poemIndex === collection.poems.length - 1}
              onClick={() => setPoemIndex(poemIndex + 1)}
              className="flex items-center gap-2 font-ui text-sm px-3 py-2 rounded-full disabled:opacity-30 transition-opacity"
              style={{ color: "var(--ink-light)" }}
            >
              Suivant <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 view-enter">
      <button
        onClick={back}
        className="flex items-center gap-2 font-ui text-sm mb-8 transition-opacity hover:opacity-70"
        style={{ color: "var(--ink-light)" }}
      >
        <ArrowLeft size={15} /> Retour aux recueils
      </button>

      <div className="grid md:grid-cols-[200px_1fr] gap-10">
        {/* Table of contents */}
        <aside className="md:sticky md:top-24 self-start">
          <div className="flex items-center gap-3 mb-5">
            <AuthorBadge avatarUrl={collection.authorAvatar} letter={collection.seal} color={collection.sealColor} size={32} />
            <div>
              <p className="font-display italic text-base" style={{ color: "var(--ink)" }}>
                {collection.isFree ? "Poème libre" : collection.title}
              </p>
              <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                {collection.author_id ? (
                  <span role="button" onClick={() => goToAuthor(collection.author_id)} className="hover:underline">
                    {collection.author}
                  </span>
                ) : (
                  collection.author
                )}
              </p>
            </div>
          </div>
          {!collection.isFree && (
            <>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--sage)" }}>
                Sommaire
              </p>
              <ul className="flex flex-col gap-1 border-l" style={{ borderColor: "var(--rule)" }}>
                {(collection.poems||[]).map((p, i) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setPoemIndex(i)}
                      className="w-full text-left pl-4 py-1.5 font-ui text-sm transition-colors"
                      style={{
                        color: i === poemIndex ? "var(--wine)" : "var(--ink-light)",
                        borderLeft: i === poemIndex ? "2px solid var(--wine)" : "2px solid transparent",
                        marginLeft: "-1px",
                      }}
                    >
                      <span className="font-mono text-xs mr-2">{String(i + 1).padStart(2, "0")}</span>
                      {p.title}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        {/* Poem reader */}
        <article>
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="font-display italic" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "var(--ink)" }}>
              {poem.title}
            </h1>
            <div className="flex items-center gap-2 shrink-0 pt-2">
              <button
                onClick={() => setFullscreen(true)}
                title="Lecture plein écran"
                className="flex items-center gap-1.5 font-ui text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={{ borderColor: "var(--rule)", color: "var(--ink-light)" }}
              >
                <Maximize2 size={13} />
                <span className="hidden sm:inline">Plein écran</span>
              </button>
              <button
                onClick={handleShare}
                title="Copier le lien de ce poème"
                className="flex items-center gap-1.5 font-ui text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={{ borderColor: "var(--rule)", color: "var(--ink-light)" }}
              >
                <Share2 size={13} />
                {shareCopied ? "Lien copié" : "Partager"}
              </button>
              {!canManage && (
                <button
                  onClick={handleReportPoem}
                  disabled={poemReported}
                  title="Signaler ce poème"
                  className="flex items-center gap-1.5 font-ui text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40"
                  style={{ borderColor: "var(--rule)", color: "var(--ink-light)" }}
                >
                  <Flag size={13} />
                  {poemReported ? "Signalé" : "Signaler"}
                </button>
              )}
              {canManage && (
                <>
                  <button
                    onClick={handleEdit}
                    title="Modifier ce poème"
                    className="flex items-center gap-1.5 font-ui text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{ borderColor: "var(--rule)", color: "var(--ink-light)" }}
                  >
                    <PenLine size={13} />
                    <span className="hidden sm:inline">Modifier</span>
                  </button>
                  <button
                    onClick={handleDeletePoem}
                    title="Supprimer ce poème"
                    className="flex items-center gap-1.5 font-ui text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{ borderColor: "var(--rule)", color: "var(--wine)" }}
                  >
                    <Trash2 size={13} />
                    Poème
                  </button>
                  {!collection.isFree && (
                    <button
                      onClick={handleDeleteCollection}
                      title="Supprimer tout le recueil"
                      className="flex items-center gap-1.5 font-ui text-xs px-3 py-1.5 rounded-full border transition-colors"
                      style={{ borderColor: "var(--rule)", color: "var(--wine)" }}
                    >
                      <Trash2 size={13} />
                      Recueil
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {poem.image_url && (
            <div className="mb-8 rounded-lg overflow-hidden border" style={{ borderColor: "var(--rule)" }}>
              <img src={poem.image_url} alt={poem.title} className="w-full h-auto object-cover" style={{ maxHeight: 320 }} />
            </div>
          )}

          <div className="flex gap-5 mb-10">
            <div className="flex flex-col gap-[0.05em] font-mono text-[11px] pt-1 select-none" style={{ color: "var(--rule)" }}>
              {poem.lines.map((line, i) => (
                <span key={i} style={{ visibility: line ? "visible" : "hidden", lineHeight: "2rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              ))}
            </div>
            <div
              className="flex flex-col gap-[0.05em] font-display italic pl-5 border-l"
              style={{ fontSize: "1.35rem", lineHeight: "2rem", color: "var(--ink)", borderColor: "var(--rule)" }}
            >
              {poem.lines.map((line, i) => (
                <span key={i}>{line || "\u00A0"}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t" style={{ borderColor: "var(--rule)" }}>
            <button
              onClick={toggleLike}
              className="flex items-center gap-2 font-ui text-sm px-4 py-2 rounded-full border transition-colors"
              style={{
                borderColor: liked ? "var(--wine)" : "var(--rule)",
                color: liked ? "var(--wine)" : "var(--ink-light)",
              }}
            >
              <Heart size={14} fill={liked ? "var(--wine)" : "none"} />
              {liked ? "Aimé" : "J'aime"}
              <span className="font-mono text-xs" style={{ color: "inherit", opacity: 0.7 }}>
                {likesCount}
              </span>
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-2 font-ui text-sm px-4 py-2 rounded-full border transition-colors"
              style={{
                borderColor: saved ? "var(--sage)" : "var(--rule)",
                color: saved ? "var(--sage)" : "var(--ink-light)",
              }}
            >
              <Bookmark size={14} fill={saved ? "var(--sage)" : "none"} />
              {saved ? "Enregistré" : "Enregistrer"}
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                disabled={poemIndex === 0}
                onClick={() => setPoemIndex(poemIndex - 1)}
                className="font-ui text-sm px-3 py-2 rounded-full disabled:opacity-30 transition-opacity"
                style={{ color: "var(--ink-light)" }}
              >
                <ArrowLeft size={15} />
              </button>
              <span className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
                {poemIndex + 1} / {collection.poems.length}
              </span>
              <button
                disabled={poemIndex === collection.poems.length - 1}
                onClick={() => setPoemIndex(poemIndex + 1)}
                className="font-ui text-sm px-3 py-2 rounded-full disabled:opacity-30 transition-opacity"
                style={{ color: "var(--ink-light)" }}
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Rating */}
          <div
            className="flex items-center justify-between gap-6 mt-6 p-5 rounded-lg border flex-wrap"
            style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--sage)" }}>
                Note moyenne
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={24}
                      fill={i <= Math.round(avgRating) ? "var(--wine)" : "none"}
                      stroke="var(--wine)"
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span className="font-display italic text-xl" style={{ color: "var(--ink)" }}>
                  {ratings.length > 0 ? avgRating.toFixed(1) : "—"}
                </span>
                <span className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                  {ratings.length > 0 ? `(${ratings.length} avis)` : "Pas encore noté"}
                </span>
              </div>
            </div>

            {session ? (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-2 sm:text-right" style={{ color: "var(--sage)" }}>
                  Votre note
                </p>
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => handleRate(i)}
                      onMouseEnter={() => setHoverRating(i)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={30}
                        fill={i <= (hoverRating || userRating) ? "var(--wine)" : "none"}
                        stroke="var(--wine)"
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <span className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
                Connecte-toi pour noter ce poème
              </span>
            )}
          </div>

          {/* Comments */}
          <div className="mt-10 pt-8 border-t" style={{ borderColor: "var(--rule)" }}>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--sage)" }}>
              <MessageCircle size={13} />
              {comments.length} commentaire{comments.length === 1 ? "" : "s"}
            </p>

            <div className="flex flex-col gap-5 mb-6">
              {comments
                .filter((c) => !c.parent_id)
                .map((c) => (
                  <div key={c.id} className="flex flex-col gap-3">
                    <div className="flex gap-3 group">
                      <AuthorBadge
                        avatarUrl={c.anonymous ? null : c.authorAvatar}
                        letter={c.anonymous ? "?" : (c.author || "?").charAt(0).toUpperCase()}
                        color={c.anonymous ? "var(--ink-light)" : colorFromString(c.author || "?")}
                        size={28}
                      />
                      <div className="flex-1">
                        <p className="font-ui text-xs mb-0.5" style={{ color: "var(--ink-light)" }}>
                          {c.anonymous || !c.author_id ? (c.anonymous ? "Anonyme" : c.author) : (
                            <button onClick={() => goToAuthor(c.author_id)} className="hover:underline transition-opacity">
                              {c.author}
                            </button>
                          )}
                        </p>
                        <p className="font-ui text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                          {c.content}
                        </p>
                        {session && (
                          <button
                            onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                            className="font-ui text-xs mt-1 transition-opacity hover:opacity-70"
                            style={{ color: "var(--sage)" }}
                          >
                            Répondre
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!profile?.is_moderator && (
                          <button onClick={() => handleReportComment(c.id)} title="Signaler ce commentaire">
                            <Flag size={13} style={{ color: "var(--ink-light)" }} />
                          </button>
                        )}
                        {profile?.is_moderator && (
                          <button onClick={() => handleDeleteComment(c.id)} title="Supprimer ce commentaire">
                            <Trash2 size={13} style={{ color: "var(--wine)" }} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Replies */}
                    {comments.filter((r) => r.parent_id === c.id).length > 0 && (
                      <div className="flex flex-col gap-3 pl-10 border-l" style={{ borderColor: "var(--rule)" }}>
                        {comments
                          .filter((r) => r.parent_id === c.id)
                          .map((r) => (
                            <div key={r.id} className="flex gap-3 group">
                              <AuthorBadge
                                avatarUrl={r.anonymous ? null : r.authorAvatar}
                                letter={r.anonymous ? "?" : (r.author || "?").charAt(0).toUpperCase()}
                                color={r.anonymous ? "var(--ink-light)" : colorFromString(r.author || "?")}
                                size={24}
                              />
                              <div className="flex-1">
                                <p className="font-ui text-xs mb-0.5" style={{ color: "var(--ink-light)" }}>
                                  {r.anonymous || !r.author_id ? (r.anonymous ? "Anonyme" : r.author) : (
                                    <button onClick={() => goToAuthor(r.author_id)} className="hover:underline transition-opacity">
                                      {r.author}
                                    </button>
                                  )}
                                </p>
                                <p className="font-ui text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                                  {r.content}
                                </p>
                                {session && (
                                  <button
                                    onClick={() => setReplyingTo(replyingTo === r.id ? null : r.id)}
                                    className="font-ui text-xs mt-1 transition-opacity hover:opacity-70"
                                    style={{ color: "var(--sage)" }}
                                  >
                                    Répondre
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                {!profile?.is_moderator && (
                                  <button onClick={() => handleReportComment(r.id)} title="Signaler ce commentaire">
                                    <Flag size={13} style={{ color: "var(--ink-light)" }} />
                                  </button>
                                )}
                                {profile?.is_moderator && (
                                  <button onClick={() => handleDeleteComment(r.id)} title="Supprimer ce commentaire">
                                    <Trash2 size={13} style={{ color: "var(--wine)" }} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Reply box — shown when replying to the main comment OR to any reply in this thread */}
                    {(replyingTo === c.id || comments.filter(r => r.parent_id === c.id).some(r => r.id === replyingTo)) && (
                      <div className="flex items-center gap-2 pl-10">
                        <input
                          value={replyDraft}
                          onChange={(e) => setReplyDraft(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submitComment(replyDraft, c.id)}
                          placeholder={(() => {
                            if (replyingTo === c.id) return `Répondre à ${c.anonymous ? "Anonyme" : c.author}…`;
                            const target = comments.find(r => r.id === replyingTo);
                            return `Répondre à ${target?.anonymous ? "Anonyme" : target?.author || ""}…`;
                          })()}
                          className="flex-1 font-ui text-sm px-4 py-2 rounded-full border bg-transparent outline-none focus:ring-1"
                          style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
                          autoFocus
                        />
                        <button
                          onClick={() => submitComment(replyDraft, c.id)}
                          disabled={!replyDraft.trim()}
                          className="flex items-center gap-1.5 font-ui text-xs px-4 py-2 rounded-full disabled:opacity-30 transition-opacity"
                          style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
                        >
                          <Send size={12} />
                          Envoyer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              {comments.length === 0 && (
                <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
                  Aucun commentaire pour le moment — le premier mot est pour vous.
                </p>
              )}
            </div>

            {/* New comment */}
            <div className="flex flex-col gap-3">
              {commentError && (
                <p className="font-ui text-xs" style={{ color: "var(--wine)" }}>
                  {commentError}
                </p>
              )}
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Laisser un commentaire..."
                rows={2}
                className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none resize-none"
                style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-ui text-xs cursor-pointer" style={{ color: "var(--ink-light)" }}>
                  <input
                    type="checkbox"
                    checked={commentAnon}
                    onChange={(e) => setCommentAnon(e.target.checked)}
                    className="accent-[var(--ink)]"
                  />
                  <EyeOff size={13} />
                  Commenter en anonyme
                </label>
                <button
                  onClick={() => submitComment(draft)}
                  disabled={!draft.trim()}
                  className="flex items-center gap-2 font-ui text-sm px-4 py-2 rounded-full disabled:opacity-30 transition-opacity"
                  style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
                >
                  <Send size={13} />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

const SEAL_COLORS = [
  "#8B3A4A", "#6E7F5C", "#3A4A6E", "#7A5C3A", "#5C3A7A",
  "#2E6B6B", "#8B5E3C", "#4A3A6E", "#6E3A5C", "#3A6E4A",
  "#8B6B2E", "#2E4A6E", "#6B2E6B", "#3A5C3A", "#8B3A3A",
  "#4A6B6B", "#6B4A2E", "#2E6B4A", "#6B2E3A", "#4A4A8B",
];

function colorFromString(str) {
  if (!str) return SEAL_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return SEAL_COLORS[Math.abs(hash) % SEAL_COLORS.length];
}

function AuthView({ onSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorMsg("");
    setSubmitting(true);

    if (mode === "signup") {
      if (!username.trim()) {
        setErrorMsg("Choisis un pseudo.");
        setSubmitting(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) {
        setErrorMsg(error?.message || "Inscription impossible.");
        setSubmitting(false);
        return;
      }
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: username.trim(),
      });
      if (profileError) {
        setErrorMsg("Compte créé, mais le profil n'a pas pu être enregistré (pseudo déjà pris ?).");
        setSubmitting(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    onSuccess();
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 view-enter">
      <p className="font-mono text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--sage)" }}>
        {mode === "login" ? "Connexion" : "Créer un compte"}
      </p>
      <h1 className="font-display italic text-3xl mb-10" style={{ color: "var(--ink)" }}>
        {mode === "login" ? "Te revoir, c'est un plaisir" : "Rejoindre Dreams"}
      </h1>

      <div className="flex flex-col gap-5">
        {mode === "signup" && (
          <label className="flex flex-col gap-2">
            <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
              Pseudo
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex. Sasha"
              className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            />
          </label>
        )}

        <label className="flex flex-col gap-2">
          <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
            style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
            Mot de passe
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
            style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
          />
        </label>

        {errorMsg && (
          <p className="font-ui text-sm" style={{ color: "var(--wine)" }}>
            {errorMsg}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!email || !password || submitting}
          className="font-ui text-sm px-6 py-3 rounded-full disabled:opacity-30 transition-opacity"
          style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
        >
          {submitting ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setErrorMsg("");
          }}
          className="font-ui text-sm text-left"
          style={{ color: "var(--ink-light)" }}
        >
          {mode === "login" ? "Pas encore de compte ? Crée-le ici" : "Déjà un compte ? Connecte-toi"}
        </button>
      </div>
    </div>
  );
}

function WriteView({ session, profile, collections, editingDraft, goToAuth, onPublished, onSavedDraft }) {
  const myCollections = (collections || []).filter((c) => c.author_id === session?.user?.id);

  const [target, setTarget] = useState("new"); // "new" | "existing"
  const [existingId, setExistingId] = useState(myCollections[0]?.id || "");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [cover, setCover] = useState("");
  const [poemTitle, setPoemTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingDraft) {
      setPoemTitle(editingDraft.title);
      setText(editingDraft.content);
      setImage(editingDraft.image_url || "");
    }
  }, [editingDraft]);

  const handleSave = async (status) => {
    setSubmitting(true);
    setErrorMsg("");

    if (editingDraft) {
      const { error } = await supabase
        .from("poems")
        .update({ title: poemTitle.trim(), content: text, image_url: image.trim() || null, status })
        .eq("id", editingDraft.id);
      setSubmitting(false);
      if (error) {
        setErrorMsg("La mise à jour a échoué. Réessaie.");
        return;
      }
      if (status === "published") {
        if (onPublished) await onPublished();
      } else if (onSavedDraft) {
        await onSavedDraft();
      }
      return;
    }

    let collectionId = existingId;

    if (target === "new") {
      const authorName = anonymous ? "Anonyme" : profile?.username || "Anonyme";
      const seal = authorName.charAt(0).toUpperCase();
      const sealColor = SEAL_COLORS[Math.floor(Math.random() * SEAL_COLORS.length)];

      const { data: col, error: colError } = await supabase
        .from("collections")
        .insert({
          title: title.trim(),
          author: authorName,
          author_id: session.user.id,
          theme: theme.trim() || "Inédit",
          cover_url: cover.trim() || null,
          seal,
          seal_color: sealColor,
        })
        .select()
        .single();

      if (colError || !col) {
        setErrorMsg("Impossible de publier le recueil. Réessaie dans un instant.");
        setSubmitting(false);
        return;
      }
      collectionId = col.id;
    }

    let poemPayload;
    if (target === "free") {
      const authorName = anonymous ? "Anonyme" : profile?.username || "Anonyme";
      poemPayload = {
        collection_id: null,
        author_id: session.user.id,
        author: authorName,
        title: poemTitle.trim(),
        content: text,
        image_url: image.trim() || null,
        position: 0,
        status,
      };
    } else {
      const targetCollection = myCollections.find((c) => c.id === collectionId);
      const position = target === "existing" && targetCollection ? targetCollection.poems.length : 0;
      poemPayload = {
        collection_id: collectionId,
        title: poemTitle.trim(),
        content: text,
        image_url: image.trim() || null,
        position,
        status,
      };
    }

    const { error: poemError } = await supabase.from("poems").insert(poemPayload);

    setSubmitting(false);

    if (poemError) {
      setErrorMsg("Le poème n'a pas pu être ajouté. Réessaie.");
      return;
    }

    if (status === "published") {
      if (onPublished) await onPublished();
    } else if (onSavedDraft) {
      await onSavedDraft();
    }
  };

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="font-mono text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--sage)" }}>
          Nouveau recueil
        </p>
        <h1 className="font-display italic text-2xl mb-4" style={{ color: "var(--ink)" }}>
          Connecte-toi pour écrire
        </h1>
        <p className="font-ui text-sm mb-6" style={{ color: "var(--ink-light)" }}>
          Un compte permet de retrouver tes recueils et de les gérer depuis ton profil.
        </p>
        <button
          onClick={goToAuth}
          className="font-ui text-sm px-6 py-3 rounded-full"
          style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
        >
          Se connecter / créer un compte
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 view-enter">
      <p className="font-mono text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--sage)" }}>
        {editingDraft ? (editingDraft.status === "published" ? "Modifier" : "Brouillon") : "Nouveau recueil"}
      </p>
      <h1 className="font-display italic text-3xl mb-2" style={{ color: "var(--ink)" }}>
        {editingDraft ? (editingDraft.status === "published" ? "Modifier ce poème" : "Continuer ce poème") : "Écrire quelque chose"}
      </h1>
      {editingDraft && (
        <p className="font-ui text-sm mb-8" style={{ color: "var(--ink-light)" }}>
          {editingDraft.collection ? <>Dans le recueil « {editingDraft.collection.title} »</> : "Poème libre"}
        </p>
      )}
      {!editingDraft && <div className="mb-10" />}

      <div className="flex flex-col gap-6">
        {!editingDraft && (
          <div className="flex items-center gap-2 p-1 rounded-full border self-start flex-wrap" style={{ borderColor: "var(--rule)" }}>
            <button
              onClick={() => setTarget("new")}
              className="font-ui text-xs px-4 py-2 rounded-full transition-colors"
              style={{
                background: target === "new" ? "var(--ink)" : "transparent",
                color: target === "new" ? "var(--paper-warm)" : "var(--ink-light)",
              }}
            >
              Nouveau recueil
            </button>
            <button
              onClick={() => setTarget("free")}
              className="font-ui text-xs px-4 py-2 rounded-full transition-colors"
              style={{
                background: target === "free" ? "var(--ink)" : "transparent",
                color: target === "free" ? "var(--paper-warm)" : "var(--ink-light)",
              }}
            >
              Poème libre
            </button>
            {myCollections.length > 0 && (
              <button
                onClick={() => setTarget("existing")}
                className="font-ui text-xs px-4 py-2 rounded-full transition-colors"
                style={{
                  background: target === "existing" ? "var(--ink)" : "transparent",
                  color: target === "existing" ? "var(--paper-warm)" : "var(--ink-light)",
                }}
              >
                Ajouter à un recueil existant
              </button>
            )}
          </div>
        )}

        {!editingDraft && target === "existing" && myCollections.length > 0 && (
          <label className="flex flex-col gap-2">
            <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
              Recueil
            </span>
            <select
              value={existingId}
              onChange={(e) => setExistingId(Number(e.target.value))}
              className="font-display italic text-lg px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            >
              {myCollections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({(c.poems||[]).length} poème{(c.poems||[]).length === 1 ? "" : "s"})
                </option>
              ))}
            </select>
          </label>
        )}

        {!editingDraft && target === "new" && (
          <>
            <label className="flex flex-col gap-2">
              <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
                Titre du recueil
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Saisons obliques"
                className="font-display italic text-xl px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
                style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
                Thème (optionnel)
              </span>
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex. Nature & solitude"
                className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
                style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
              />
            </label>

            <ImageField label="Image de couverture (optionnel)" value={cover} onChange={setCover} session={session} maxHeightPreview={160} />
          </>
        )}

        <label className="flex flex-col gap-2">
          <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
            Titre du poème
          </span>
          <input
            value={poemTitle}
            onChange={(e) => setPoemTitle(e.target.value)}
            placeholder="Ex. Premier jour de pluie"
            className="font-display italic text-lg px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
            style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
            Le poème
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Un vers par ligne...\n\nLes lignes vides créent des strophes."}
            rows={10}
            className="font-display italic text-lg px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1 resize-none leading-relaxed"
            style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
          />
        </label>

        <ImageField label="Image d'illustration (optionnel)" value={image} onChange={setImage} session={session} />

        {!editingDraft && (target === "new" || target === "free") && (
          <label className="flex items-center gap-2 font-ui text-sm cursor-pointer" style={{ color: "var(--ink-light)" }}>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="accent-[var(--ink)]"
            />
            <EyeOff size={14} />
            Publier en anonyme
            <span className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
              — votre nom n'apparaîtra pas, seulement « Anonyme »
            </span>
          </label>
        )}

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <button
            onClick={() => handleSave("draft")}
            disabled={(!editingDraft && target === "new" && !title.trim()) || !poemTitle.trim() || !text.trim() || submitting}
            className="flex items-center gap-2 font-ui text-sm px-6 py-3 rounded-full border disabled:opacity-30 transition-opacity"
            style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
          >
            <FileEdit size={14} />
            {submitting
              ? "..."
              : editingDraft
              ? editingDraft.status === "published"
                ? "Repasser en brouillon"
                : "Enregistrer le brouillon"
              : "Enregistrer comme brouillon"}
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={(!editingDraft && target === "new" && !title.trim()) || !poemTitle.trim() || !text.trim() || submitting}
            className="font-ui text-sm px-6 py-3 rounded-full disabled:opacity-30 transition-opacity"
            style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
          >
            {submitting
              ? "..."
              : editingDraft
              ? editingDraft.status === "published"
                ? "Mettre à jour"
                : "Publier"
              : "Publier"}
          </button>
          {errorMsg && (
            <span className="font-ui text-sm" style={{ color: "var(--wine)" }}>
              {errorMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileView({ collections, draftPoems, freePoems, openCollection, openFreePoem, session, profile, setProfile, goToAuth, editDraft, onWrite }) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setUsername(profile?.username || "");
    setBio(profile?.bio || "");
    setAvatarUrl(profile?.avatar_url || "");
  }, [profile]);

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="font-mono text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--sage)" }}>
          Profil
        </p>
        <h1 className="font-display italic text-2xl mb-4" style={{ color: "var(--ink)" }}>
          Pas encore connecté
        </h1>
        <p className="font-ui text-sm mb-6" style={{ color: "var(--ink-light)" }}>
          Crée un compte pour avoir ton propre profil, tes recueils et ta bio.
        </p>
        <button
          onClick={goToAuth}
          className="font-ui text-sm px-6 py-3 rounded-full"
          style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
        >
          Se connecter / créer un compte
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>
          Chargement du profil...
        </p>
      </div>
    );
  }

  const mine = collections.filter((c) => c.author_id === session.user.id);
  const myFreePoems = (draftPoems ? draftPoems : []).length >= 0
    ? (freePoems || []).filter(p => p.author_id === session.user.id)
    : [];
  const myDrafts = (draftPoems || []).filter(
    (d) => d.collection?.author_id === session.user.id || d.author_id === session.user.id
  );

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      .eq("id", session.user.id)
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      setErrorMsg("Ce pseudo est peut-être déjà pris.");
      return;
    }
    setProfile(data);
    setEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const spineColor = (c) => c.sealColor || colorFromString(c.title);

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16 view-enter">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden mb-8 mt-8" style={{
        background: `linear-gradient(135deg, ${colorFromString(profile.username)}22 0%, var(--paper-warm) 100%)`,
        border: "1px solid var(--rule)",
        minHeight: 180,
      }}>
        {/* Subtle petal decoration top-right */}
        <svg className="absolute top-0 right-0 opacity-10 pointer-events-none" width="200" height="160" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="160" cy="30" rx="50" ry="22" fill={colorFromString(profile.username)} transform="rotate(-20 160 30)"/>
          <ellipse cx="180" cy="80" rx="35" ry="15" fill={colorFromString(profile.username)} transform="rotate(15 180 80)"/>
          <ellipse cx="130" cy="10" rx="28" ry="12" fill={colorFromString(profile.username)} transform="rotate(-35 130 10)"/>
        </svg>

        <div className="relative p-8 flex items-start gap-7 flex-wrap">
          {/* Big avatar */}
          <div className="shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="rounded-full object-cover" style={{ width: 96, height: 96, border: `3px solid ${colorFromString(profile.username)}60` }} />
            ) : (
              <WaxSeal letter={profile.username.charAt(0).toUpperCase()} color={colorFromString(profile.username)} size={96} />
            )}
          </div>

          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="font-display italic" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--ink)", lineHeight: 1.1 }}>
                {profile.username}
              </h1>
              {profile.is_moderator && (
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "var(--sage)", color: "var(--paper-warm)" }}>
                  <ShieldCheck size={10} /> Modo
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <span className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
                {mine.length} recueil{mine.length === 1 ? "" : "s"}
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
                {myFreePoems.length} poème{myFreePoems.length === 1 ? "" : "s"} libre{myFreePoems.length === 1 ? "" : "s"}
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
                {mine.reduce((s, c) => s + (c.poems||[]).reduce((ss, p) => ss + (p.likes_count||0), 0), 0) + myFreePoems.reduce((s, p) => s + (p.likes_count||0), 0)} like{mine.reduce((s,c)=>s+(c.poems||[]).reduce((ss,p)=>ss+(p.likes_count||0),0),0)+myFreePoems.reduce((s,p)=>s+(p.likes_count||0),0)===1?"":"s"} au total
              </span>
            </div>

            {!editing && (
              profile.bio ? (
                <p className="font-display italic text-base leading-relaxed" style={{ color: "var(--ink)", opacity: 0.85, maxWidth: 480 }}>
                  « {profile.bio} »
                </p>
              ) : (
                <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
                  Aucune bio — ajoute quelques mots sur toi.
                </p>
              )
            )}
          </div>

          {/* Actions top-right */}
          <div className="flex items-center gap-3 shrink-0 self-start">
            {!editing && (
              <button onClick={() => setEditing(true)} className="font-ui text-xs px-4 py-2 rounded-full border transition-opacity hover:opacity-70" style={{ borderColor: "var(--rule)", color: "var(--ink)" }}>
                Modifier le profil
              </button>
            )}
            <button onClick={handleLogout} className="flex items-center gap-1.5 font-ui text-xs" style={{ color: "var(--ink-light)" }}>
              <LogOut size={13} /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* ── EDIT FORM ── */}
      {editing && (
        <div className="flex flex-col gap-4 mb-10 p-6 rounded-xl border" style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>Pseudo</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none" style={{ borderColor: "var(--rule)", color: "var(--ink)" }} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>Bio</span>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Quelques mots sur toi..." className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none resize-none" style={{ borderColor: "var(--rule)", color: "var(--ink)" }} />
            </label>
          </div>
          <ImageField label="Photo de profil" value={avatarUrl} onChange={setAvatarUrl} session={session} maxHeightPreview={120} />
          {errorMsg && <p className="font-ui text-sm" style={{ color: "var(--wine)" }}>{errorMsg}</p>}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={!username.trim() || saving} className="font-ui text-sm px-5 py-2.5 rounded-full disabled:opacity-30" style={{ background: "var(--ink)", color: "var(--paper-warm)" }}>
              {saving ? "..." : "Enregistrer"}
            </button>
            <button onClick={() => setEditing(false)} className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── MES RECUEILS — book cards ── */}
      {mine.length > 0 && (
        <section className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-2" style={{ color: "var(--sage)" }}>
            <BookOpen size={12} /> Mes recueils
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mine.map((c) => {
              const sc = spineColor(c);
              const totalLikes = (c.poems||[]).reduce((s,p) => s+(p.likes_count||0), 0);
              return (
                <button key={c.id} onClick={() => openCollection(c, 0)} className="text-left group relative">
                  <div className="relative overflow-hidden transition-all duration-300" style={{
                    borderRadius: "3px 8px 8px 3px",
                    boxShadow: `-3px 0 8px rgba(0,0,0,0.6), 4px 4px 24px rgba(0,0,0,0.5)`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow=`-3px 0 12px rgba(0,0,0,0.8),8px 10px 36px rgba(0,0,0,0.65)`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`-3px 0 8px rgba(0,0,0,0.6),4px 4px 24px rgba(0,0,0,0.5)`; }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 10, background: `linear-gradient(to bottom, ${sc}dd, ${sc}88)` }}>
                      <div className="absolute left-[3px] top-3 bottom-3 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />
                    </div>
                    <div className="relative pl-[10px]" style={{ height: 200 }}>
                      {c.cover_url ? (
                        <img src={c.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ left: 10 }} />
                      ) : (
                        <div className="absolute inset-0" style={{ left: 10, background: `linear-gradient(160deg, #0F0E18 0%, ${sc}22 60%, #0F0E18 100%)` }} />
                      )}
                      <div className="absolute inset-0 z-[1]" style={{ left: 10, background: c.cover_url ? `linear-gradient(160deg,rgba(8,6,20,0.85) 0%,${sc}55 50%,rgba(5,4,15,0.92) 100%)` : `linear-gradient(160deg,rgba(8,6,20,0.6) 0%,transparent 60%,rgba(5,4,15,0.7) 100%)` }} />
                      <svg className="absolute inset-0 w-full h-full z-[2] pointer-events-none" style={{ left: 10 }} viewBox="0 0 150 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="25" cy="30" rx="14" ry="6" fill={sc} opacity="0.45" transform="rotate(-30 25 30)"/>
                        <ellipse cx="128" cy="22" rx="11" ry="4.5" fill={sc} opacity="0.3" transform="rotate(20 128 22)"/>
                        <circle cx="118" cy="75" r="1.8" fill="#C9A87C" opacity="0.4"/>
                      </svg>
                      <div className="absolute z-[3]" style={{ top: 10, left: 20, right: 10 }}>
                        <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(201,168,124,0.5), transparent)" }} />
                      </div>
                      <div className="absolute inset-0 z-[3] flex items-center justify-center" style={{ left: 10 }}>
                        <span style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontSize: 64, fontWeight: 300, lineHeight: 1, color: sc, opacity: c.cover_url ? 0.3 : 0.55, textShadow: `0 0 24px ${sc}` }}>
                          {c.seal}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 z-[4]" style={{ paddingLeft: 10 }}>
                        <div className="relative px-3 pb-3 pt-2">
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(5,4,16,0.95))" }} />
                          <div className="relative">
                            <p style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontSize: 13, color: "#F0E8D8", marginBottom: 2, lineHeight: 1.3 }}>{c.title}</p>
                            <p style={{ fontSize: 10, color: "rgba(201,168,124,0.7)", letterSpacing: "0.04em" }}>{c.theme} · {(c.poems||[]).length} poème{(c.poems||[]).length===1?"":"s"}{totalLikes > 0 ? ` · ❤ ${totalLikes}` : ""}</p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-0 top-0 bottom-0 z-[5]" style={{ width: 5, background: "repeating-linear-gradient(to bottom,#1E1A2B,#1E1A2B 2px,rgba(201,168,124,0.06) 2px,rgba(201,168,124,0.06) 3px)", borderRadius: "0 8px 8px 0" }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── POÈMES LIBRES ── */}
      {myFreePoems.length > 0 && (
        <section className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-2" style={{ color: "var(--sage)" }}>
            <PenLine size={12} /> Poèmes libres
          </p>
          <div className="flex flex-col gap-4">
            {myFreePoems.map((p) => {
              const preview = (p.lines || []).filter(l => l.trim()).slice(0, 3);
              return (
                <button key={p.id} onClick={() => openFreePoem(p)}
                  className="text-left p-5 rounded-xl border transition-all hover:shadow-md"
                  style={{ background: "var(--paper-warm)", borderColor: "var(--rule)", borderLeft: `3px solid ${colorFromString(p.title)}` }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="font-display italic text-xl" style={{ color: "var(--ink)" }}>{p.title}</p>
                    <div className="flex items-center gap-1 shrink-0" style={{ color: "var(--wine)" }}>
                      <Heart size={13} fill={p.likes_count > 0 ? "var(--wine)" : "none"} />
                      <span className="font-mono text-xs">{p.likes_count}</span>
                    </div>
                  </div>
                  <div className="font-display italic text-sm leading-relaxed" style={{ color: "var(--ink-light)" }}>
                    {preview.map((line, i) => <p key={i}>{line}</p>)}
                    {(p.lines||[]).filter(l=>l.trim()).length > 3 && (
                      <p className="font-ui not-italic text-xs mt-1" style={{ color: "var(--ink-light)", opacity: 0.5 }}>…</p>
                    )}
                  </div>
                  <p className="font-mono text-[10px] mt-3" style={{ color: "var(--ink-light)", opacity: 0.5 }}>
                    {timeAgo(p.updated_at || p.created_at)}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── BROUILLONS ── */}
      {myDrafts.length > 0 && (
        <section>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--sage)" }}>
            <FileEdit size={12} /> Brouillons
          </p>
          <div className="flex flex-col gap-3">
            {myDrafts.map((d) => (
              <button key={d.id} onClick={() => editDraft(d)}
                className="flex items-center justify-between p-4 rounded-lg border text-left hover:shadow-sm transition-all"
                style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}>
                <div>
                  <p className="font-display italic text-base" style={{ color: "var(--ink)" }}>{d.title || "Sans titre"}</p>
                  <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>{d.collection?.title || "Poème libre"}</p>
                </div>
                <span className="font-ui text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: "var(--rule)", color: "var(--ink-light)" }}>
                  Continuer →
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {mine.length === 0 && myFreePoems.length === 0 && myDrafts.length === 0 && (
        <div className="text-center py-16">
          <p className="font-display italic text-2xl mb-4" style={{ color: "var(--ink-light)" }}>
            Rien encore publié.
          </p>
          <button onClick={onWrite} className="font-ui text-sm px-6 py-3 rounded-full" style={{ background: "var(--ink)", color: "var(--paper-warm)" }}>
            Écrire quelque chose
          </button>
        </div>
      )}
    </div>
  );
}

function SideSnow() {
  const flakes = Array.from({ length: 28 }, (_, i) => ({
    left: Math.random() * 100,
    size: 1.5 + (i % 4),
    duration: 18 + (i % 8) * 5,
    delay: -(i * 2.1),
    opacity: 0.3 + (i % 4) * 0.1,
  }));
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {flakes.map((f, i) => (
        <div key={i} className="absolute rounded-full" style={{ left: `${f.left}%`, top: "-4%", width: f.size, height: f.size, background: "#FFFFFF", opacity: f.opacity, animation: `snowfall ${f.duration}s linear infinite`, animationDelay: `${f.delay}s` }} />
      ))}
    </div>
  );
}

function SideRain({ heavy }) {
  const count = heavy ? 22 : 12;
  const drops = Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 110 - 5,
    length: heavy ? 10 + (i % 3) * 5 : 8 + (i % 3) * 4,
    width: heavy ? 1 : 0.8,
    duration: heavy ? 1.8 + (i % 4) * 0.4 : 2.5 + (i % 4) * 0.5,
    delay: -(Math.random() * 3),
    opacity: heavy ? 0.14 + (i % 3) * 0.06 : 0.07 + (i % 3) * 0.03,
  }));
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {drops.map((d, i) => (
        <div key={i} className="absolute" style={{
          left: `${d.left}%`, top: "-8%",
          width: d.width, height: d.length, borderRadius: 2,
          background: heavy ? "rgba(160,180,220,0.7)" : "rgba(180,195,220,0.6)",
          opacity: d.opacity,
          transform: "rotate(12deg)",
          animation: `rainfall ${d.duration}s linear infinite`,
          animationDelay: `${d.delay}s`,
        }} />
      ))}
    </div>
  );
}

function SideLeaves() {
  const LEAF_COLORS = ["#C4623A","#D4892A","#8B3A1A","#A65C20","#D4A030","#7A3A10"];
  const leaves = Array.from({ length: 18 }, (_, i) => ({
    left: Math.random() * 105,
    color: LEAF_COLORS[i % LEAF_COLORS.length],
    size: 8 + (i % 4) * 4,
    duration: 12 + (i % 6) * 4,
    delay: -(Math.random() * 15),
    drift: (Math.random() - 0.5) * 60,
    rotation: Math.random() * 360,
  }));
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {leaves.map((l, i) => (
        <svg key={i} className="absolute" style={{
          left: `${l.left}%`, top: "-4%",
          width: l.size, height: l.size * 1.3, opacity: 0.75,
          animation: `leaffall ${l.duration}s ease-in infinite`,
          animationDelay: `${l.delay}s`,
          "--drift": `${l.drift}px`, "--rot": `${l.rotation}deg`,
        }} viewBox="0 0 20 26" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0 C16 4 20 10 18 18 C14 24 6 24 2 18 C0 10 4 4 10 0Z" fill={l.color} opacity="0.88"/>
          <line x1="10" y1="2" x2="10" y2="22" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8"/>
        </svg>
      ))}
    </div>
  );
}

function SideSakura() {
  const SAKURA = ["#F4B8C8","#F0A0B8","#E8C0D0","#F8D0DC","#EBA8BC","#F5C0CC"];
  const petals = Array.from({ length: 22 }, (_, i) => ({
    left: Math.random() * 110 - 5,
    color: SAKURA[i % SAKURA.length],
    w: 10 + (i % 3) * 4, h: 7 + (i % 3) * 3,
    duration: 14 + (i % 7) * 3,
    delay: -(Math.random() * 18),
    drift: (Math.random() - 0.5) * 80,
    rotation: Math.random() * 360,
  }));
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {petals.map((p, i) => (
        <svg key={i} className="absolute" style={{
          left: `${p.left}%`, top: "-3%", width: p.w, height: p.h,
          animation: `sakurafall ${p.duration}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
          "--drift": `${p.drift}px`, "--rot": `${p.rotation}deg`,
        }} viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="15" cy="10" rx="14" ry="8" fill={p.color} opacity="0.82"/>
          <ellipse cx="15" cy="10" rx="8" ry="5" fill="rgba(255,255,255,0.22)"/>
        </svg>
      ))}
      <div className="absolute rounded-full" style={{ top: "-10%", right: "-5%", width: 280, height: 280, background: "radial-gradient(circle, rgba(244,184,200,0.1), transparent 70%)", filter: "blur(20px)" }} />
    </div>
  );
}

function SideWind() {
  const streaks = Array.from({ length: 10 }, (_, i) => ({
    top: 8 + i * 9,
    width: 60 + (i % 5) * 30,
    duration: 3 + (i % 4),
    delay: -(i * 0.8),
    opacity: 0.05 + (i % 3) * 0.02,
  }));
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {streaks.map((s, i) => (
        <div key={i} style={{
          position: "absolute", top: `${s.top}%`,
          left: i % 2 === 0 ? "-10%" : "auto", right: i % 2 !== 0 ? "-10%" : "auto",
          width: s.width, height: 1,
          background: "linear-gradient(to right, transparent, rgba(200,210,240,0.35), transparent)",
          borderRadius: 1, opacity: s.opacity,
          animation: `${i % 2 === 0 ? "windstreakR" : "windstreakL"} ${s.duration}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

function SideStorm() {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setFlash(true);
        setTimeout(() => { setFlash(false); setTimeout(() => { setFlash(true); setTimeout(() => setFlash(false), 55); }, 100); }, 70);
        schedule();
      }, 3500 + Math.random() * 7000);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <SideRain heavy />
      {flash && <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, background: "rgba(180,200,255,0.07)" }} aria-hidden="true" />}
      {flash && (
        <svg className="fixed pointer-events-none" style={{ top: 0, right: "12%", zIndex: 1, width: 55, height: 130, opacity: 0.38 }} viewBox="0 0 55 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <polyline points="36,0 16,60 30,60 10,130" fill="none" stroke="rgba(200,220,255,0.95)" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      )}
    </>
  );
}

function AuthorView({ authorId, session, collections, freePoems, openCollection, openFreePoem, back, goToDM }) {
  const [authorProfile, setAuthorProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", authorId)
      .single()
      .then(({ data }) => {
        if (active) setAuthorProfile(data || null);
      });
    if (session) {
      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", session.user.id)
        .eq("followed_id", authorId)
        .maybeSingle()
        .then(({ data }) => {
          if (active) setIsFollowing(!!data);
        });
    }
    if (active) setLoading(false);
    return () => {
      active = false;
    };
  }, [authorId, session]);

  const toggleFollow = async () => {
    if (!session) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", session.user.id).eq("followed_id", authorId);
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: session.user.id, followed_id: authorId });
      setIsFollowing(true);
    }
  };

  const authorCollections = collections.filter((c) => c.author_id === authorId);
  const authorFreePoems = (freePoems || []).filter((p) => p.author_id === authorId);
  const totalLikes = authorCollections.reduce((sum, c) => sum + (c.poems || []).reduce((s, p) => s + (p.likes_count || 0), 0), 0)
    + authorFreePoems.reduce((s, p) => s + (p.likes_count || 0), 0);
  const isSelf = session?.user?.id === authorId;

  if (loading || !authorProfile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>
          Chargement du profil...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 view-enter">
      <button onClick={back} className="flex items-center gap-2 font-ui text-sm mb-6 transition-opacity hover:opacity-70" style={{ color: "var(--ink-light)" }}>
        <ArrowLeft size={15} /> Retour
      </button>

      <div className="relative rounded-2xl overflow-hidden mb-8 p-7" style={{
        background: `linear-gradient(135deg, ${colorFromString(authorProfile.username)}1A 0%, var(--paper-warm) 100%)`,
        border: "1px solid var(--rule)",
      }}>
        <div className="flex items-start gap-6 flex-wrap relative">
          {authorProfile.avatar_url ? (
            <img src={authorProfile.avatar_url} alt={authorProfile.username} className="rounded-full object-cover shrink-0" style={{ width: 88, height: 88, border: `3px solid ${colorFromString(authorProfile.username)}55` }} />
          ) : (
            <WaxSeal letter={authorProfile.username.charAt(0).toUpperCase()} color={colorFromString(authorProfile.username)} size={88} />
          )}
          <div className="flex-1 min-w-[160px]">
            <h1 className="font-display italic mb-1" style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)", color: "var(--ink)", lineHeight: 1.1 }}>
              {authorProfile.username}
            </h1>
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <span className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>{authorCollections.length} recueil{authorCollections.length===1?"":"s"}</span>
              <span className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>{authorFreePoems.length} poème{authorFreePoems.length===1?"":"s"} libre{authorFreePoems.length===1?"":"s"}</span>
              <span className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>{totalLikes} like{totalLikes===1?"":"s"}</span>
            </div>
            {authorProfile.bio && (
              <p className="font-display italic text-base leading-relaxed" style={{ color: "var(--ink)", opacity: 0.8, maxWidth: 420 }}>
                « {authorProfile.bio} »
              </p>
            )}
          </div>
          {session && !isSelf && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button onClick={toggleFollow} className="flex items-center gap-2 font-ui text-sm px-5 py-2.5 rounded-full transition-colors"
                style={isFollowing ? { border: "1px solid var(--rule)", color: "var(--ink-light)" } : { background: "var(--ink)", color: "var(--paper-warm)" }}>
                {isFollowing ? <UserMinus size={15} /> : <UserPlus size={15} />}
                {isFollowing ? "Ne plus suivre" : "Suivre"}
              </button>
              <button onClick={() => goToDM({ id: authorId, username: authorProfile.username, avatar_url: authorProfile.avatar_url })}
                className="flex items-center gap-2 font-ui text-sm px-5 py-2.5 rounded-full transition-colors border"
                style={{ borderColor: "var(--rule)", color: "var(--ink)" }}>
                <Mail size={15} /> Message
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--sage)" }}>
        Recueils
      </p>
      {authorCollections.length === 0 ? (
        <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
          Aucun recueil pour le moment.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {authorCollections.map((c) => (
            <button
              key={c.id}
              onClick={() => openCollection(c, 0)}
              className="flex items-center justify-between p-5 rounded-lg border text-left transition-colors hover:shadow-sm"
              style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
            >
              <div className="flex items-center gap-4">
                <AuthorBadge avatarUrl={c.authorAvatar} letter={c.seal} color={c.sealColor} />
                <div>
                  <p className="font-display italic text-lg" style={{ color: "var(--ink)" }}>
                    {c.title}
                  </p>
                  <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                    {(c.poems||[]).length} poème{(c.poems||[]).length === 1 ? "" : "s"} · {c.theme}
                  </p>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: "var(--ink-light)" }} />
            </button>
          ))}
        </div>
      )}

      {authorFreePoems.length > 0 && (
        <>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mt-8 mb-4" style={{ color: "var(--sage)" }}>
            Poèmes libres
          </p>
          <div className="flex flex-col gap-3">
            {authorFreePoems.map((p) => (
              <button
                key={p.id}
                onClick={() => openFreePoem(p)}
                className="flex items-center justify-between p-5 rounded-lg border text-left transition-colors hover:shadow-sm"
                style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-display italic text-lg mb-1" style={{ color: "var(--ink)" }}>{p.title}</p>
                  <p className="font-display italic text-sm leading-relaxed" style={{ color: "var(--ink-light)" }}>
                    « {(p.lines || []).find(l => l) || ""} »
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0" style={{ color: "var(--wine)" }}>
                  <Heart size={13} fill={p.likes_count > 0 ? "var(--wine)" : "none"} />
                  <span className="font-mono text-xs">{p.likes_count}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FollowingView({ session, collections, openCollection, goToAuthor }) {
  const [followedIds, setFollowedIds] = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("follows")
      .select("followed_id")
      .eq("follower_id", session.user.id)
      .then(({ data }) => {
        if (active) setFollowedIds((data || []).map((f) => f.followed_id));
      });
    return () => {
      active = false;
    };
  }, [session.user.id]);

  // Leaderboard: total likes per author
  const authorStats = {};
  collections.forEach((c) => {
    if (!c.author_id) return;
    const likes = (c.poems || []).reduce((s, p) => s + (p.likes_count || 0), 0);
    if (!authorStats[c.author_id]) authorStats[c.author_id] = { author: c.author, author_id: c.author_id, likes: 0, collections: 0 };
    authorStats[c.author_id].likes += likes;
    authorStats[c.author_id].collections += 1;
  });
  const leaderboard = Object.values(authorStats)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  const feed = followedIds === null ? null : collections.filter((c) => followedIds.includes(c.author_id));

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 view-enter">
      {/* Leaderboard */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <Trophy size={16} style={{ color: "var(--wine)" }} />
          <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
            Auteurs les plus aimés
          </h2>
        </div>
        {leaderboard.length === 0 ? (
          <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
            Pas encore assez de likes pour un classement.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {leaderboard.map((a, i) => (
              <button
                key={a.author_id}
                onClick={() => goToAuthor(a.author_id)}
                className="flex items-center justify-between p-4 rounded-lg border text-left transition-colors hover:shadow-sm"
                style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm w-5 text-center" style={{ color: "var(--ink-light)" }}>
                    {i + 1}
                  </span>
                  <WaxSeal letter={a.author.charAt(0).toUpperCase()} color="var(--wine)" size={32} />
                  <div>
                    <p className="font-display italic text-base" style={{ color: "var(--ink)" }}>
                      {a.author}
                    </p>
                    <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                      {a.collections} recueil{a.collections === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 font-mono text-sm" style={{ color: "var(--wine)" }}>
                  <Heart size={13} fill="var(--wine)" />
                  {a.likes}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Feed */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Users size={16} style={{ color: "var(--sage)" }} />
          <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
            Fil de tes abonnements
          </h2>
        </div>
        {feed === null ? (
          <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
            Chargement...
          </p>
        ) : feed.length === 0 ? (
          <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
            Tu ne suis encore personne. Va sur le profil d'un auteur depuis "Découvrir" pour le suivre — ses nouveaux recueils apparaîtront ici.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {feed.map((c) => (
              <button
                key={c.id}
                onClick={() => openCollection(c, 0)}
                className="text-left p-6 rounded-lg border transition-colors hover:shadow-sm"
                style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <AuthorBadge avatarUrl={c.authorAvatar} letter={c.seal} color={c.sealColor} />
                  <span
                    className="font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{ color: "var(--ink-light)", border: "1px solid var(--rule)" }}
                  >
                    {c.theme}
                  </span>
                </div>
                <h3 className="font-display italic text-xl mb-1" style={{ color: "var(--ink)" }}>
                  {c.title}
                </h3>
                <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
                  {c.author} · {(c.poems||[]).length} poème{(c.poems||[]).length === 1 ? "" : "s"}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InteractionsView({ session, collections, freePoems, goToAuthor, goToPoem, onLoad }) {
  const [likes, setLikes] = useState(null);
  const [comments, setComments] = useState(null);
  const [replies, setReplies] = useState(null);

  const myPoems = [
    ...collections.filter((c) => c.author_id === session.user.id).flatMap((c) => c.poems),
    ...(freePoems || []).filter((p) => p.author_id === session.user.id),
  ];
  const myPoemIds = myPoems.map((p) => p.id);

  const findPoemTitle = (poemId) => {
    for (const c of collections) {
      const p = (c.poems||[]).find((x) => x.id === poemId);
      if (p) return p.title;
    }
    const fp = (freePoems || []).find((p) => p.id === poemId);
    return fp ? fp.title : "ce poème";
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      // Likes received on my poems
      if (myPoemIds.length > 0) {
        const { data: likeRows } = await supabase
          .from("likes")
          .select("*")
          .in("poem_id", myPoemIds)
          .neq("voter_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(40);
        const likeList = likeRows || [];
        const userIds = [...new Set(likeList.map((l) => l.voter_id).filter((id) => !id.startsWith("anon-")))];
        let profMap = {};
        if (userIds.length > 0) {
          const { data: profs } = await supabase.from("profiles").select("id, username, avatar_url").in("id", userIds);
          (profs || []).forEach((p) => { profMap[p.id] = p; });
        }
        if (active) setLikes(likeList.map((l) => ({ ...l, voterProfile: profMap[l.voter_id] || null })));

        // Comments received on my poems
        const { data: commentRows } = await supabase
          .from("comments")
          .select("*")
          .in("poem_id", myPoemIds)
          .is("parent_id", null)
          .order("created_at", { ascending: false })
          .limit(40);
        const commentList = (commentRows || []).filter((c) => c.author_id !== session.user.id);
        const cAuthorIds = [...new Set(commentList.map((c) => c.author_id).filter(Boolean))];
        let avatarMap = {};
        if (cAuthorIds.length > 0) {
          const { data: profs } = await supabase.from("profiles").select("id, avatar_url").in("id", cAuthorIds);
          (profs || []).forEach((p) => { avatarMap[p.id] = p.avatar_url; });
        }
        if (active) setComments(commentList.map((c) => ({ ...c, authorAvatar: c.author_id ? avatarMap[c.author_id] : null })));
      } else {
        if (active) { setLikes([]); setComments([]); }
      }

      // Replies to my comments
      const { data: myCommentRows } = await supabase.from("comments").select("id, poem_id").eq("author_id", session.user.id);
      const myCommentIds = (myCommentRows || []).map((c) => c.id);
      if (myCommentIds.length > 0) {
        const { data: replyRows } = await supabase
          .from("comments")
          .select("*")
          .in("parent_id", myCommentIds)
          .order("created_at", { ascending: false })
          .limit(40);
        const replyList = (replyRows || []).filter((r) => r.author_id !== session.user.id);
        const rAuthorIds = [...new Set(replyList.map((c) => c.author_id).filter(Boolean))];
        let avatarMap2 = {};
        if (rAuthorIds.length > 0) {
          const { data: profs } = await supabase.from("profiles").select("id, avatar_url").in("id", rAuthorIds);
          (profs || []).forEach((p) => { avatarMap2[p.id] = p.avatar_url; });
        }
        if (active) setReplies(replyList.map((c) => ({ ...c, authorAvatar: c.author_id ? avatarMap2[c.author_id] : null })));
      } else {
        if (active) setReplies([]);
      }
      if (active && onLoad) onLoad();
    };
    load();
    return () => { active = false; };
  }, [session.user.id]);

  const loading = likes === null || comments === null || replies === null;
  const totalUnseen = (likes?.length || 0) + (comments?.length || 0) + (replies?.length || 0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 view-enter">
      <p className="font-mono text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--sage)" }}>
        Activité
      </p>
      <h1 className="font-display italic text-3xl mb-10" style={{ color: "var(--ink)" }}>
        Interactions
      </h1>

      {loading ? (
        <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>Chargement...</p>
      ) : totalUnseen === 0 ? (
        <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>
          Rien pour l'instant — publie un poème pour commencer à recevoir des retours.
        </p>
      ) : (
        <div className="flex flex-col gap-14">

          {/* Likes */}
          {likes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Heart size={15} fill="var(--wine)" stroke="var(--wine)" />
                <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
                  Likes reçus
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "var(--wine)", color: "var(--paper-warm)" }}>
                  {likes.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {likes.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => goToPoem(l.poem_id)}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border text-left transition-colors hover:shadow-sm"
                    style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AuthorBadge
                        avatarUrl={l.voterProfile?.avatar_url}
                        letter={l.voterProfile?.username?.charAt(0).toUpperCase() || "?"}
                        color="var(--wine)"
                        size={30}
                      />
                      <p className="font-ui text-sm truncate" style={{ color: "var(--ink)" }}>
                        <span
                          className="font-medium hover:underline"
                          role="button"
                          onClick={(e) => { e.stopPropagation(); if (l.voterProfile) goToAuthor(l.voter_id); }}
                        >
                          {l.voterProfile?.username || "Quelqu'un"}
                        </span>
                        {" a aimé "}
                        <span className="font-display italic">« {findPoemTitle(l.poem_id)} »</span>
                      </p>
                    </div>
                    <span className="font-mono text-xs shrink-0" style={{ color: "var(--ink-light)" }}>
                      {timeAgo(l.created_at)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Comments */}
          {comments.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle size={15} style={{ color: "var(--sage)" }} />
                <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
                  Commentaires sur tes poèmes
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "var(--sage)", color: "var(--paper-warm)" }}>
                  {comments.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {comments.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => goToPoem(c.poem_id)}
                    className="flex items-start gap-3 p-4 rounded-lg border text-left transition-colors hover:shadow-sm"
                    style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
                  >
                    <AuthorBadge
                      avatarUrl={c.anonymous ? null : c.authorAvatar}
                      letter={c.anonymous ? "?" : (c.author || "?").charAt(0)}
                      color={c.anonymous ? "var(--ink-light)" : "var(--sage)"}
                      size={30}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-xs mb-1" style={{ color: "var(--ink-light)" }}>
                        <span className="font-medium" style={{ color: "var(--ink)" }}>
                          {c.anonymous ? "Anonyme" : (
                            c.author_id ? (
                              <button onClick={(e) => { e.stopPropagation(); goToAuthor(c.author_id); }} className="hover:underline">
                                {c.author}
                              </button>
                            ) : c.author
                          )}
                        </span>
                        {" · "}
                        <span className="font-display italic">« {findPoemTitle(c.poem_id)} »</span>
                        {" · "}
                        {timeAgo(c.created_at)}
                      </p>
                      <p className="font-ui text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                        {c.content}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle size={15} style={{ color: "var(--ink-light)" }} />
                <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
                  Réponses à tes commentaires
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "var(--rule)", color: "var(--ink)" }}>
                  {replies.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {replies.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => goToPoem(r.poem_id)}
                    className="flex items-start gap-3 p-4 rounded-lg border text-left transition-colors hover:shadow-sm"
                    style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
                  >
                    <AuthorBadge
                      avatarUrl={r.anonymous ? null : r.authorAvatar}
                      letter={r.anonymous ? "?" : (r.author || "?").charAt(0)}
                      color={r.anonymous ? "var(--ink-light)" : "var(--sage)"}
                      size={30}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-xs mb-1" style={{ color: "var(--ink-light)" }}>
                        <span className="font-medium" style={{ color: "var(--ink)" }}>
                          {r.anonymous ? "Anonyme" : r.author}
                        </span>
                        {" a répondu · "}
                        {timeAgo(r.created_at)}
                      </p>
                      <p className="font-ui text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                        {r.content}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function DMView({ session, profile, initialRecipient, onClearRecipient, onOpen }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newRecipientUsername, setNewRecipientUsername] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_a.eq.${session.user.id},participant_b.eq.${session.user.id}`)
      .order("last_message_at", { ascending: false });
    if (!data) { setLoading(false); return; }
    const otherIds = data.map((c) => (c.participant_a === session.user.id ? c.participant_b : c.participant_a));
    let profMap = {};
    if (otherIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, username, avatar_url").in("id", otherIds);
      (profs || []).forEach((p) => { profMap[p.id] = p; });
    }
    const shaped = data.map((c) => {
      const otherId = c.participant_a === session.user.id ? c.participant_b : c.participant_a;
      return { ...c, other: profMap[otherId] || { id: otherId, username: "Utilisateur", avatar_url: null } };
    });
    setConversations(shaped);
    setLoading(false);
    return shaped;
  };

  useEffect(() => {
    const init = async () => {
      if (onOpen) onOpen();
      const shaped = await loadConversations();
      if (initialRecipient && shaped) {
        const existing = shaped.find((c) => c.other.id === initialRecipient.id);
        if (existing) { openConversation(existing); if (onClearRecipient) onClearRecipient(); }
        else { await startConversation(initialRecipient); if (onClearRecipient) onClearRecipient(); }
      }
    };
    init();
  }, []);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const startConversation = async (recipient) => {
    const a = session.user.id < recipient.id ? session.user.id : recipient.id;
    const b = session.user.id < recipient.id ? recipient.id : session.user.id;
    const { data: existing } = await supabase.from("conversations").select("*").eq("participant_a", a).eq("participant_b", b).maybeSingle();
    if (existing) {
      const conv = { ...existing, other: recipient };
      setActiveConv(conv);
      await openConversation(conv);
      return;
    }
    const { data: created } = await supabase.from("conversations").insert({ participant_a: a, participant_b: b }).select().single();
    if (created) {
      const conv = { ...created, other: recipient };
      setConversations((prev) => [conv, ...prev]);
      setActiveConv(conv);
      setMessages([]);
    }
  };

  const searchUser = async () => {
    if (!newRecipientUsername.trim()) return;
    setSearching(true);
    const { data } = await supabase.from("profiles").select("id, username, avatar_url").ilike("username", newRecipientUsername.trim()).neq("id", session.user.id).limit(1).maybeSingle();
    setSearchResult(data || "none");
    setSearching(false);
  };

  const sendMessage = async () => {
    if (!draft.trim() || !activeConv || sending) return;
    setSending(true);
    const { data } = await supabase.from("messages").insert({ conversation_id: activeConv.id, sender_id: session.user.id, content: draft.trim() }).select().single();
    if (data) {
      setMessages((prev) => [...prev, data]);
      setDraft("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
    setSending(false);
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>Chargement...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 view-enter">
      <div className="flex items-center gap-3 mb-8">
        <Mail size={18} style={{ color: "var(--wine)" }} />
        <h1 className="font-display italic text-3xl" style={{ color: "var(--ink)" }}>Messages privés</h1>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6" style={{ minHeight: 480 }}>
        {/* Sidebar : conversation list */}
        <aside className="flex flex-col gap-3">
          {/* New conversation search */}
          <div className="p-3 rounded-lg border" style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--sage)" }}>
              Nouvelle conversation
            </p>
            <div className="flex gap-2">
              <input
                value={newRecipientUsername}
                onChange={(e) => { setNewRecipientUsername(e.target.value); setSearchResult(null); }}
                onKeyDown={(e) => e.key === "Enter" && searchUser()}
                placeholder="Nom d'utilisateur..."
                className="flex-1 font-ui text-sm px-3 py-2 rounded-md border bg-transparent outline-none"
                style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
              />
              <button
                onClick={searchUser}
                disabled={searching}
                className="font-ui text-xs px-3 py-2 rounded-md transition-opacity disabled:opacity-50"
                style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
              >
                {searching ? "..." : "OK"}
              </button>
            </div>
            {searchResult && searchResult !== "none" && (
              <button
                onClick={() => { startConversation(searchResult); setNewRecipientUsername(""); setSearchResult(null); }}
                className="flex items-center gap-2 mt-2 w-full text-left p-2 rounded-md transition-colors hover:opacity-80"
                style={{ background: "var(--paper)" }}
              >
                <AuthorBadge avatarUrl={searchResult.avatar_url} letter={searchResult.username.charAt(0).toUpperCase()} color="var(--sage)" size={26} />
                <span className="font-ui text-sm" style={{ color: "var(--ink)" }}>{searchResult.username}</span>
              </button>
            )}
            {searchResult === "none" && (
              <p className="font-ui text-xs mt-2" style={{ color: "var(--ink-light)" }}>Aucun utilisateur trouvé.</p>
            )}
          </div>

          {/* Conversations list */}
          {conversations.length === 0 ? (
            <p className="font-ui text-sm px-1" style={{ color: "var(--ink-light)" }}>Aucune conversation pour l'instant.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c)}
                className="flex items-center gap-3 p-3 rounded-lg border text-left transition-colors hover:shadow-sm"
                style={{
                  background: activeConv?.id === c.id ? "var(--ink)" : "var(--paper-warm)",
                  borderColor: activeConv?.id === c.id ? "var(--ink)" : "var(--rule)",
                }}
              >
                <AuthorBadge avatarUrl={c.other.avatar_url} letter={c.other.username.charAt(0).toUpperCase()} color="var(--wine)" size={32} />
                <div className="min-w-0">
                  <p className="font-ui text-sm font-medium truncate" style={{ color: activeConv?.id === c.id ? "var(--paper-warm)" : "var(--ink)" }}>
                    {c.other.username}
                  </p>
                  <p className="font-mono text-xs" style={{ color: activeConv?.id === c.id ? "rgba(255,255,255,0.5)" : "var(--ink-light)" }}>
                    {timeAgo(c.last_message_at)}
                  </p>
                </div>
              </button>
            ))
          )}
        </aside>

        {/* Chat area */}
        {activeConv ? (
          <div className="flex flex-col rounded-lg border overflow-hidden" style={{ borderColor: "var(--rule)", background: "var(--paper-warm)", minHeight: 400 }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--rule)" }}>
              <AuthorBadge avatarUrl={activeConv.other.avatar_url} letter={activeConv.other.username.charAt(0).toUpperCase()} color="var(--wine)" size={30} />
              <span className="font-display italic text-lg" style={{ color: "var(--ink)" }}>{activeConv.other.username}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4" style={{ maxHeight: 440 }}>
              {messages.length === 0 && (
                <p className="font-ui text-sm text-center mt-8" style={{ color: "var(--ink-light)" }}>
                  Début de la conversation avec {activeConv.other.username}.
                </p>
              )}
              {messages.map((m) => {
                const isMine = m.sender_id === session.user.id;
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[75%] px-4 py-2.5 rounded-2xl font-ui text-sm leading-relaxed"
                      style={{
                        background: isMine ? "var(--wine)" : "var(--paper)",
                        color: isMine ? "var(--paper-warm)" : "var(--ink)",
                        borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 p-3 border-t" style={{ borderColor: "var(--rule)" }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Écrire un message..."
                className="flex-1 font-ui text-sm px-4 py-2.5 rounded-full border bg-transparent outline-none"
                style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                className="flex items-center gap-1.5 font-ui text-sm px-4 py-2.5 rounded-full disabled:opacity-30 transition-opacity"
                style={{ background: "var(--wine)", color: "var(--paper-warm)" }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border" style={{ borderColor: "var(--rule)", minHeight: 300 }}>
            <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>
              Sélectionne une conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeView({ session, profile, challenge, freePoems, collections, openFreePoem, openCollection, goToAuthor, onBack }) {
  const [submitting, setSubmitting] = useState(false);
  const [poemTitle, setPoemTitle] = useState("");
  const [poemText, setPoemText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const entries = freePoems.filter((p) => p.challenge_id === challenge.id);
  const collectionEntries = collections.flatMap((c) =>
    c.poems.filter((p) => p.challenge_id === challenge.id).map((p) => ({ ...p, collection: c }))
  );
  const allEntries = [...entries, ...collectionEntries].sort((a, b) => b.likes_count - a.likes_count);

  const handleSubmit = async () => {
    if (!session || !poemTitle.trim() || !poemText.trim()) return;
    setSubmitting(true);
    setError("");
    const { error: err } = await supabase.from("poems").insert({
      collection_id: null,
      author_id: session.user.id,
      author: profile?.username || "Anonyme",
      title: poemTitle.trim(),
      content: poemText,
      position: 0,
      status: "published",
      challenge_id: challenge.id,
    });
    setSubmitting(false);
    if (err) { setError("Erreur lors de l'envoi. Réessaie."); return; }
    setPoemTitle("");
    setPoemText("");
    setSubmitted(true);
  };

  const endsIn = challenge.ends_at
    ? Math.ceil((new Date(challenge.ends_at) - Date.now()) / 86400000)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 view-enter">
      <button onClick={onBack} className="flex items-center gap-2 font-ui text-sm mb-8 hover:opacity-70 transition-opacity" style={{ color: "var(--ink-light)" }}>
        <ArrowLeft size={15} /> Retour
      </button>

      {/* Header */}
      <div className="rounded-xl p-7 mb-10" style={{ background: "var(--ink)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={15} style={{ color: "var(--sage)" }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--sage)" }}>
            Challenge · semaine {challenge.week_number}
            {endsIn !== null && ` · encore ${endsIn} j`}
          </span>
        </div>
        <h1 className="font-display italic text-3xl mb-3" style={{ color: "var(--paper-warm)" }}>
          {challenge.title}
        </h1>
        {challenge.description && (
          <p className="font-ui text-sm leading-relaxed" style={{ color: "rgba(240,235,225,0.6)" }}>
            {challenge.description}
          </p>
        )}
        <p className="font-mono text-xs mt-4" style={{ color: "var(--sage)" }}>
          {allEntries.length} participation{allEntries.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Soumettre un poème */}
      {session ? (
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: "var(--sage)" }}>
            Ta participation
          </p>
          {submitted ? (
            <div className="p-5 rounded-lg border" style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}>
              <p className="font-display italic text-lg" style={{ color: "var(--ink)" }}>
                Poème soumis ! 🎉
              </p>
              <p className="font-ui text-sm mt-1" style={{ color: "var(--ink-light)" }}>
                Il apparaît dans les participations ci-dessous.
              </p>
              <button onClick={() => setSubmitted(false)} className="font-ui text-xs mt-3 hover:opacity-70" style={{ color: "var(--sage)" }}>
                Soumettre un autre
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <input
                value={poemTitle}
                onChange={(e) => setPoemTitle(e.target.value)}
                placeholder="Titre du poème..."
                className="font-display italic text-lg px-4 py-3 rounded-md border bg-transparent outline-none"
                style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
              />
              <textarea
                value={poemText}
                onChange={(e) => setPoemText(e.target.value)}
                placeholder={"Écris ton poème ici...\n\nChaque ligne = un vers."}
                rows={7}
                className="font-display italic px-4 py-3 rounded-md border bg-transparent outline-none resize-none text-base leading-relaxed"
                style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
              />
              {error && <p className="font-ui text-xs" style={{ color: "var(--wine)" }}>{error}</p>}
              <div className="flex items-center justify-between">
                <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                  Le poème sera publié comme poème libre lié à ce challenge.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!poemTitle.trim() || !poemText.trim() || submitting}
                  className="flex items-center gap-2 font-ui text-sm px-5 py-2.5 rounded-full disabled:opacity-30 transition-opacity"
                  style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
                >
                  <Zap size={14} />
                  {submitting ? "Envoi..." : "Participer"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-12 p-5 rounded-lg border" style={{ borderColor: "var(--rule)" }}>
          <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
            Connecte-toi pour participer au challenge.
          </p>
        </div>
      )}

      {/* Participations */}
      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: "var(--sage)" }}>
        Participations
      </p>
      {allEntries.length === 0 ? (
        <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>
          Sois le premier à participer !
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {allEntries.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => p.collection ? openCollection(p.collection, p.collection.poems.findIndex(x => x.id === p.id)) : openFreePoem(p)}
              className="flex items-start gap-4 p-5 rounded-lg border text-left transition-colors hover:shadow-sm"
              style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
            >
              <span className="font-display italic text-2xl shrink-0" style={{ color: idx < 3 ? "var(--wine)" : "var(--rule)", width: 28 }}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-display italic text-lg" style={{ color: "var(--ink)" }}>{p.title}</p>
                  {idx === 0 && <Trophy size={14} style={{ color: "var(--wine)" }} />}
                </div>
                <p className="font-ui text-xs mb-2" style={{ color: "var(--ink-light)" }}>
                  {p.author || (p.collection?.author)} · {timeAgo(p.created_at)}
                </p>
                <p className="font-display italic text-sm leading-relaxed" style={{ color: "var(--ink-light)" }}>
                  « {(p.lines || (p.content || "").split("\n")).find(l => l) || ""} »
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0" style={{ color: "var(--wine)" }}>
                <Heart size={13} fill={p.likes_count > 0 ? "var(--wine)" : "none"} />
                <span className="font-mono text-xs">{p.likes_count}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CollabView({ session, profile, collections, openCollection, refresh }) {
  const [invites, setInvites] = useState(null);
  const [myCollabs, setMyCollabs] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);

  // New collab form
  const [step, setStep] = useState("form"); // "form" | "sent"
  const [collabTitle, setCollabTitle] = useState("");
  const [collabTheme, setCollabTheme] = useState("");
  const [partnerUsername, setPartnerUsername] = useState("");
  const [partnerResult, setPartnerResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  const loadData = async () => {
    // Invitations received
    const { data: recv } = await supabase
      .from("collab_invites")
      .select("*, collection:collections(*)")
      .eq("invitee_id", session.user.id)
      .order("created_at", { ascending: false });
    setInvites(recv || []);

    // Collections where I'm accepted collab
    const { data: accepted } = await supabase
      .from("collab_invites")
      .select("collection_id")
      .eq("invitee_id", session.user.id)
      .eq("status", "accepted");
    if (accepted) {
      const ids = accepted.map(r => r.collection_id);
      setMyCollabs(collections.filter(c => ids.includes(c.id)));
    }

    // Invites I sent (pending)
    const { data: sent } = await supabase
      .from("collab_invites")
      .select("*, collection:collections(*), invitee:profiles!collab_invites_invitee_id_fkey(username, avatar_url)")
      .eq("invited_by", session.user.id)
      .order("created_at", { ascending: false });
    setSentInvites(sent || []);
  };

  useEffect(() => {
    loadData();
  }, [session.user.id]);

  const searchPartner = async () => {
    if (!partnerUsername.trim()) return;
    setSearching(true);
    const { data } = await supabase.from("profiles").select("id, username, avatar_url")
      .ilike("username", partnerUsername.trim()).neq("id", session.user.id).limit(1).maybeSingle();
    setPartnerResult(data || "none");
    setSearching(false);
  };

  const sendCollab = async () => {
    if (!collabTitle.trim() || !partnerResult || partnerResult === "none") return;
    setSending(true);
    setFormMsg("");

    // 1. Create the collection marked as collab
    const SEAL_COLORS = ["#8B3A4A","#6E7F5C","#3A4A6E","#7A5C3A","#5C3A7A"];
    const seal = profile?.username?.charAt(0).toUpperCase() || "?";
    const sealColor = SEAL_COLORS[Math.floor(Math.random() * SEAL_COLORS.length)];
    const { data: col, error: colErr } = await supabase.from("collections").insert({
      title: collabTitle.trim(),
      author: profile?.username || "Anonyme",
      author_id: session.user.id,
      theme: collabTheme.trim() || "Collaboration",
      seal,
      seal_color: sealColor,
      is_collab: true,
    }).select().single();

    if (colErr || !col) { setFormMsg("Erreur lors de la création."); setSending(false); return; }

    // 2. Send invite
    const { error: invErr } = await supabase.from("collab_invites").insert({
      collection_id: col.id,
      invitee_id: partnerResult.id,
      invited_by: session.user.id,
    });

    setSending(false);
    if (invErr) { setFormMsg("Recueil créé mais invitation échouée."); return; }

    setCollabTitle("");
    setCollabTheme("");
    setPartnerUsername("");
    setPartnerResult(null);
    setStep("sent");
    await loadData();
    if (refresh) refresh();
  };

  const respondInvite = async (inviteId, status, collectionId) => {
    await supabase.from("collab_invites").update({ status }).eq("id", inviteId);
    setInvites(prev => prev.map(i => i.id === inviteId ? { ...i, status } : i));
    if (status === "accepted") await loadData();
  };

  const myOwnCollabs = collections.filter(c => c.author_id === session.user.id && c.is_collab);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 view-enter">
      <div className="flex items-center gap-2 mb-3">
        <Crown size={16} style={{ color: "var(--sage)" }} />
        <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--sage)" }}>Collections collaboratives</p>
      </div>
      <h1 className="font-display italic text-3xl mb-10" style={{ color: "var(--ink)" }}>Collaborations</h1>

      {/* ── Proposer une nouvelle collab ── */}
      <section className="mb-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] mb-6" style={{ color: "var(--sage)" }}>
          Proposer une collaboration
        </p>

        {step === "sent" ? (
          <div className="p-6 rounded-xl border" style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}>
            <p className="font-display italic text-xl mb-2" style={{ color: "var(--ink)" }}>Invitation envoyée !</p>
            <p className="font-ui text-sm mb-4" style={{ color: "var(--ink-light)" }}>
              Le recueil a été créé. Dès que ton partenaire accepte, vous pourrez tous les deux y ajouter des poèmes.
            </p>
            <button onClick={() => setStep("form")} className="font-ui text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--sage)" }}>
              Proposer une autre collab
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6 rounded-xl border" style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>Titre du recueil</span>
                <input
                  value={collabTitle}
                  onChange={(e) => setCollabTitle(e.target.value)}
                  placeholder="Ex. Fragments à deux voix"
                  className="font-display italic text-base px-4 py-3 rounded-md border bg-transparent outline-none"
                  style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>Thème (optionnel)</span>
                <input
                  value={collabTheme}
                  onChange={(e) => setCollabTheme(e.target.value)}
                  placeholder="Ex. Dualité, Lumière…"
                  className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none"
                  style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
                />
              </label>
            </div>

            <div className="border-t pt-4" style={{ borderColor: "var(--rule)" }}>
              <span className="font-mono text-[11px] uppercase tracking-wider mb-3 block" style={{ color: "var(--ink-light)" }}>Inviter un partenaire</span>
              <div className="flex gap-2">
                <input
                  value={partnerUsername}
                  onChange={(e) => { setPartnerUsername(e.target.value); setPartnerResult(null); }}
                  onKeyDown={(e) => e.key === "Enter" && searchPartner()}
                  placeholder="Nom d'utilisateur..."
                  className="flex-1 font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none"
                  style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
                />
                <button
                  onClick={searchPartner}
                  disabled={searching || !partnerUsername.trim()}
                  className="font-ui text-sm px-5 py-3 rounded-md disabled:opacity-40 transition-opacity"
                  style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
                >
                  {searching ? "..." : "Chercher"}
                </button>
              </div>

              {partnerResult && partnerResult !== "none" && (
                <div className="flex items-center gap-3 mt-3 p-3 rounded-lg" style={{ background: "var(--paper)" }}>
                  <AuthorBadge avatarUrl={partnerResult.avatar_url} letter={partnerResult.username.charAt(0).toUpperCase()} color="var(--sage)" size={34} />
                  <span className="font-display italic text-base flex-1" style={{ color: "var(--ink)" }}>{partnerResult.username}</span>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full" style={{ background: "var(--sage)", color: "var(--paper-warm)" }}>Trouvé</span>
                </div>
              )}
              {partnerResult === "none" && (
                <p className="font-ui text-xs mt-2" style={{ color: "var(--ink-light)" }}>Aucun utilisateur trouvé.</p>
              )}
            </div>

            {formMsg && <p className="font-ui text-xs" style={{ color: "var(--wine)" }}>{formMsg}</p>}

            <button
              onClick={sendCollab}
              disabled={!collabTitle.trim() || !partnerResult || partnerResult === "none" || sending}
              className="self-end flex items-center gap-2 font-ui text-sm px-6 py-3 rounded-full disabled:opacity-30 transition-opacity"
              style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
            >
              <Crown size={14} />
              {sending ? "Création..." : "Créer la collab"}
            </button>
          </div>
        )}
      </section>

      {/* ── Invitations reçues ── */}
      <section className="mb-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: "var(--sage)" }}>
          Invitations reçues
        </p>
        {invites === null ? (
          <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>Chargement...</p>
        ) : invites.length === 0 ? (
          <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>Aucune invitation pour l'instant.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center gap-4 p-4 rounded-lg border" style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}>
                <Crown size={15} style={{ color: "var(--sage)" }} />
                <div className="flex-1 min-w-0">
                  <p className="font-display italic text-base truncate" style={{ color: "var(--ink)" }}>
                    {inv.collection?.title || "Recueil"}
                  </p>
                  <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                    Invitation reçue {timeAgo(inv.created_at)}
                  </p>
                </div>
                {inv.status === "pending" ? (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => respondInvite(inv.id, "accepted", inv.collection_id)}
                      className="font-ui text-xs px-4 py-2 rounded-full"
                      style={{ background: "var(--sage)", color: "var(--paper-warm)" }}>
                      Accepter
                    </button>
                    <button onClick={() => respondInvite(inv.id, "declined")}
                      className="font-ui text-xs px-4 py-2 rounded-full border"
                      style={{ borderColor: "var(--rule)", color: "var(--ink-light)" }}>
                      Refuser
                    </button>
                  </div>
                ) : (
                  <span className="font-ui text-xs shrink-0" style={{ color: inv.status === "accepted" ? "var(--sage)" : "var(--ink-light)" }}>
                    {inv.status === "accepted" ? "Acceptée ✓" : "Refusée"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Mes collabs (créées + rejointes) ── */}
      {(myOwnCollabs.length > 0 || myCollabs.length > 0) && (
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: "var(--sage)" }}>
            Recueils collaboratifs
          </p>
          <div className="flex flex-col gap-3">
            {[...myOwnCollabs, ...myCollabs.filter(c => !myOwnCollabs.find(x => x.id === c.id))].map(c => (
              <button key={c.id} onClick={() => openCollection(c, 0)}
                className="flex items-center gap-4 p-4 rounded-lg border text-left transition-colors hover:shadow-sm"
                style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}>
                <AuthorBadge avatarUrl={c.authorAvatar} letter={c.seal} color={c.sealColor} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-display italic text-base truncate" style={{ color: "var(--ink)" }}>{c.title}</p>
                  <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                    {c.author} · {(c.poems||[]).length} poème{(c.poems||[]).length === 1 ? "" : "s"}
                    {c.author_id === session.user.id ? " · Créé par toi" : " · Tu collabores"}
                  </p>
                </div>
                <Crown size={14} style={{ color: "var(--sage)" }} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function LibraryView({ session, profile, goToAuth }) {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [openPoem, setOpenPoem] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentAnon, setCommentAnon] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [addingPoem, setAddingPoem] = useState(false);

  // Add poem form (moderator)
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPeriod, setNewPeriod] = useState("");
  const [newThemes, setNewThemes] = useState("");
  const [newNationality, setNewNationality] = useState("Française");
  const [addMsg, setAddMsg] = useState("");

  useEffect(() => {
    supabase.from("classic_poems").select("*").order("author").then(({ data }) => {
      setPoems(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!openPoem) return;
    supabase.from("classic_comments").select("*").eq("poem_id", openPoem.id).order("created_at", { ascending: true }).then(({ data }) => {
      setComments(data || []);
    });
  }, [openPoem?.id]);

  const allThemes = [...new Set(poems.flatMap(p => p.themes || []))].sort();
  const allPeriods = [...new Set(poems.map(p => p.period).filter(Boolean))].sort();

  const filtered = poems.filter(p => {
    const q = query.toLowerCase();
    const matchQuery = !q || p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || (p.themes || []).some(t => t.includes(q));
    const matchTheme = !selectedTheme || (p.themes || []).includes(selectedTheme);
    const matchPeriod = !selectedPeriod || p.period === selectedPeriod;
    return matchQuery && matchTheme && matchPeriod;
  });

  // Group by author
  const byAuthor = {};
  filtered.forEach(p => {
    if (!byAuthor[p.author]) byAuthor[p.author] = [];
    byAuthor[p.author].push(p);
  });

  const submitComment = async () => {
    if (!commentDraft.trim() || !openPoem) return;
    setSendingComment(true);
    const { data } = await supabase.from("classic_comments").insert({
      poem_id: openPoem.id,
      author: commentAnon ? null : profile?.username || "Anonyme",
      author_id: commentAnon ? null : session?.user?.id || null,
      anonymous: commentAnon,
      content: commentDraft.trim(),
    }).select().single();
    if (data) {
      setComments(prev => [...prev, data]);
      setCommentDraft("");
    }
    setSendingComment(false);
  };

  const addClassicPoem = async () => {
    if (!newTitle.trim() || !newAuthor.trim() || !newContent.trim()) return;
    const { error } = await supabase.from("classic_poems").insert({
      title: newTitle.trim(),
      author: newAuthor.trim(),
      content: newContent,
      period: newPeriod.trim() || null,
      nationality: newNationality.trim() || null,
      themes: newThemes.split(",").map(t => t.trim()).filter(Boolean),
    });
    if (error) { setAddMsg("Erreur : " + error.message); return; }
    setAddMsg("Poème ajouté !");
    setNewTitle(""); setNewAuthor(""); setNewContent(""); setNewPeriod(""); setNewThemes("");
    const { data } = await supabase.from("classic_poems").select("*").order("author");
    setPoems(data || []);
  };

  if (openPoem) {
    const lines = openPoem.content.split("\n");
    const strophes = [];
    let current = [];
    lines.forEach(l => {
      if (l.trim() === "") { if (current.length) { strophes.push(current); current = []; } }
      else { current.push(l); }
    });
    if (current.length) strophes.push(current);

    return (
      <div className="max-w-3xl mx-auto px-6 py-10 view-enter">
        <button onClick={() => setOpenPoem(null)} className="flex items-center gap-2 font-ui text-sm mb-8 hover:opacity-70 transition-opacity" style={{ color: "var(--ink-light)" }}>
          <ArrowLeft size={15} /> Bibliothèque
        </button>

        {/* Poem header */}
        <div className="mb-8 pb-6 border-b" style={{ borderColor: "var(--rule)" }}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {openPoem.period && (
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${colorFromString(openPoem.author)}22`, color: colorFromString(openPoem.author), border: `1px solid ${colorFromString(openPoem.author)}44` }}>
                {openPoem.period}
              </span>
            )}
            {(openPoem.themes || []).slice(0, 3).map(t => (
              <span key={t} className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: "var(--ink-light)", border: "1px solid var(--rule)" }}>
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display italic mb-2" style={{ fontSize: "clamp(1.6rem,4vw,2.6rem)", color: "var(--ink)" }}>
            {openPoem.title}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-display italic text-sm" style={{ background: colorFromString(openPoem.author), color: "var(--paper-warm)" }}>
              {openPoem.author.charAt(0)}
            </div>
            <div>
              <p className="font-display italic text-base" style={{ color: "var(--ink)" }}>{openPoem.author}</p>
              <p className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
                {openPoem.birth_year && openPoem.death_year ? `${openPoem.birth_year} – ${openPoem.death_year}` : ""}{openPoem.nationality ? ` · ${openPoem.nationality}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Poem text */}
        <div className="mb-12">
          {strophes.map((strophe, si) => (
            <div key={si} className="mb-8">
              {strophe.map((line, li) => (
                <p key={li} className="font-display italic leading-relaxed" style={{ fontSize: "clamp(1rem,2.2vw,1.2rem)", color: "var(--ink)", lineHeight: "2rem" }}>
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Comments */}
        <div className="border-t pt-8" style={{ borderColor: "var(--rule)" }}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2" style={{ color: "var(--sage)" }}>
            <MessageCircle size={12} /> {comments.length} commentaire{comments.length === 1 ? "" : "s"}
          </p>

          {comments.length > 0 && (
            <div className="flex flex-col gap-4 mb-6">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-display italic text-xs shrink-0" style={{ background: c.anonymous ? "var(--rule)" : colorFromString(c.author || "?"), color: "var(--paper-warm)" }}>
                    {c.anonymous ? "?" : (c.author || "?").charAt(0)}
                  </div>
                  <div>
                    <p className="font-ui text-xs mb-0.5" style={{ color: "var(--ink-light)" }}>
                      {c.anonymous ? "Anonyme" : c.author} · {timeAgo(c.created_at)}
                    </p>
                    <p className="font-ui text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment box */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border" style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}>
            <textarea
              value={commentDraft}
              onChange={e => setCommentDraft(e.target.value)}
              placeholder={session ? "Partage ton ressenti sur ce poème..." : "Connecte-toi pour commenter"}
              rows={3}
              disabled={!session}
              className="font-ui text-sm bg-transparent outline-none resize-none"
              style={{ color: "var(--ink)" }}
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2 font-ui text-xs cursor-pointer" style={{ color: "var(--ink-light)" }}>
                <input type="checkbox" checked={commentAnon} onChange={e => setCommentAnon(e.target.checked)} />
                <EyeOff size={12} /> Anonyme
              </label>
              {session ? (
                <button onClick={submitComment} disabled={!commentDraft.trim() || sendingComment}
                  className="flex items-center gap-1.5 font-ui text-xs px-4 py-2 rounded-full disabled:opacity-30 transition-opacity"
                  style={{ background: "var(--ink)", color: "var(--paper-warm)" }}>
                  <Send size={12} /> {sendingComment ? "..." : "Commenter"}
                </button>
              ) : (
                <button onClick={goToAuth} className="font-ui text-xs px-4 py-2 rounded-full" style={{ background: "var(--ink)", color: "var(--paper-warm)" }}>
                  Se connecter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 view-enter">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "var(--sage)" }}>
          Bibliothèque
        </p>
        <h1 className="font-display italic mb-2" style={{ fontSize: "clamp(2rem,5vw,3rem)", color: "var(--ink)" }}>
          Inspiration
        </h1>
        <p className="font-ui text-sm" style={{ color: "var(--ink-light)", maxWidth: 500 }}>
          Les plus grands poèmes de la littérature mondiale — pour lire, s'inspirer, commenter.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-light)" }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Chercher par titre, auteur, mot-clé, thème..."
          className="w-full font-ui text-sm pl-10 pr-4 py-3 rounded-full border bg-transparent outline-none"
          style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {allPeriods.map(p => (
          <button key={p} onClick={() => setSelectedPeriod(selectedPeriod === p ? null : p)}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full transition-all"
            style={{
              background: selectedPeriod === p ? "var(--ink)" : "transparent",
              color: selectedPeriod === p ? "var(--paper-warm)" : "var(--ink-light)",
              border: `1px solid ${selectedPeriod === p ? "var(--ink)" : "var(--rule)"}`,
            }}>
            {p}
          </button>
        ))}
        <div className="w-px mx-1 self-stretch" style={{ background: "var(--rule)" }} />
        {allThemes.slice(0, 12).map(t => (
          <button key={t} onClick={() => setSelectedTheme(selectedTheme === t ? null : t)}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full transition-all"
            style={{
              background: selectedTheme === t ? `${colorFromString(t)}33` : "transparent",
              color: selectedTheme === t ? colorFromString(t) : "var(--ink-light)",
              border: `1px solid ${selectedTheme === t ? colorFromString(t) : "var(--rule)"}`,
            }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>Aucun résultat pour « {query} ».</p>
      ) : (
        <div className="flex flex-col gap-12">
          {Object.entries(byAuthor).map(([author, authorPoems]) => {
            const ac = colorFromString(author);
            const first = authorPoems[0];
            return (
              <div key={author}>
                {/* Author header */}
                <div className="flex items-center gap-4 mb-5 pb-4 border-b" style={{ borderColor: "var(--rule)" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-display italic text-lg shrink-0" style={{ background: `${ac}22`, color: ac, border: `2px solid ${ac}44` }}>
                    {author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display italic text-xl" style={{ color: "var(--ink)" }}>{author}</p>
                    <p className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
                      {first.birth_year && first.death_year ? `${first.birth_year} – ${first.death_year} · ` : ""}{first.period} · {first.nationality}
                    </p>
                  </div>
                  <span className="ml-auto font-mono text-xs px-2 py-1 rounded-full" style={{ color: ac, background: `${ac}15`, border: `1px solid ${ac}30` }}>
                    {authorPoems.length} poème{authorPoems.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Poems grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {authorPoems.map(p => {
                    const preview = p.content.split("\n").filter(l => l.trim()).slice(0, 3);
                    return (
                      <button key={p.id} onClick={() => setOpenPoem(p)}
                        className="text-left p-5 rounded-xl border transition-all hover:shadow-md group"
                        style={{ borderColor: "var(--rule)", borderLeft: `3px solid ${ac}`, background: "var(--paper-warm)" }}>
                        <h3 className="font-display italic text-lg mb-2 group-hover:opacity-80 transition-opacity" style={{ color: "var(--ink)" }}>
                          {p.title}
                        </h3>
                        <div className="font-display italic text-sm leading-relaxed mb-3" style={{ color: "var(--ink-light)" }}>
                          {preview.map((l, i) => <p key={i}>{l}</p>)}
                          {p.content.split("\n").filter(l => l.trim()).length > 3 && (
                            <p style={{ opacity: 0.4, fontSize: 11 }}>…</p>
                          )}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {(p.themes || []).slice(0, 3).map(t => (
                            <span key={t} className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: "var(--ink-light)", border: "1px solid var(--rule)" }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Moderator: add poem */}
      {profile?.is_moderator && (
        <div className="mt-16 border-t pt-10" style={{ borderColor: "var(--rule)" }}>
          <button onClick={() => setAddingPoem(!addingPoem)} className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider mb-6" style={{ color: "var(--sage)" }}>
            <Zap size={12} /> {addingPoem ? "Fermer" : "Ajouter un poème classique"}
          </button>
          {addingPoem && (
            <div className="flex flex-col gap-4 p-6 rounded-xl border" style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titre *" className="font-display italic text-base px-4 py-3 rounded-md border bg-transparent outline-none" style={{ borderColor: "var(--rule)", color: "var(--ink)" }} />
                <input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Auteur *" className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none" style={{ borderColor: "var(--rule)", color: "var(--ink)" }} />
                <input value={newPeriod} onChange={e => setNewPeriod(e.target.value)} placeholder="Période (ex: Romantisme)" className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none" style={{ borderColor: "var(--rule)", color: "var(--ink)" }} />
                <input value={newNationality} onChange={e => setNewNationality(e.target.value)} placeholder="Nationalité" className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none" style={{ borderColor: "var(--rule)", color: "var(--ink)" }} />
                <input value={newThemes} onChange={e => setNewThemes(e.target.value)} placeholder="Thèmes séparés par virgule" className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none sm:col-span-2" style={{ borderColor: "var(--rule)", color: "var(--ink)" }} />
              </div>
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder={"Coller le texte du poème ici...\n(chaque ligne = un vers, ligne vide = nouvelle strophe)"} rows={10} className="font-display italic px-4 py-3 rounded-md border bg-transparent outline-none resize-none text-base leading-relaxed" style={{ borderColor: "var(--rule)", color: "var(--ink)" }} />
              {addMsg && <p className="font-ui text-xs" style={{ color: "var(--sage)" }}>{addMsg}</p>}
              <button onClick={addClassicPoem} disabled={!newTitle.trim() || !newAuthor.trim() || !newContent.trim()}
                className="self-end font-ui text-sm px-6 py-3 rounded-full disabled:opacity-30 transition-opacity"
                style={{ background: "var(--ink)", color: "var(--paper-warm)" }}>
                Ajouter à la bibliothèque
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModerationView({ collections, freePoems, refresh }) {
  const [reports, setReports] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDesc, setChallengeDesc] = useState("");
  const [challengeWeek, setChallengeWeek] = useState(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
  });
  const [challengeMsg, setChallengeMsg] = useState("");

  const createChallenge = async () => {
    if (!challengeTitle.trim()) return;
    const { error } = await supabase.from("challenges").upsert(
      { title: challengeTitle.trim(), description: challengeDesc.trim() || null, week_number: challengeWeek, year: new Date().getFullYear(), starts_at: new Date().toISOString() },
      { onConflict: "week_number,year" }
    );
    if (error) { setChallengeMsg("Erreur : " + error.message); return; }
    setChallengeMsg("Challenge créé !");
    setChallengeTitle("");
    setChallengeDesc("");
    refresh();
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      const list = data || [];
      setReports(list);

      const commentIds = list.filter((r) => r.target_type === "comment").map((r) => r.target_id);
      if (commentIds.length) {
        const { data: cs } = await supabase.from("comments").select("*").in("id", commentIds);
        const map = {};
        (cs || []).forEach((c) => {
          map[c.id] = c;
        });
        setCommentsMap(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const allPoems = [
    ...collections.flatMap((c) => (c.poems || []).map((p) => ({ ...p, collection: c }))),
    ...(freePoems || []).map((p) => ({ ...p, collection: null })),
  ];

  const dismiss = async (reportId) => {
    await supabase.from("reports").delete().eq("id", reportId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const deleteTarget = async (report) => {
    if (report.target_type === "poem") {
      const poem = allPoems.find((p) => p.id === report.target_id);
      if (!window.confirm(`Supprimer le poème « ${poem?.title || report.target_id} » ?`)) return;
      await supabase.from("poems").delete().eq("id", report.target_id);
      await refresh();
    } else {
      if (!window.confirm("Supprimer ce commentaire ?")) return;
      await supabase.from("comments").delete().eq("id", report.target_id);
    }
    await dismiss(report.id);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>
          Chargement des signalements...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 view-enter">
      <p className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--sage)" }}>
        <ShieldCheck size={14} />
        Modération
      </p>
      <h1 className="font-display italic text-3xl mb-10" style={{ color: "var(--ink)" }}>
        Panneau modérateur
      </h1>

      {/* Challenge creation */}
      <section className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-2" style={{ color: "var(--sage)" }}>
          <Zap size={13} /> Créer un challenge
        </p>
        <div className="flex flex-col gap-3 p-5 rounded-lg border" style={{ borderColor: "var(--rule)", background: "var(--paper-warm)" }}>
          <div className="flex gap-3">
            <input
              type="number"
              value={challengeWeek}
              onChange={(e) => setChallengeWeek(Number(e.target.value))}
              className="font-ui text-sm px-3 py-2.5 rounded-md border bg-transparent outline-none w-20"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
              placeholder="Sem."
            />
            <input
              value={challengeTitle}
              onChange={(e) => setChallengeTitle(e.target.value)}
              placeholder="Thème du challenge..."
              className="flex-1 font-display italic text-base px-4 py-2.5 rounded-md border bg-transparent outline-none"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            />
          </div>
          <textarea
            value={challengeDesc}
            onChange={(e) => setChallengeDesc(e.target.value)}
            placeholder="Description optionnelle..."
            rows={2}
            className="font-ui text-sm px-4 py-2.5 rounded-md border bg-transparent outline-none resize-none"
            style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
          />
          <div className="flex items-center justify-between">
            {challengeMsg && <span className="font-ui text-xs" style={{ color: "var(--sage)" }}>{challengeMsg}</span>}
            <button
              onClick={createChallenge}
              disabled={!challengeTitle.trim()}
              className="ml-auto font-ui text-sm px-5 py-2.5 rounded-full disabled:opacity-30 transition-opacity flex items-center gap-2"
              style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
            >
              <Zap size={14} /> Publier le challenge
            </button>
          </div>
        </div>
      </section>

      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: "var(--sage)" }}>Signalements</p>
      {reports.length === 0 ? (
        <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
          Aucun signalement en attente.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => {
            const poem = r.target_type === "poem" ? allPoems.find((p) => p.id === r.target_id) : null;
            const comment = r.target_type === "comment" ? commentsMap[r.target_id] : null;
            return (
              <div key={r.id} className="p-5 rounded-lg border" style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-full" style={{ color: "var(--ink-light)", border: "1px solid var(--rule)" }}>
                    {r.target_type === "poem" ? "Poème" : "Commentaire"}
                  </span>
                  <span className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                {r.target_type === "poem" && (
                  poem ? (
                    <p className="font-display italic text-base mb-1" style={{ color: "var(--ink)" }}>
                      {poem.title}
                      <span className="font-ui text-xs not-italic ml-2" style={{ color: "var(--ink-light)" }}>
                        {poem.collection ? <>— {poem.collection.title}, {poem.collection.author}</> : <>— Poème libre, {poem.author}</>}
                      </span>
                    </p>
                  ) : (
                    <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
                      Contenu déjà supprimé.
                    </p>
                  )
                )}

                {r.target_type === "comment" && (
                  comment ? (
                    <p className="font-ui text-sm mb-1" style={{ color: "var(--ink)" }}>
                      « {comment.content} »
                      <span className="font-ui text-xs ml-2" style={{ color: "var(--ink-light)" }}>
                        — {comment.anonymous ? "Anonyme" : comment.author}
                      </span>
                    </p>
                  ) : (
                    <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
                      Contenu déjà supprimé.
                    </p>
                  )
                )}

                <div className="flex items-center gap-3 mt-3">
                  {(poem || comment) && (
                    <button
                      onClick={() => deleteTarget(r)}
                      className="flex items-center gap-1.5 font-ui text-xs px-3 py-1.5 rounded-full border transition-colors"
                      style={{ borderColor: "var(--rule)", color: "var(--wine)" }}
                    >
                      <Trash2 size={13} />
                      Supprimer le contenu
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(r.id)}
                    className="flex items-center gap-1.5 font-ui text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{ borderColor: "var(--rule)", color: "var(--ink-light)" }}
                  >
                    <X size={13} />
                    Rejeter le signalement
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState(null);
  const [poemIndex, setPoemIndex] = useState(0);
  const [topLiked, setTopLiked] = useState([]);
  const [draftPoems, setDraftPoems] = useState([]);
  const [freePoems, setFreePoems] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [dmCount, setDmCount] = useState(0);
  const [discoverNewCount, setDiscoverNewCount] = useState(0);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [authorId, setAuthorId] = useState(null);
  const [dmRecipient, setDmRecipient] = useState(null);

  const [darkMode] = useState(true);

  const [weather, setWeather] = useState([]);
  useEffect(() => {
    // All available effects (no sun — removed)
    const pools = [
      ["snow"],
      ["rain"],
      ["leaves"],
      ["sakura"],
      ["wind", "sakura"],   // calm wind + petals
      ["wind", "leaves"],   // wind + autumn
      ["storm"],            // heavy rain + lightning
      ["snow", "wind"],     // snowstorm (no lightning)
      ["sakura", "snow"],   // sakura + light snow
    ];
    setWeather(pools[Math.floor(Math.random() * pools.length)]);
  }, []);

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data || null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadCollections = async () => {
    // Try ordering by updated_at (exists after running supabase-dm-order.sql),
    // fall back to created_at if the column doesn't exist yet
    let cols, poems;
    const { data: colsA, error: colsErrA } = await supabase
      .from("collections")
      .select("*")
      .order("updated_at", { ascending: false });
    if (colsErrA) {
      const { data: colsB } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });
      cols = colsB;
    } else {
      cols = colsA;
    }

    const { data: poemsData } = await supabase
      .from("poems")
      .select("*")
      .order("position");
    poems = poemsData;

    if (!cols || !poems) return;

    const authorIds = [
      ...new Set([...cols.map((c) => c.author_id), ...poems.map((p) => p.author_id)].filter(Boolean)),
    ];
    let avatarMap = {};
    if (authorIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, avatar_url").in("id", authorIds);
      (profs || []).forEach((p) => {
        avatarMap[p.id] = p.avatar_url;
      });
    }

    const shaped = cols
      .filter((c) => c && c.id)
      .map((c) => ({
        ...c,
        sealColor: c.seal_color,
        authorAvatar: c.author_id ? avatarMap[c.author_id] : null,
        poems: poems
          .filter((p) => p && p.collection_id === c.id && (p.status === "published" || !p.status))
          .map((p) => ({ ...p, lines: (p.content || "").split("\n") })),
      }))
      .filter((c) => c.poems.length > 0);
    setCollections(shaped);
    // Initialize poem count cache for first-time visitors (no badge shown on first load)
    shaped.forEach(c => {
      const key = `col_poems_${c.id}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, String((c.poems||[]).length));
      }
    });

    const free = poems
      .filter((p) => p && !p.collection_id && (p.status === "published" || !p.status))
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .map((p) => ({ ...p, lines: (p.content || "").split("\n"), authorAvatar: p.author_id ? avatarMap[p.author_id] : null }));
    setFreePoems(free);

    const drafts = poems
      .filter((p) => p && p.status === "draft")
      .map((p) => {
        const col = cols.find((c) => c.id === p.collection_id);
        return { ...p, lines: (p.content || "").split("\n"), collection: col || null };
      });
    setDraftPoems(drafts);

    const allPoems = [
      ...shaped.flatMap((c) => c.poems.map((p) => ({ ...p, collection: c }))),
      ...free.map((p) => ({ ...p, collection: null })),
    ];
    const top = [...allPoems]
      .filter((p) => p.likes_count > 0)
      .sort((a, b) => b.likes_count - a.likes_count)
      .slice(0, 4);
    setTopLiked(top);

    const now = new Date().toISOString();
    const { data: ch } = await supabase
      .from("challenges")
      .select("*")
      .lte("starts_at", now)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setCurrentChallenge(ch || null);

    // Count items added since last Découvrir visit
    const lastVisit = localStorage.getItem("last_discover_visit") || "1970-01-01T00:00:00Z";
    const newCols = (cols || []).filter(c => new Date(c.created_at) > new Date(lastVisit) && (poems || []).some(p => p.collection_id === c.id && (p.status === "published" || !p.status)));
    const newFree = (poems || []).filter(p => !p.collection_id && (p.status === "published" || !p.status) && new Date(p.created_at) > new Date(lastVisit));
    setDiscoverNewCount(newCols.length + newFree.length);
  };

  const loadNotifCounts = async (sess, cols, freePs) => {
    if (!sess?.user?.id) { setNotifCount(0); setDmCount(0); return; }
    const uid = sess.user.id;

    // Use stored timestamps — only count interactions AFTER last visit to Interactions tab
    const lastInteractionSeen = localStorage.getItem(`last_interaction_seen_${uid}`) || "1970-01-01T00:00:00Z";

    const myPoemIds = [
      ...(cols || []).filter(c => c.author_id === uid).flatMap(c => (c.poems || []).map(p => p.id)),
      ...(freePs || []).filter(p => p.author_id === uid).map(p => p.id),
    ];

    let interactionCount = 0;
    if (myPoemIds.length > 0) {
      const { count: likeCount } = await supabase.from("likes")
        .select("id", { count: "exact", head: true })
        .in("poem_id", myPoemIds)
        .neq("voter_id", uid)
        .gt("created_at", lastInteractionSeen);
      interactionCount += likeCount || 0;

      const { count: commentCount } = await supabase.from("comments")
        .select("id", { count: "exact", head: true })
        .in("poem_id", myPoemIds)
        .neq("author_id", uid)
        .is("parent_id", null)
        .gt("created_at", lastInteractionSeen);
      interactionCount += commentCount || 0;
    }

    const { data: myComments } = await supabase.from("comments").select("id").eq("author_id", uid);
    const myCommentIds = (myComments || []).map(c => c.id);
    if (myCommentIds.length > 0) {
      const { count: replyCount } = await supabase.from("comments")
        .select("id", { count: "exact", head: true })
        .in("parent_id", myCommentIds)
        .neq("author_id", uid)
        .gt("created_at", lastInteractionSeen);
      interactionCount += replyCount || 0;
    }
    setNotifCount(interactionCount);

    // DMs: messages after last DM tab visit
    const lastDmVisit = localStorage.getItem(`last_dm_visit_${uid}`) || "1970-01-01T00:00:00Z";
    const { data: convs } = await supabase.from("conversations")
      .select("id")
      .or(`participant_a.eq.${uid},participant_b.eq.${uid}`);
    if (convs && convs.length > 0) {
      const convIds = convs.map(c => c.id);
      const { count: unread } = await supabase.from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", convIds)
        .neq("sender_id", uid)
        .gt("created_at", lastDmVisit);
      setDmCount(unread || 0);
    } else {
      setDmCount(0);
    }
  };

  useEffect(() => {
    loadCollections();
    // Set initial visit timestamp only if never visited before
    if (!localStorage.getItem("last_discover_visit")) {
      localStorage.setItem("last_discover_visit", new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    if (session) loadNotifCounts(session, collections, freePoems);
    else { setNotifCount(0); setDmCount(0); }
  }, [session, collections.length, freePoems.length]);

  const deepLinkHandled = useRef(false);

  // Open a poem directly if the URL contains ?poem=ID (for shared links)
  useEffect(() => {
    if ((collections.length === 0 && freePoems.length === 0) || deepLinkHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const poemId = params.get("poem");
    if (!poemId) return;
    deepLinkHandled.current = true;
    for (const c of collections) {
      const idx = (c.poems||[]).findIndex((p) => String(p.id) === poemId);
      if (idx !== -1) {
        setCollection(c);
        setPoemIndex(idx);
        setView("reader");
        return;
      }
    }
    const freePoem = freePoems.find((p) => String(p.id) === poemId);
    if (freePoem) openFreePoem(freePoem);
  }, [collections, freePoems]);

  const openCollection = (c, i) => {
    setCollection(c);
    setPoemIndex(i);
    setView("reader");
  };

  const openFreePoem = (poem) => {
    const wrapped = {
      id: null,
      title: null,
      author: poem.author,
      author_id: poem.author_id,
      seal: (poem.author || "?").charAt(0).toUpperCase(),
      sealColor: "#8B3A4A",
      authorAvatar: poem.authorAvatar,
      poems: [poem],
      isFree: true,
    };
    setCollection(wrapped);
    setPoemIndex(0);
    setView("reader");
  };

  const goToAuthor = (id) => {
    if (!id) return;
    setAuthorId(id);
    setView("author");
  };

  const goToDM = (recipient) => {
    setDmRecipient(recipient);
    setView("dm");
  };

  const goToPoem = (poemId) => {
    for (const c of collections) {
      const idx = (c.poems||[]).findIndex((p) => p.id === poemId);
      if (idx !== -1) {
        openCollection(c, idx);
        return;
      }
    }
    const freePoem = freePoems.find((p) => p.id === poemId);
    if (freePoem) openFreePoem(freePoem);
  };

  const editDraft = (draft) => {
    setEditingDraft(draft);
    setView("write");
  };

  const palette = darkMode
    ? {
        "--paper": "#1E2230",
        "--paper-warm": "#2A3040",
        "--ink": "#EDEAE3",
        "--ink-light": "#8C95AC",
        "--wine": "#D08C9B",
        "--sage": "#9FB5E0",
        "--rule": "#3A4154",
      }
    : {
        "--paper": "#EAE6DC",
        "--paper-warm": "#F7F3EA",
        "--ink": "#262C40",
        "--ink-light": "#7C8194",
        "--wine": "#8B3A4A",
        "--sage": "#6E7F5C",
        "--rule": "#DAD4C6",
      };

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-300"
      style={{
        ...palette,
        background: "var(--paper)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-ui { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        input:focus, textarea:focus { ring-color: var(--wine); }

        @keyframes snowfall {
          0% { transform: translateY(-6vh) translateX(0); }
          50% { transform: translateY(53vh) translateX(12px); }
          100% { transform: translateY(108vh) translateX(-8px); }
        }
        @keyframes rainfall {
          0% { transform: translateY(-10vh) rotate(12deg); }
          100% { transform: translateY(112vh) rotate(12deg); }
        }
        @keyframes leaffall {
          0%   { transform: translateY(-5vh) translateX(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.9; }
          90%  { opacity: 0.7; }
          100% { transform: translateY(108vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes sakurafall {
          0%   { transform: translateY(-5vh) translateX(0) rotate(0deg); opacity: 0; }
          8%   { opacity: 0.9; }
          85%  { opacity: 0.7; }
          100% { transform: translateY(108vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes windstreakR {
          0%   { transform: translateX(-120px); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes windstreakL {
          0%   { transform: translateX(120px); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateX(-110vw); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .view-enter { animation: fadeIn 0.35s ease-out; }
      `}</style>

      {weather.includes("snow") && <SideSnow />}
      {weather.includes("rain") && <SideRain />}
      {weather.includes("leaves") && <SideLeaves />}
      {weather.includes("sakura") && <SideSakura />}
      {weather.includes("wind") && <SideWind />}
      {weather.includes("storm") && <SideStorm />}

      <div className="relative" style={{ zIndex: 1 }}>
        <TopNav
          view={view} setView={setView} session={session} profile={profile}
          goToWrite={() => { setEditingDraft(null); setView("write"); }}
          notifCount={notifCount} dmCount={dmCount}
          discoverNewCount={discoverNewCount}
          onOpenDiscover={() => {
            localStorage.setItem("last_discover_visit", new Date().toISOString());
            setDiscoverNewCount(0);
          }}
        />

        {view === "home" && <HomeView collections={collections} topLiked={topLiked} freePoems={freePoems} openCollection={openCollection} openFreePoem={openFreePoem} goToAuthor={goToAuthor} currentChallenge={currentChallenge} onChallenge={() => { setActiveChallenge(currentChallenge); setView("challenge"); }} />}
        {view === "library" && (
          <LibraryView
            session={session}
            profile={profile}
            goToAuth={() => setView("auth")}
          />
        )}
        {view === "challenge" && activeChallenge && (
          <ChallengeView
            session={session}
            profile={profile}
            challenge={activeChallenge}
            freePoems={freePoems}
            collections={collections}
            openFreePoem={openFreePoem}
            openCollection={openCollection}
            goToAuthor={goToAuthor}
            onBack={() => setView("home")}
          />
        )}
        {view === "collab" && session && (
          <CollabView
            session={session}
            profile={profile}
            collections={collections}
            openCollection={openCollection}
            refresh={loadCollections}
          />
        )}
        {view === "reader" && collection && (
          <ReaderView
            collection={collection}
            poemIndex={poemIndex}
            setPoemIndex={setPoemIndex}
            back={() => setView("home")}
            session={session}
            profile={profile}
            refresh={loadCollections}
            onDeleted={() => setView("home")}
            goToAuthor={goToAuthor}
            editDraft={editDraft}
          />
        )}
        {view === "write" && (
          <WriteView
            session={session}
            profile={profile}
            collections={collections}
            editingDraft={editingDraft}
            goToAuth={() => setView("auth")}
            onPublished={async () => {
              setEditingDraft(null);
              await loadCollections();
              setView("home");
            }}
            onSavedDraft={async () => {
              setEditingDraft(null);
              await loadCollections();
              setView("profile");
            }}
          />
        )}
        {view === "profile" && (
          <ProfileView
            collections={collections}
            draftPoems={draftPoems}
            freePoems={freePoems}
            openCollection={openCollection}
            openFreePoem={openFreePoem}
            session={session}
            profile={profile}
            setProfile={setProfile}
            goToAuth={() => setView("auth")}
            editDraft={editDraft}
            onWrite={() => {
              setEditingDraft(null);
              setView("write");
            }}
          />
        )}
        {view === "auth" && (
          <AuthView
            onSuccess={() => setView("profile")}
          />
        )}
        {view === "moderation" && profile?.is_moderator && (
          <ModerationView collections={collections} freePoems={freePoems} refresh={loadCollections} />
        )}
        {view === "author" && authorId && (
          <AuthorView
            authorId={authorId}
            session={session}
            collections={collections}
            freePoems={freePoems}
            openCollection={openCollection}
            openFreePoem={openFreePoem}
            back={() => setView("home")}
            goToDM={goToDM}
          />
        )}
        {view === "following" && session && (
          <FollowingView
            session={session}
            collections={collections}
            openCollection={openCollection}
            goToAuthor={goToAuthor}
          />
        )}
        {view === "interactions" && session && (
          <InteractionsView
            session={session}
            collections={collections}
            freePoems={freePoems}
            goToAuthor={goToAuthor}
            goToPoem={goToPoem}
            onLoad={() => {
              localStorage.setItem(`last_interaction_seen_${session.user.id}`, new Date().toISOString());
              setNotifCount(0);
            }}
          />
        )}
        {view === "dm" && session && (
          <DMView
            session={session}
            profile={profile}
            initialRecipient={dmRecipient}
            onClearRecipient={() => setDmRecipient(null)}
            onOpen={() => {
              localStorage.setItem(`last_dm_visit_${session.user.id}`, new Date().toISOString());
              setDmCount(0);
            }}
          />
        )}
      </div>
    </div>
  );
}
