import { useState, useEffect, useRef } from "react";
import { BookOpen, PenLine, User, ArrowLeft, ArrowRight, Heart, Bookmark, MessageCircle, Image as ImageIcon, EyeOff, Send, LogIn, LogOut, Star, Trash2, Flag, Search, Share2, ShieldCheck, X, Moon, Sun, Maximize2, Minimize2, UserPlus, UserMinus, Trophy, Users, FileEdit, Upload, Mail } from "lucide-react";
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
  return <WaxSeal letter={letter} color={color} size={size} />;
}

function TopNav({ view, setView, session, profile, darkMode, setDarkMode, goToWrite }) {
  const items = [
    { key: "home", label: "Découvrir", icon: BookOpen },
    { key: "write", label: "Écrire", icon: PenLine },
  ];
  if (session) {
    items.push({ key: "following", label: "Abonnements", icon: Users });
    items.push({ key: "interactions", label: "Interactions", icon: MessageCircle });
    items.push({ key: "dm", label: "Messages", icon: Mail });
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
          {items.map(({ key, label, icon: Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => (key === "write" ? goToWrite() : setView(key))}
                className="flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-full text-sm font-ui transition-colors"
                style={{
                  color: active ? "var(--paper-warm)" : "var(--ink)",
                  background: active ? "var(--ink)" : "transparent",
                }}
              >
                <Icon size={15} strokeWidth={2} />
                <span className="hidden sm:inline">{label}</span>
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

          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Passer au thème clair" : "Passer au thème sombre"}
            className="flex items-center px-2.5 py-2 rounded-full transition-colors"
            style={{ color: "var(--ink)" }}
          >
            {darkMode ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
          </button>

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

function HomeView({ collections, topLiked, freePoems, openCollection, openFreePoem, goToAuthor }) {
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
  return (
    <div className="max-w-5xl mx-auto px-6 view-enter">
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
            {topLiked.map((p) => {
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

      {/* Collections grid */}
      <section className="py-14">
        <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
          <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
            Nouveaux recueils
          </h2>
          <p className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
            {filtered.length} / {collections.length} publiés
          </p>
        </div>
        <div className="relative mb-8">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-light)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher par titre, auteur ou thème..."
            className="w-full font-ui text-sm pl-10 pr-4 py-3 rounded-full border bg-transparent outline-none focus:ring-1"
            style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
          />
        </div>
        {filtered.length === 0 ? (
          <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
            Aucun recueil ne correspond à « {query} ».
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => openCollection(c, 0)}
                className="text-left rounded-lg border transition-colors hover:shadow-sm group overflow-hidden"
                style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
              >
                {c.cover_url && (
                  <div className="w-full" style={{ height: 120 }}>
                    <img src={c.cover_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <AuthorBadge avatarUrl={c.authorAvatar} letter={c.seal} color={c.sealColor} />
                    <span
                      className="font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-full"
                      style={{ color: "var(--ink-light)", border: "1px solid var(--rule)" }}
                    >
                      {c.theme}
                    </span>
                  </div>
                  <h3
                    className="font-display italic text-xl mb-1 transition-colors"
                    style={{ color: "var(--ink)" }}
                  >
                    {c.title}
                  </h3>
                  <p className="font-ui text-sm mb-4" style={{ color: "var(--ink-light)" }}>
                    {c.author_id ? (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToAuthor(c.author_id);
                        }}
                        className="hover:underline"
                      >
                        {c.author}
                      </span>
                    ) : (
                      c.author
                    )}{" "}
                    · {c.poems.length} poème{c.poems.length === 1 ? "" : "s"}
                  </p>
                  <p className="font-display italic text-sm leading-relaxed" style={{ color: "var(--ink-light)" }}>
                    « {c.poems[0].lines.find((l) => l)} »
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Free-standing poems */}
      {freePoems.length > 0 && (
        <section className="pb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
                Poèmes libres
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--sage)", color: "var(--paper-warm)" }}>
                {freePoems.length}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {freePoems.map((p) => {
              const isNew = Date.now() - new Date(p.updated_at || p.created_at).getTime() < 48 * 3600 * 1000;
              const preview = p.lines.filter((l) => l.trim()).slice(0, 3);
              return (
                <button
                  key={p.id}
                  onClick={() => openFreePoem(p)}
                  className="text-left rounded-lg border transition-colors hover:shadow-md group"
                  style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
                >
                  <div className="flex items-start gap-4 p-5">
                    <AuthorBadge avatarUrl={p.authorAvatar} letter={(p.author || "?").charAt(0).toUpperCase()} color="var(--wine)" size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-display italic text-xl" style={{ color: "var(--ink)" }}>
                          {p.title}
                        </p>
                        {isNew && (
                          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "var(--wine)", color: "var(--paper-warm)" }}>
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="font-ui text-xs mb-3" style={{ color: "var(--ink-light)" }}>
                        {p.author_id ? (
                          <span role="button" onClick={(e) => { e.stopPropagation(); goToAuthor(p.author_id); }} className="hover:underline">
                            {p.author}
                          </span>
                        ) : p.author}
                        {" · "}
                        {timeAgo(p.updated_at || p.created_at)}
                      </p>
                      <div className="font-display italic text-sm leading-relaxed" style={{ color: "var(--ink-light)" }}>
                        {preview.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                        {p.lines.filter((l) => l.trim()).length > 3 && (
                          <p className="font-ui not-italic text-xs mt-1" style={{ color: "var(--ink-light)", opacity: 0.6 }}>
                            Lire la suite →
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-1">
                      <Heart size={12} fill={p.likes_count > 0 ? "var(--wine)" : "none"} stroke="var(--wine)" />
                      <span className="font-mono text-xs" style={{ color: "var(--wine)" }}>{p.likes_count}</span>
                    </div>
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
    setLiked(next);
    setLikesCount((c) => Math.max(0, c + (next ? 1 : -1)));
    if (next) {
      await supabase.from("likes").insert({ poem_id: poem.id, voter_id: voterId });
    } else {
      await supabase.from("likes").delete().eq("poem_id", poem.id).eq("voter_id", voterId);
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
                {collection.poems.map((p, i) => (
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
                        letter={c.anonymous ? "?" : (c.author || "?").charAt(0)}
                        color={c.anonymous ? "var(--ink-light)" : "var(--sage)"}
                        size={28}
                      />
                      <div className="flex-1">
                        <p className="font-ui text-xs mb-0.5" style={{ color: "var(--ink-light)" }}>
                          {c.anonymous ? "Anonyme" : c.author}
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
                                letter={r.anonymous ? "?" : (r.author || "?").charAt(0)}
                                color={r.anonymous ? "var(--ink-light)" : "var(--sage)"}
                                size={24}
                              />
                              <div className="flex-1">
                                <p className="font-ui text-xs mb-0.5" style={{ color: "var(--ink-light)" }}>
                                  {r.anonymous ? "Anonyme" : r.author}
                                </p>
                                <p className="font-ui text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                                  {r.content}
                                </p>
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

                    {/* Reply box */}
                    {replyingTo === c.id && (
                      <div className="flex items-center gap-2 pl-10">
                        <input
                          value={replyDraft}
                          onChange={(e) => setReplyDraft(e.target.value)}
                          placeholder="Répondre..."
                          className="flex-1 font-ui text-sm px-4 py-2 rounded-full border bg-transparent outline-none focus:ring-1"
                          style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
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

const SEAL_COLORS = ["#8B3A4A", "#6E7F5C", "#7C8194"];

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
                  {c.title} ({c.poems.length} poème{c.poems.length === 1 ? "" : "s"})
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

function ProfileView({ collections, draftPoems, openCollection, session, profile, setProfile, goToAuth, editDraft, onWrite }) {
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 view-enter">
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <WaxSeal letter={profile.username.charAt(0).toUpperCase()} color="var(--wine)" size={56} />
          )}
          <div>
            <h1 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
              {profile.username}
            </h1>
            <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
              {mine.length} recueil{mine.length === 1 ? "" : "s"} publié{mine.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 font-ui text-sm" style={{ color: "var(--ink-light)" }}>
          <LogOut size={14} />
          Se déconnecter
        </button>
      </div>

      {editing ? (
        <div className="flex flex-col gap-4 mb-10 p-5 rounded-lg border" style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}>
          <label className="flex flex-col gap-2">
            <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
              Pseudo
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            />
          </label>
          <ImageField label="Photo de profil (optionnel)" value={avatarUrl} onChange={setAvatarUrl} session={session} maxHeightPreview={160} />
          <label className="flex flex-col gap-2">
            <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
              Bio
            </span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Quelques mots sur toi..."
              className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1 resize-none"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            />
          </label>
          {errorMsg && (
            <p className="font-ui text-sm" style={{ color: "var(--wine)" }}>
              {errorMsg}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!username.trim() || saving}
              className="font-ui text-sm px-5 py-2.5 rounded-full disabled:opacity-30"
              style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
            >
              {saving ? "..." : "Enregistrer"}
            </button>
            <button onClick={() => setEditing(false)} className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-10">
          {profile.bio && (
            <p className="font-ui text-sm leading-relaxed mb-3" style={{ color: "var(--ink)" }}>
              {profile.bio}
            </p>
          )}
          <button onClick={() => setEditing(true)} className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
            Modifier le profil
          </button>
        </div>
      )}

      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--sage)" }}>
        Mes recueils
      </p>
      {mine.length === 0 ? (
        <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
          Tu n'as encore rien publié. Va dans "Écrire" pour partager ton premier poème.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {mine.map((c) => (
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
                    {c.poems.length} poème{c.poems.length === 1 ? "" : "s"} · {c.theme}
                  </p>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: "var(--ink-light)" }} />
            </button>
          ))}
        </div>
      )}

      {myDrafts.length > 0 && (
        <>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] mb-4 mt-10" style={{ color: "var(--sage)" }}>
            <FileEdit size={13} />
            Brouillons
          </p>
          <div className="flex flex-col gap-3">
            {myDrafts.map((d) => (
              <button
                key={d.id}
                onClick={() => editDraft(d)}
                className="flex items-center justify-between p-5 rounded-lg border text-left transition-colors hover:shadow-sm"
                style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
              >
                <div>
                  <p className="font-display italic text-lg" style={{ color: "var(--ink)" }}>
                    {d.title || "Sans titre"}
                  </p>
                  <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                    {d.collection?.title || "Poème libre"}
                  </p>
                </div>
                <span className="font-ui text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: "var(--rule)", color: "var(--ink-light)" }}>
                  Continuer
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SideSnow() {
  const flakes = Array.from({ length: 12 }, (_, i) => ({
    side: i % 2 === 0 ? "left" : "right",
    offset: 1 + ((i * 3) % 9),
    size: 2 + (i % 3),
    duration: 32 + (i % 6) * 6,
    delay: -(i * 4.5),
    opacity: 0.18 + (i % 3) * 0.08,
  }));
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {flakes.map((f, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            [f.side]: `${f.offset}%`,
            top: "-4%",
            width: f.size,
            height: f.size,
            background: "#FFFFFF",
            opacity: f.opacity,
            animation: `snowfall ${f.duration}s linear infinite`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function SideRain() {
  const drops = Array.from({ length: 14 }, (_, i) => ({
    side: i % 2 === 0 ? "left" : "right",
    offset: 1 + ((i * 3) % 9),
    length: 12 + (i % 3) * 6,
    duration: 0.9 + (i % 4) * 0.25,
    delay: -(i * 0.4),
    opacity: 0.12 + (i % 3) * 0.06,
  }));
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            [d.side]: `${d.offset}%`,
            top: "-8%",
            width: 1.5,
            height: d.length,
            borderRadius: 2,
            background: "var(--ink-light)",
            opacity: d.opacity,
            transform: "rotate(10deg)",
            animation: `rainfall ${d.duration}s linear infinite`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function SideSun() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      <div
        className="absolute rounded-full"
        style={{
          top: "-12%",
          right: "-8%",
          width: 360,
          height: 360,
          background: "radial-gradient(circle, rgba(255,214,140,0.28), transparent 70%)",
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}

function AuthorView({ authorId, session, collections, openCollection, back, goToDM }) {
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
  const totalLikes = authorCollections.reduce((sum, c) => sum + c.poems.reduce((s, p) => s + p.likes_count, 0), 0);
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
    <div className="max-w-3xl mx-auto px-6 py-12 view-enter">
      <button
        onClick={back}
        className="flex items-center gap-2 font-ui text-sm mb-8 transition-opacity hover:opacity-70"
        style={{ color: "var(--ink-light)" }}
      >
        <ArrowLeft size={15} /> Retour
      </button>

      <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {authorProfile.avatar_url ? (
            <img src={authorProfile.avatar_url} alt={authorProfile.username} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <WaxSeal letter={authorProfile.username.charAt(0).toUpperCase()} color="var(--wine)" size={56} />
          )}
          <div>
            <h1 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
              {authorProfile.username}
            </h1>
            <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
              {authorCollections.length} recueil{authorCollections.length === 1 ? "" : "s"} · {totalLikes} like{totalLikes === 1 ? "" : "s"} au total
            </p>
          </div>
        </div>
        {session && !isSelf && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleFollow}
              className="flex items-center gap-2 font-ui text-sm px-5 py-2.5 rounded-full transition-colors"
              style={
                isFollowing
                  ? { border: "1px solid var(--rule)", color: "var(--ink-light)" }
                  : { background: "var(--ink)", color: "var(--paper-warm)" }
              }
            >
              {isFollowing ? <UserMinus size={15} /> : <UserPlus size={15} />}
              {isFollowing ? "Ne plus suivre" : "Suivre"}
            </button>
            <button
              onClick={() => goToDM({ id: authorId, username: authorProfile.username, avatar_url: authorProfile.avatar_url })}
              className="flex items-center gap-2 font-ui text-sm px-5 py-2.5 rounded-full transition-colors border"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            >
              <Mail size={15} />
              Message
            </button>
          </div>
        )}
      </div>

      {authorProfile.bio && (
        <p className="font-ui text-sm leading-relaxed mb-10" style={{ color: "var(--ink)" }}>
          {authorProfile.bio}
        </p>
      )}

      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--sage)" }}>
        Recueils
      </p>
      {authorCollections.length === 0 ? (
        <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
          Rien de publié pour le moment.
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
                    {c.poems.length} poème{c.poems.length === 1 ? "" : "s"} · {c.theme}
                  </p>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: "var(--ink-light)" }} />
            </button>
          ))}
        </div>
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
    const likes = c.poems.reduce((s, p) => s + p.likes_count, 0);
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
                  {c.author} · {c.poems.length} poème{c.poems.length === 1 ? "" : "s"}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InteractionsView({ session, collections, freePoems, goToAuthor, goToPoem }) {
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
      const p = c.poems.find((x) => x.id === poemId);
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
                          {c.anonymous ? "Anonyme" : c.author}
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

function DMView({ session, profile, initialRecipient, onClearRecipient }) {
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

function ModerationView({ collections, freePoems, refresh }) {
  const [reports, setReports] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(true);

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
    ...collections.flatMap((c) => c.poems.map((p) => ({ ...p, collection: c }))),
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
        Signalements
      </h1>

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
  const [editingDraft, setEditingDraft] = useState(null);
  const [authorId, setAuthorId] = useState(null);
  const [dmRecipient, setDmRecipient] = useState(null);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark_mode") === "1");
  useEffect(() => {
    localStorage.setItem("dark_mode", darkMode ? "1" : "0");
  }, [darkMode]);

  const [weather, setWeather] = useState(null); // "snow" | "rain" | "sun" | null
  useEffect(() => {
    const options = ["snow", "rain", "sun", null];
    setWeather(options[Math.floor(Math.random() * options.length)]);
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
    const { data: cols, error: colsError } = await supabase
      .from("collections")
      .select("*")
      .order("updated_at", { ascending: false });
    const { data: poems, error: poemsError } = await supabase
      .from("poems")
      .select("*")
      .order("position");

    if (colsError || poemsError || !cols || !poems) return;

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
      .map((c) => ({
        ...c,
        sealColor: c.seal_color,
        authorAvatar: c.author_id ? avatarMap[c.author_id] : null,
        poems: poems
          .filter((p) => p.collection_id === c.id && p.status === "published")
          .map((p) => ({ ...p, lines: p.content.split("\n") })),
      }))
      .filter((c) => c.poems.length > 0);
    setCollections(shaped);

    const free = poems
      .filter((p) => !p.collection_id && p.status === "published")
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .map((p) => ({ ...p, lines: p.content.split("\n"), authorAvatar: p.author_id ? avatarMap[p.author_id] : null }));
    setFreePoems(free);

    const drafts = poems
      .filter((p) => p.status === "draft")
      .map((p) => {
        const col = cols.find((c) => c.id === p.collection_id);
        return { ...p, lines: p.content.split("\n"), collection: col || null };
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
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const deepLinkHandled = useRef(false);

  // Open a poem directly if the URL contains ?poem=ID (for shared links)
  useEffect(() => {
    if ((collections.length === 0 && freePoems.length === 0) || deepLinkHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const poemId = params.get("poem");
    if (!poemId) return;
    deepLinkHandled.current = true;
    for (const c of collections) {
      const idx = c.poems.findIndex((p) => String(p.id) === poemId);
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
      const idx = c.poems.findIndex((p) => p.id === poemId);
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
          0% { transform: translateY(-6vh); }
          100% { transform: translateY(106vh); }
        }
        @keyframes rainfall {
          0% { transform: translateY(-10vh) rotate(10deg); }
          100% { transform: translateY(110vh) rotate(10deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .view-enter { animation: fadeIn 0.35s ease-out; }
      `}</style>

      {weather === "snow" && <SideSnow />}
      {weather === "rain" && <SideRain />}
      {weather === "sun" && <SideSun />}

      <div className="relative" style={{ zIndex: 1 }}>
        <TopNav view={view} setView={setView} session={session} profile={profile} darkMode={darkMode} setDarkMode={setDarkMode} goToWrite={() => { setEditingDraft(null); setView("write"); }} />

        {view === "home" && <HomeView collections={collections} topLiked={topLiked} freePoems={freePoems} openCollection={openCollection} openFreePoem={openFreePoem} goToAuthor={goToAuthor} />}
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
            openCollection={openCollection}
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
            openCollection={openCollection}
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
          />
        )}
        {view === "dm" && session && (
          <DMView
            session={session}
            profile={profile}
            initialRecipient={dmRecipient}
            onClearRecipient={() => setDmRecipient(null)}
          />
        )}
      </div>
    </div>
  );
}
