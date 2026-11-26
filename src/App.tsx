import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import Lenis from "lenis";
import { Player } from "@remotion/player";
import { Snow } from "./components/Snow";
import { JourneyMap, JOURNEY_FRAMES, JOURNEY_H, JOURNEY_W } from "./remotion/JourneyMap";
import { DEPARTURES, FAQ, GALLERY, TREKS, asset, img, waLink, type Level, type Trek } from "./data";

type Country = "All" | "Nepal" | "India";
type LevelF = "All" | Level;
type Group = Trek["group"] | null;

const GROUPS: { id: Trek["group"]; kicker: string; title: string; sub: string; img: string }[] = [
  { id: "nepal", kicker: "Nepal", title: "Base camps of giants", sub: "Everest · Annapurna · Mardi · Manaslu", img: "treks/annapurna-base-camp.webp" },
  { id: "buddha", kicker: "West Bengal", title: "Walk to the Sleeping Buddha", sub: "Sandakphu – Phalut · winter departures", img: "treks/sandakphu.webp" },
  { id: "offbeat", kicker: "Sikkim & North-East", title: "Offbeat & untouched", sub: "Goechala · Dzükou · Silent Valley", img: "treks/goechala.webp" },
];

const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Run a state update inside a View Transition when the browser supports it. */
function withTransition(fn: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => void };
  if (d.startViewTransition && !reduced) d.startViewTransition(() => flushSync(fn));
  else fn();
}

let lenis: Lenis | null = null;
const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: "smooth" });
};

function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function WaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" /></svg>
  );
}

