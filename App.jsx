import { useState, useEffect } from "react";
import { BookOpen, PenLine, User, ArrowLeft, ArrowRight, Heart, Bookmark, MessageCircle, Image as ImageIcon, EyeOff, Send } from "lucide-react";
import { supabase } from "./supabaseClient";


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

function TopNav({ view, setView }) {
  const items = [
    { key: "home", label: "Découvrir", icon: BookOpen },
    { key: "write", label: "Écrire", icon: PenLine },
    { key: "profile", label: "Profil", icon: User },
  ];
  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ background: "var(--paper)", borderColor: "var(--rule)" }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setView("home")}
          className="font-display italic text-2xl tracking-tight"
          style={{ color: "var(--ink)" }}
        >
          Dreams
        </button>
        <nav className="flex items-center gap-1">
          {items.map(({ key, label, icon: Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-ui transition-colors"
                style={{
                  color: active ? "var(--paper-warm)" : "var(--ink)",
                  background: active ? "var(--ink)" : "transparent",
                }}
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function HomeView({ collections, openCollection }) {
  if (collections.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="font-display italic text-xl" style={{ color: "var(--ink-light)" }}>
          Chargement des recueils...
        </p>
      </div>
    );
  }

  const featured = collections[0];
  const featuredPoem = featured.poems[0];
  const excerptLines = featuredPoem.lines.filter((l) => l).slice(0, 3);
  return (
    <div className="max-w-5xl mx-auto px-6">
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
            <WaxSeal letter={featured.seal} color={featured.sealColor} />
            <div className="font-ui text-sm">
              <p style={{ color: "var(--ink)" }}>{featuredPoem.title}</p>
              <p style={{ color: "var(--ink-light)" }}>extrait de « {featured.title} », {featured.author}</p>
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

      {/* Collections grid */}
      <section className="py-14">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
            Nouveaux recueils
          </h2>
          <p className="font-mono text-xs" style={{ color: "var(--ink-light)" }}>
            {collections.length} publiés
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => openCollection(c, 0)}
              className="text-left p-6 rounded-lg border transition-colors hover:shadow-sm group"
              style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <WaxSeal letter={c.seal} color={c.sealColor} />
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
                {c.author} · {c.poems.length} poèmes
              </p>
              <p className="font-display italic text-sm leading-relaxed" style={{ color: "var(--ink-light)" }}>
                « {c.poems[0].lines.find((l) => l)} »
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReaderView({ collection, poemIndex, setPoemIndex, back }) {
  const poem = collection.poems[poemIndex];
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(poem.likes_count);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [commentAnon, setCommentAnon] = useState(false);

  // Reset/load per-poem state whenever the displayed poem changes
  useEffect(() => {
    setLikesCount(poem.likes_count);
    setLiked(localStorage.getItem(`liked_${poem.id}`) === "1");

    let active = true;
    supabase
      .from("comments")
      .select("*")
      .eq("poem_id", poem.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (active && !error && data) setComments(data);
      });
    return () => {
      active = false;
    };
  }, [poem.id]);

  const toggleLike = async () => {
    const next = !liked;
    const delta = next ? 1 : -1;
    setLiked(next);
    setLikesCount((c) => c + delta);
    localStorage.setItem(`liked_${poem.id}`, next ? "1" : "0");
    await supabase
      .from("poems")
      .update({ likes_count: likesCount + delta })
      .eq("id", poem.id);
  };

  const submitComment = async () => {
    if (!draft.trim()) return;
    const newComment = {
      poem_id: poem.id,
      author: commentAnon ? null : "Vous",
      anonymous: commentAnon,
      content: draft.trim(),
    };
    const { data, error } = await supabase.from("comments").insert(newComment).select().single();
    if (!error && data) {
      setComments((prev) => [...prev, data]);
      setDraft("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
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
            <WaxSeal letter={collection.seal} color={collection.sealColor} size={32} />
            <div>
              <p className="font-display italic text-base" style={{ color: "var(--ink)" }}>
                {collection.title}
              </p>
              <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                {collection.author}
              </p>
            </div>
          </div>
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
        </aside>

        {/* Poem reader */}
        <article>
          <h1 className="font-display italic mb-6" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "var(--ink)" }}>
            {poem.title}
          </h1>

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

          {/* Comments */}
          <div className="mt-10 pt-8 border-t" style={{ borderColor: "var(--rule)" }}>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--sage)" }}>
              <MessageCircle size={13} />
              {comments.length} commentaire{comments.length === 1 ? "" : "s"}
            </p>

            <div className="flex flex-col gap-4 mb-6">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <WaxSeal
                    letter={c.anonymous ? "?" : c.author.charAt(0)}
                    color={c.anonymous ? "var(--ink-light)" : "var(--sage)"}
                    size={28}
                  />
                  <div>
                    <p className="font-ui text-xs mb-0.5" style={{ color: "var(--ink-light)" }}>
                      {c.anonymous ? "Anonyme" : c.author}
                    </p>
                    <p className="font-ui text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                      {c.content}
                    </p>
                  </div>
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
                  onClick={submitComment}
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

function WriteView({ onPublished }) {
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [poemTitle, setPoemTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePublish = async () => {
    setSubmitting(true);
    setErrorMsg("");

    const authorName = anonymous ? "Anonyme" : author.trim() || "Anonyme";
    const seal = authorName.charAt(0).toUpperCase();
    const sealColor = SEAL_COLORS[Math.floor(Math.random() * SEAL_COLORS.length)];

    const { data: col, error: colError } = await supabase
      .from("collections")
      .insert({
        title: title.trim(),
        author: authorName,
        theme: theme.trim() || "Inédit",
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

    const { error: poemError } = await supabase.from("poems").insert({
      collection_id: col.id,
      title: poemTitle.trim(),
      content: text,
      image_url: image.trim() || null,
      position: 0,
    });

    setSubmitting(false);

    if (poemError) {
      setErrorMsg("Le recueil a été créé, mais le poème n'a pas pu être ajouté. Réessaie.");
      return;
    }

    if (onPublished) await onPublished();
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="font-mono text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--sage)" }}>
        Nouveau recueil
      </p>
      <h1 className="font-display italic text-3xl mb-10" style={{ color: "var(--ink)" }}>
        Écrire quelque chose
      </h1>

      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="font-ui text-xs uppercase tracking-wider" style={{ color: "var(--ink-light)" }}>
            Votre nom
          </span>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Ex. Sasha M."
            disabled={anonymous}
            className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1 disabled:opacity-40"
            style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
          />
        </label>

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

        <label className="flex flex-col gap-2">
          <span className="font-ui text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--ink-light)" }}>
            <ImageIcon size={13} />
            Image d'illustration (optionnel)
          </span>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Coller un lien d'image..."
            className="font-ui text-sm px-4 py-3 rounded-md border bg-transparent outline-none focus:ring-1"
            style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
          />
          {image && (
            <div className="rounded-lg overflow-hidden border mt-1" style={{ borderColor: "var(--rule)" }}>
              <img src={image} alt="Aperçu" className="w-full h-auto object-cover" style={{ maxHeight: 220 }} />
            </div>
          )}
        </label>

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

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handlePublish}
            disabled={!title.trim() || !poemTitle.trim() || !text.trim() || submitting}
            className="font-ui text-sm px-6 py-3 rounded-full disabled:opacity-30 transition-opacity"
            style={{ background: "var(--ink)", color: "var(--paper-warm)" }}
          >
            {submitting ? "Publication..." : "Publier"}
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

function ProfileView({ collections, openCollection }) {
  const mine = collections[2] ? [collections[2]] : [];
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10">
        <WaxSeal letter="A" color="var(--wine)" size={56} />
        <div>
          <h1 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
            Aïcha Belmont
          </h1>
          <p className="font-ui text-sm" style={{ color: "var(--ink-light)" }}>
            1 recueil · 12 poèmes lus ce mois-ci
          </p>
        </div>
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--sage)" }}>
        Recueils publiés
      </p>
      <div className="flex flex-col gap-3">
        {mine.map((c) => (
          <button
            key={c.id}
            onClick={() => openCollection(c, 0)}
            className="flex items-center justify-between p-5 rounded-lg border text-left transition-colors hover:shadow-sm"
            style={{ background: "var(--paper-warm)", borderColor: "var(--rule)" }}
          >
            <div className="flex items-center gap-4">
              <WaxSeal letter={c.seal} color={c.sealColor} />
              <div>
                <p className="font-display italic text-lg" style={{ color: "var(--ink)" }}>
                  {c.title}
                </p>
                <p className="font-ui text-xs" style={{ color: "var(--ink-light)" }}>
                  {c.poems.length} poèmes · {c.theme}
                </p>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: "var(--ink-light)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState(null);
  const [poemIndex, setPoemIndex] = useState(0);

  const loadCollections = async () => {
    const { data: cols, error: colsError } = await supabase
      .from("collections")
      .select("*")
      .order("id");
    const { data: poems, error: poemsError } = await supabase
      .from("poems")
      .select("*")
      .order("position");

    if (colsError || poemsError || !cols || !poems) return;

    const shaped = cols.map((c) => ({
      ...c,
      sealColor: c.seal_color,
      poems: poems
        .filter((p) => p.collection_id === c.id)
        .map((p) => ({ ...p, lines: p.content.split("\n") })),
    }));
    setCollections(shaped);
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const openCollection = (c, i) => {
    setCollection(c);
    setPoemIndex(i);
    setView("reader");
  };

  return (
    <div
      className="min-h-screen"
      style={{
        "--paper": "#EAE6DC",
        "--paper-warm": "#F7F3EA",
        "--ink": "#262C40",
        "--ink-light": "#7C8194",
        "--wine": "#8B3A4A",
        "--sage": "#6E7F5C",
        "--rule": "#DAD4C6",
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
      `}</style>

      <TopNav view={view} setView={setView} />

      {view === "home" && <HomeView collections={collections} openCollection={openCollection} />}
      {view === "reader" && collection && (
        <ReaderView
          collection={collection}
          poemIndex={poemIndex}
          setPoemIndex={setPoemIndex}
          back={() => setView("home")}
        />
      )}
      {view === "write" && <WriteView onPublished={async () => { await loadCollections(); setView("home"); }} />}
      {view === "profile" && <ProfileView collections={collections} openCollection={openCollection} />}
    </div>
  );
}
