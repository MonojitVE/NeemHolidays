import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  Landmark,
  Sparkles,
  Sailboat,
  Globe2,
  Settings,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

// Unsplash realistic images
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=90", // Amsterdam canal
  amsterdam:
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=900&q=85",
  paris:
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=85",
  keukenhof:
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900&q=85",
  parisCulture:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=85",
  giethoorn:
    "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=900&q=85",
  miniEurope:
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900&q=85",
  slide1:
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1400&q=85",
  slide2:
    "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=1400&q=85",
  slide3:
    "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=1400&q=85",
};

const SLIDES = [
  {
    img: IMAGES.hero,
    city: "Amsterdam",
    tag: "Netherlands · Belgium · France",
    subtitle: "European Dream",
  },
  {
    img: IMAGES.slide1,
    city: "Paris",
    tag: "Culture · Food · Attractions",
    subtitle: "City of Light",
  },
  {
    img: IMAGES.keukenhof,
    city: "Keukenhof",
    tag: "Tulip Gardens · Spring Tourism",
    subtitle: "Flower Paradise",
  },
];

const DESTINATIONS = [
  {
    img: IMAGES.paris,
    label: "PARIS",
    sub: "Eiffel Tower · Louvre Museum · Seine River · French Cuisine",
    color: "orange",
    size: "large",
  },
  {
    img: IMAGES.amsterdam,
    label: "AMSTERDAM",
    sub: "Canal Cruise · Van Gogh Museum · Jordaan District",
    color: "teal",
    size: "normal",
  },
  {
    img: IMAGES.parisCulture,
    label: "PARIS CULTURE",
    sub: "Art, cafés, fashion, heritage, museums, and city events",
    color: "teal",
    size: "normal",
  },
  {
    img: IMAGES.keukenhof,
    label: "KEUKENHOF",
    sub: "Tulip Gardens · Flower Exhibitions · Spring Tourism",
    color: "orange",
    size: "normal",
  },
];

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("visible"),
        ),
      { threshold: 0.13 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [sliding, setSliding] = useState(false);
  const timerRef = useRef(null);
  useScrollReveal();

  const goTo = (idx) => {
    if (sliding || idx === slide) return;
    setSliding(true);
    setPrevSlide(slide);
    setSlide(idx);
    setTimeout(() => {
      setSliding(false);
      setPrevSlide(null);
    }, 800);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSlide((s) => {
        const next = (s + 1) % SLIDES.length;
        setPrevSlide(s);
        setSliding(true);
        setTimeout(() => {
          setSliding(false);
          setPrevSlide(null);
        }, 800);
        return next;
      });
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="hm-root">
      {/* NAVBAR */}
      <nav className="hm-nav">
        <span className="hm-logo">
          <Plane
            size={18}
            strokeWidth={2.5}
            style={{ marginRight: 6, verticalAlign: "-3px" }}
          />
          MASA<span>Travels</span>
        </span>
        <div className="hm-nav-links">
          <Link to="/blogs">Blogs</Link>
          <Link to="/login" className="hm-nav-cta">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* HERO SLIDER */}
      <section className="hm-hero">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`hm-slide ${i === slide ? "hm-slide-active" : ""} ${i === prevSlide ? "hm-slide-exit" : ""}`}
            style={{ backgroundImage: `url(${s.img})` }}
          >
            <div className="hm-slide-overlay" />
            <div className="hm-slide-content">
              <span className="hm-slide-tag reveal fade-up">{s.tag}</span>
              <h1 className="hm-slide-city reveal fade-up delay-1">{s.city}</h1>
              <p className="hm-slide-sub reveal fade-up delay-2">
                {s.subtitle}
              </p>
              <div className="hm-slide-btns reveal fade-up delay-3">
                <Link to="/blogs" className="hm-hero-btn primary">
                  Explore Blogs <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
                <a href="#destinations" className="hm-hero-btn ghost">
                  Destinations <ArrowDown size={15} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Slide dots */}
        <div className="hm-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hm-dot ${i === slide ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Stats strip */}
        <div className="hm-stats-strip">
          <div>
            <span className="hm-stat-num">10</span>
            <span className="hm-stat-label">Days</span>
          </div>
          <div>
            <span className="hm-stat-num">₹1.8L+</span>
            <span className="hm-stat-label">From</span>
          </div>
          <div className="orange">
            <span className="hm-stat-num">AI</span>
            <span className="hm-stat-label">Blogs</span>
          </div>
          <div>
            <span className="hm-stat-num">3</span>
            <span className="hm-stat-label">Countries</span>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <section className="hm-tabs-section">
        <div className="hm-tabs">
          <div className="hm-tab active">
            <div className="hm-tab-icon">
              <Landmark size={26} strokeWidth={1.75} />
            </div>
            <strong>PARIS</strong>
            <p>Culture, Food & Attractions</p>
          </div>
          <div className="hm-tab orange">
            <div className="hm-tab-icon">
              <Sparkles size={26} strokeWidth={1.75} />
            </div>
            <strong>AI BLOGS</strong>
            <p>RSS News → Human Approval</p>
          </div>
          <div className="hm-tab">
            <div className="hm-tab-icon">
              <Sailboat size={26} strokeWidth={1.75} />
            </div>
            <strong>AMSTERDAM</strong>
            <p>Canals, Museums & Events</p>
          </div>
        </div>
      </section>

      {/* DESTINATIONS GALLERY */}
      <section id="destinations" className="hm-gallery-section">
        <div className="hm-section-header reveal fade-up">
          <span className="hm-eyebrow">Explore Destinations</span>
          <h2>European Dream Awaits</h2>
          <p>Fresh travel content powered by AI, approved by humans</p>
        </div>
        <div className="hm-gallery">
          {/* Large Paris card */}
          <div className="hm-gcard large reveal fade-left">
            <img src={DESTINATIONS[0].img} alt="Paris" loading="lazy" />
            <div className="hm-glabel orange">
              <h3>{DESTINATIONS[0].label}</h3>
              <p>{DESTINATIONS[0].sub}</p>
            </div>
            <div className="hm-gcard-hover">
              <Link to="/blogs" className="hm-explore-btn">
                Read Articles{" "}
                <ArrowRight
                  size={14}
                  strokeWidth={2.5}
                  style={{ verticalAlign: "-2px", marginLeft: 4 }}
                />
              </Link>
            </div>
          </div>
          {/* Right column */}
          <div className="hm-gcol">
            {DESTINATIONS.slice(1).map((d, i) => (
              <div
                key={i}
                className={`hm-gcard reveal fade-right delay-${i + 1}`}
              >
                <img src={d.img} alt={d.label} loading="lazy" />
                <div className={`hm-glabel ${d.color}`}>
                  <h3>{d.label}</h3>
                  <p>{d.sub}</p>
                </div>
                <div className="hm-gcard-hover">
                  <Link to="/blogs" className="hm-explore-btn">
                    Read Articles{" "}
                    <ArrowRight
                      size={14}
                      strokeWidth={2.5}
                      style={{ verticalAlign: "-2px", marginLeft: 4 }}
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="hm-highlights reveal fade-up">
        <div className="hm-hl-col teal">
          <h2>Amsterdam Highlights</h2>
          <ul>
            <li>Canal Cruise Stories</li>
            <li>Van Gogh Museum Updates</li>
            <li>Jordaan District Guides</li>
            <li>Dutch Culture & Local Events</li>
            <li>Amsterdam Festival News</li>
            <li>Tourism Attraction Blogs</li>
          </ul>
        </div>
        <div className="hm-hl-col orange">
          <h2>Paris Highlights</h2>
          <ul>
            <li>Eiffel Tower Updates</li>
            <li>Louvre Museum Stories</li>
            <li>Seine River Travel Ideas</li>
            <li>French Food & Café Culture</li>
            <li>Fashion, Art & Heritage</li>
            <li>Famous Paris Events</li>
          </ul>
        </div>
      </section>

      {/* PLATFORM OPTIONS */}
      <section className="hm-platform">
        <div className="hm-platform-header reveal fade-up">
          <span className="hm-eyebrow">Platform Options</span>
          <h2>PLATFORM OPTIONS</h2>
        </div>
        <div className="hm-platform-cards">
          <div className="hm-pcard teal reveal fade-left">
            <div className="hm-pcard-icon">
              <Globe2 size={32} strokeWidth={1.75} />
            </div>
            <h3>PUBLIC TRAVEL SITE</h3>
            <p className="hm-pcard-sub">Paris & Amsterdam Blogs</p>
            <ul>
              <li>Accepted blogs appear publicly</li>
              <li>Clean article formatting</li>
              <li>SEO title and meta description</li>
              <li>Travel-news focused content</li>
              <li>Brochure-style visual layout</li>
            </ul>
            <Link to="/blogs" className="hm-pcard-btn">
              View Blogs{" "}
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                style={{ verticalAlign: "-2px", marginLeft: 4 }}
              />
            </Link>
          </div>
          <div className="hm-pcard orange reveal fade-right">
            <div className="hm-pcard-icon">
              <Settings size={32} strokeWidth={1.75} />
            </div>
            <h3>ADMIN DASHBOARD</h3>
            <p className="hm-pcard-sub">AI Content Review</p>
            <ul>
              <li>Fetch RSS and generate blogs</li>
              <li>Review pending AI content</li>
              <li>Accept or reject each blog</li>
              <li>Prepare social media posts</li>
              <li>Mock/real posting workflow ready</li>
            </ul>
            <Link to="/login" className="hm-pcard-btn">
              Open Dashboard{" "}
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                style={{ verticalAlign: "-2px", marginLeft: 4 }}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hm-footer">
        <div className="hm-footer-inner">
          <span className="hm-logo">
            <Plane
              size={20}
              strokeWidth={2.5}
              style={{ marginRight: 6, verticalAlign: "-3px" }}
            />
            MASA<span>Travels</span>
          </span>
          <p>AI-powered travel content for Paris & Amsterdam</p>
          <div className="hm-footer-links">
            <Link to="/blogs">Blogs</Link>
            <Link to="/login">Admin</Link>
          </div>
          <p className="hm-footer-copy">
            © 2025 MASATravels · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