/* ================================================================== */
export default function App() {
  const [snow, setSnow] = useState(!reduced);
  const [country, setCountry] = useState<Country>("All");
  const [level, setLevel] = useState<LevelF>("All");
  const [group, setGroup] = useState<Group>(null);
  const [open, setOpen] = useState<Trek | null>(null);
  const [journeyId, setJourneyId] = useState("sandakphu");
  const [year, setYear] = useState("2026");
  const [faq, setFaq] = useState<number | null>(0);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const playerWrap = useRef<HTMLDivElement>(null);

  // smooth scrolling
  useEffect(() => {
    if (reduced) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); lenis = null; };
  }, []);
  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 30);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  // lock scroll while the drawer is open
  useEffect(() => {
    if (open) lenis?.stop(); else lenis?.start();
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const list = useMemo(
    () => TREKS.filter((t) => (country === "All" || t.country === country) && (level === "All" || t.level === level) && (!group || t.group === group)),
    [country, level, group],
  );
  useReveal([list.length, year]);

  const journeyTrek = TREKS.find((t) => t.id === journeyId)!;
  const go = (id: string) => { setMenu(false); scrollTo(id); };
  const pickGroup = (g: Trek["group"]) => { withTransition(() => { setGroup(g); setCountry("All"); setLevel("All"); }); scrollTo("treks"); };
  const previewJourney = (t: Trek) => { setOpen(null); setJourneyId(t.id); setTimeout(() => scrollTo("journey"), 50); };

  return (
    <>
      {/* ============ NAV ============ */}
      <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="nav__in">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <span className="brand__badge"><img src={asset("brand/logo.png")} alt="The Trekking Buddha logo" /></span>
            <span className="brand__name">Trekking Buddha</span>
          </a>
          <nav className={`nav__links ${menu ? "is-open" : ""}`}>
            {[["treks", "Treks"], ["journey", "Journey"], ["departures", "Departures"], ["story", "About"], ["trails", "Story-Trails"], ["faq", "FAQ"]].map(([id, label]) => (
              <button key={id} onClick={() => go(id)}>{label}</button>
            ))}
          </nav>
          <button className="btn btn--dark nav__cta" onClick={() => go("contact")}>Plan my trek</button>
          <button className={`burger ${menu ? "is-open" : ""}`} aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}><span /><span /></button>
        </div>
        <div className="nav__progress" style={{ transform: `scaleX(${progress})` }} />
      </header>

      <main id="top">
        {/* ============ TRIFOLD HERO ============ */}
        <section className="hero">
          <div className="trifold" role="list">
            {GROUPS.map((g, i) => (
              <button key={g.id} role="listitem" className={`fold fold--${i}`} style={{ backgroundImage: `url(${img(g.img)})` }} onClick={() => pickGroup(g.id)} aria-label={`Show ${g.title} treks`}>
                <span className="fold__shade" />
                <span className="fold__num">0{i + 1}</span>
                <span className="fold__body">
                  <span className="fold__kicker">{g.kicker}</span>
                  <span className="fold__title">{g.title}</span>
                  <span className="fold__sub">{g.sub}</span>
                  <span className="fold__cta">Explore treks →</span>
                </span>
              </button>
            ))}
            <Snow on={snow} />
          </div>

          <div className="hero__card reveal">
            <p className="eyebrow">Nepal · India · Since 2021</p>
            <h1>Walk the Himalayas <em>with a calm mind.</em></h1>
            <p className="hero__lead">Small groups, offbeat trails, certified mountaineers and a medical team — so you can simply walk.</p>
            <form className="finder" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); withTransition(() => { setCountry(f.get("c") as Country); setLevel(f.get("l") as LevelF); setGroup(null); }); scrollTo("treks"); }}>
              <label><span>Where</span>
                <select name="c" defaultValue="All"><option value="All">Nepal or India</option><option>Nepal</option><option>India</option></select>
              </label>
              <label><span>Level</span>
                <select name="l" defaultValue="All"><option value="All">Any level</option><option>Easy</option><option>Moderate</option><option>Challenging</option></select>
              </label>
              <button className="btn btn--saffron" type="submit">Find my trek</button>
            </form>
            <ul className="trust">
              <li>Certified Mountaineer</li><li>Registered Guide</li><li>Medical Team</li>
            </ul>
          </div>
        </section>

        {/* ============ TREK FINDER ============ */}
        <section className="section" id="treks">
          <div className="wrap">
            <div className="head reveal">
              <div>
                <p className="eyebrow">Treks 2027</p>
                <h2>Find the trek that <em>fits you.</em></h2>
              </div>
              <div className="filters">
                <div className="seg" role="group" aria-label="Country">
                  {(["All", "Nepal", "India"] as Country[]).map((c) => (
                    <button key={c} className={country === c ? "on" : ""} onClick={() => withTransition(() => { setCountry(c); setGroup(null); })}>{c === "All" ? "All countries" : c}</button>
                  ))}
                </div>
                <div className="seg" role="group" aria-label="Level">
                  {(["All", "Easy", "Moderate", "Challenging"] as LevelF[]).map((l) => (
                    <button key={l} className={level === l ? "on" : ""} onClick={() => withTransition(() => setLevel(l))}>{l === "All" ? "Any level" : l}</button>
                  ))}
                </div>
              </div>
            </div>
            {group && (
              <button className="pill-clear" onClick={() => withTransition(() => setGroup(null))}>
                Collection: {GROUPS.find((g) => g.id === group)!.title} <b>×</b>
              </button>
            )}
            <div className="grid">
              {list.map((t) => (
                <article key={t.id} className="tcard" style={{ viewTransitionName: `trek-${t.id}` } as CSSProperties}>
                  <button className="tcard__img" onClick={() => setOpen(t)} aria-label={`Open ${t.name}`}>
                    <img src={img(t.img)} alt={`${t.name} trek`} loading="lazy" />
                    <span className={`lvl lvl--${t.level.toLowerCase()}`}>{t.level}</span>
                  </button>
                  <div className="tcard__body">
                    <p className="tcard__meta">{t.country} · {t.region}</p>
                    <h3>{t.name}</h3>
                    <p className="tcard__hl">{t.highlight}</p>
                    <div className="tcard__actions">
                      <button className="link" onClick={() => setOpen(t)}>View trek</button>
                      {t.route.length > 3 && <button className="link link--muted" onClick={() => previewJourney(t)}>▶ Preview route</button>}
                    </div>
                  </div>
                </article>
              ))}
              {list.length === 0 && (
                <div className="empty">
                  <p>No trek matches that combination yet.</p>
                  <a className="btn btn--dark" href={waLink("Hi Trekking Buddha! Can you suggest a trek for me?")} target="_blank" rel="noopener">Ask us for a suggestion</a>
                </div>
              )}
            </div>
            <p className="note">Levels are indicative. Message us and we'll match a trek to your fitness and dates.</p>
          </div>
        </section>

        {/* ============ REMOTION JOURNEY ============ */}
        <section className="section section--ice" id="journey">
          <div className="wrap">
            <div className="head head--center reveal">
              <p className="eyebrow">Preview the journey</p>
              <h2>Follow the Buddha <em>through the snow.</em></h2>
              <p className="muted">Pick a trek and watch its typical route unfold, stop by stop. Your final itinerary comes from the team.</p>
            </div>
            <div className="jtabs reveal" role="tablist">
              {TREKS.filter((t) => t.route.length > 3).map((t) => (
                <button key={t.id} role="tab" aria-selected={journeyId === t.id} className={journeyId === t.id ? "on" : ""} onClick={() => setJourneyId(t.id)}>{t.name}</button>
              ))}
            </div>
            <div className="player reveal" ref={playerWrap}>
              <Player
                key={journeyTrek.id}
                component={JourneyMap}
                inputProps={{ trek: journeyTrek }}
                durationInFrames={JOURNEY_FRAMES}
                compositionWidth={JOURNEY_W}
                compositionHeight={JOURNEY_H}
                fps={30}
                autoPlay
                loop
                controls
                clickToPlay
                style={{ width: "100%", aspectRatio: `${JOURNEY_W} / ${JOURNEY_H}` }}
              />
            </div>
            <div className="jcta reveal">
              <a className="btn btn--saffron" href={waLink(`Hi Trekking Buddha! I'd like the full itinerary for the ${journeyTrek.name} trek.`)} target="_blank" rel="noopener"><WaIcon /> Get the full {journeyTrek.name} itinerary</a>
            </div>
          </div>
        </section>

        {/* ============ DEPARTURES ============ */}
        <section className="section" id="departures">
          <div className="wrap">
            <div className="head reveal">
              <div>
                <p className="eyebrow">Winter 2026 – 27</p>
                <h2>Next departures. <em>Seats are limited.</em></h2>
              </div>
              <p className="muted head__aside">Choose a date to reserve your seat on WhatsApp.</p>
            </div>
            <div className="deps">
              {DEPARTURES.map((d) => (
                <div className="dep reveal" key={d.trek}>
                  <img className="dep__poster" src={img(d.poster)} alt={`${d.trek} poster`} loading="lazy" />
                  <div className="dep__info">
                    <h3>{d.trek}</h3>
                    <p className="muted">{d.dates.length} departure{d.dates.length > 1 ? "s" : ""} · group trek</p>
                  </div>
                  <div className="dep__dates">
                    {d.dates.map((x) => (
                      <a key={x} className="date" href={waLink(`Hi Trekking Buddha! I'd like to reserve a seat on the ${d.trek} (${x}).`)} target="_blank" rel="noopener">
                        <span>{x}</span><b>Reserve</b>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ WHY ============ */}
        <section className="why">
          <div className="wrap why__grid">
            {[
              ["01", "Certified mountaineers", "Trained at HMI & NIMAS. Our founder taught at HMI, Darjeeling."],
              ["02", "Registered guides", "Leaders who know the trail, the weather and the people."],
              ["03", "Medical team", "Safety briefings and a medical team on every trek."],
              ["04", "Responsible travel", "Your trek supports families in remote villages — no extra donations, ever."],
            ].map(([n, t, d]) => (
              <div className="why__item reveal" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </section>

        {/* ============ STORY ============ */}
        <section className="section" id="story">
          <div className="wrap story">
            <div className="story__img reveal"><img src={img("photos/pandim.webp")} alt="Mount Pandim at dusk" loading="lazy" /></div>
            <div className="story__txt">
              <p className="eyebrow reveal">Our story</p>
              <h2 className="reveal">950 days on a bicycle. <em>One idea.</em></h2>
              <p className="reveal">Founder <strong>Jyotishko Biswas</strong> cycled across India for nearly 950 days and completed 35+ treks along the way. During the COVID years he guided a small group into the forests of Meghalaya — and a modest $20 tip showed him how many people wanted authentic, well-guided trekking rooted in knowledge and responsibility.</p>
              <p className="reveal">After professional training at the Himalayan Mountaineering Institute and NIMAS, and serving as an instructor at HMI, he founded Trekking Buddha in 2021.</p>
              <div className="nums reveal">
                <div><b>1,252</b><span>trekkers since 2024</span></div>
                <div><b>35+</b><span>founder's treks</span></div>
                <div><b>22+</b><span>lives supported</span></div>
              </div>
              <a className="link" href="https://jyotishkobiswas.com/" target="_blank" rel="noopener">Read Jyotishko's journey →</a>
            </div>
          </div>
        </section>

        {/* ============ STORY-TRAILS ============ */}
        <section className="section section--ice" id="trails">
          <div className="wrap">
            <div className="head reveal">
              <div>
                <p className="eyebrow">Story-Trails</p>
                <h2>{GALLERY[year].title}. <em>{GALLERY[year].count} trekkers.</em></h2>
              </div>
              <div className="seg">
                {Object.keys(GALLERY).map((y) => (
                  <button key={y} className={year === y ? "on" : ""} onClick={() => withTransition(() => setYear(y))}>{y}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="rail" key={year}>
            {GALLERY[year].imgs.map((n, i) => (
              <figure key={n} className="rail__item" style={{ animationDelay: `${i * 70}ms` }}>
                <img src={img(`gallery/${n}.webp`)} alt={`Trekking Buddha group, ${year}`} loading="lazy" />
              </figure>
            ))}
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="section" id="faq">
          <div className="wrap faq">
            <div className="reveal">
              <p className="eyebrow">Good to know</p>
              <h2>Questions, <em>answered.</em></h2>
              <p className="muted">Still curious? We reply fast on WhatsApp.</p>
              <a className="btn btn--dark" href={waLink("Hi Trekking Buddha! I have a question.")} target="_blank" rel="noopener"><WaIcon /> Ask a question</a>
            </div>
            <div className="acc">
              {FAQ.map((f, i) => (
                <div key={f.q} className={`acc__item reveal ${faq === i ? "open" : ""}`}>
                  <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>{f.q}<span>+</span></button>
                  <div className="acc__a"><div><p>{f.a}</p></div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section className="section section--tight" id="contact">
          <div className="wrap">
            <div className="cta reveal" style={{ "--cta-img": `url(${img("photos/winter.webp")})` } as CSSProperties}>
              <div className="cta__txt">
                <p className="eyebrow eyebrow--light">Plan your trek</p>
                <h2>Your summit <em>is calling.</em></h2>
                <ul>
                  <li><a href="tel:+919932141614">📞 +91 99321 41614</a></li>
                  <li><a href="mailto:info@trekkingbuddha.com">✉️ info@trekkingbuddha.com</a></li>
                  <li>📍 5 Anandapally Main, Nadia 741152, West Bengal</li>
                </ul>
              </div>
              <form className="cta__form" onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                window.open(waLink(`Hi Trekking Buddha! 🙏\nName: ${f.get("n")}\nTrek: ${f.get("t")}\nWhen: ${f.get("m") || "-"}\nPeople: ${f.get("p")}`), "_blank", "noopener");
              }}>
                <input name="n" required placeholder="Your name" />
                <select name="t" defaultValue="Not sure yet">
                  <option>Not sure yet</option>
                  {TREKS.map((t) => <option key={t.id}>{t.name}</option>)}
                </select>
                <div className="row"><input name="m" placeholder="When? e.g. January" /><input name="p" type="number" min={1} defaultValue={1} aria-label="People" /></div>
                <button className="btn btn--saffron" type="submit"><WaIcon /> Send on WhatsApp</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__in">
          <span className="brand__badge brand__badge--sm"><img src={asset("brand/logo.png")} alt="The Trekking Buddha logo" /></span>
          <p>© 2026 Trekking Buddha · Nadia, West Bengal, India</p>
          <div className="social">
            <a href="https://www.facebook.com/thetrekkingbuddha/" target="_blank" rel="noopener">Facebook</a>
            <a href="https://www.instagram.com/the_trekking_buddha/" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.youtube.com/@JyotishkoBiswasIndia" target="_blank" rel="noopener">YouTube</a>
          </div>
        </div>
      </footer>

      {/* snow toggle + mobile booking bar */}
      <button className={`snowtoggle ${snow ? "on" : ""}`} onClick={() => setSnow(!snow)} aria-pressed={snow} aria-label="Toggle snowfall">❄ <span>{snow ? "Snow on" : "Snow off"}</span></button>
      <div className="mbar">
        <button className="btn btn--ghost" onClick={() => go("treks")}>Find a trek</button>
        <a className="btn btn--saffron" href={waLink("Hi Trekking Buddha! I'd like to plan a trek.")} target="_blank" rel="noopener"><WaIcon /> WhatsApp</a>
      </div>

      {/* ============ TREK DRAWER ============ */}
      <div className={`drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="drawer__scrim" onClick={() => setOpen(null)} />
        {open && (
          <aside className="drawer__panel" role="dialog" aria-label={open.name} data-lenis-prevent>
            <button className="drawer__x" onClick={() => setOpen(null)} aria-label="Close">×</button>
            <img className="drawer__img" src={img(open.img)} alt={`${open.name} trek`} />
            <div className="drawer__body">
              <p className="eyebrow">{open.country} · {open.region}</p>
              <h3>{open.name}</h3>
              <div className="chips">
                <span className={`lvl lvl--${open.level.toLowerCase()}`}>{open.level}</span>
                {open.summit && <span className="chip">🏔 {open.summit}</span>}
                <span className="chip">Small group</span>
              </div>
              <p>{open.highlight}</p>
              <h4>Typical route</h4>
              <ol className="route">{open.route.map((r) => <li key={r}>{r}</li>)}</ol>
              <p className="note">The exact itinerary, price and inclusions are shared by the team on request.</p>
              <div className="drawer__actions">
                <a className="btn btn--saffron" href={waLink(`Hi Trekking Buddha! I'm interested in the ${open.name} trek. Please share dates, itinerary and price.`)} target="_blank" rel="noopener"><WaIcon /> Ask about this trek</a>
                {open.route.length > 3 && <button className="btn btn--ghost" onClick={() => previewJourney(open)}>▶ Preview route</button>}
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
