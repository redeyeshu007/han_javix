// @ts-nocheck
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Hyperspeed from './components/Hyperspeed';

// Shared Lenis reference for smooth programmatic navigation
let lenisInstance: Lenis | null = null;
const ENABLE_LENIS = false; // Disabled: Lenis rAF loop conflicts with Hyperspeed WebGL, causing scroll lag
const ENABLE_SCROLL_ANIMATIONS = true;

/* ═══════════════════════════════════════
   Smooth Scrolling Hook (Lenis)
   ═══════════════════════════════════════ */
export function useSmoothScroll(): void {
  // Feature flag: enable or disable Lenis smooth scrolling
  if (!ENABLE_LENIS) return;
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenisInstance = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

/* ═══════════════════════════════════════
   Intersection Observer Hook
   ═══════════════════════════════════════ */
export function useScrollAnimation(): void {
  // Feature flag: enable or disable scroll-triggered animations
  if (!ENABLE_SCROLL_ANIMATIONS) return;
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -30px 0px' }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    // Limit observing to first 30 elements for performance
    Array.from(elements).slice(0, 30).forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

/* ═══════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════ */
export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Product', id: 'reasons' },
    { name: 'Solutions', id: 'roles' },
    { name: 'AI', id: 'ai' },
    { name: 'About', id: 'about' },
  ];

  const scrollToSection = useCallback((id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (lenisInstance && el) {
      lenisInstance.scrollTo(el, { offset: -80, duration: 1.2 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <>
      <div className="announcement-bar"></div>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <a href="#" className="navbar__logo">
            <img src="/logo.png" alt="Handoverly AI" />
          </a>

          <ul className="navbar__links">
            {navLinks.map((link) => (
              <li key={link.name}>
                <span className="navbar__link" onClick={() => scrollToSection(link.id)}>
                  {link.name}
                </span>
              </li>
            ))}
          </ul>

          <div className="navbar__actions">
            <a href="/login" className="navbar__signin">Log in</a>
          </div>

          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div className={`navbar__mobile-menu ${mobileOpen ? 'is-open' : ''}`}>
        {navLinks.map((link) => (
          <span key={link.name} className="navbar__mobile-link" onClick={() => scrollToSection(link.id)}>
            {link.name}
          </span>
        ))}
        <div className="navbar__mobile-actions">
          <button className="navbar__signin" onClick={() => window.location.href = '/login'} style={{ width: '100%' }}>Log in</button>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════ */
const HeroDashboard: React.FC = () => {
  const [animatedProgress, setAnimatedProgress] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="hero-dashboard" ref={ref}>
      {/* Floating cards */}
      <div className="float-card float-card--1">
        <span className="float-card__dot float-card__dot--green" />
        <div>
          <div className="float-card__text">Unit A-203</div>
          <div className="float-card__sub">Ready for Handover</div>
        </div>
      </div>
      <div className="float-card float-card--2">
        <span className="float-card__dot float-card__dot--blue" />
        <div>
          <div className="float-card__text">Electrical Defect</div>
          <div className="float-card__sub">Resolved</div>
        </div>
      </div>
      <div className="float-card float-card--3">
        <span className="float-card__dot float-card__dot--green" />
        <div>
          <div className="float-card__text">Document</div>
          <div className="float-card__sub">Approved</div>
        </div>
      </div>
      <div className="float-card float-card--4">
        <span className="float-card__dot float-card__dot--amber" />
        <div>
          <div className="float-card__text">Payment</div>
          <div className="float-card__sub">Cleared</div>
        </div>
      </div>

      {/* Dashboard header */}
      <div className="hero-dashboard__header">
        <div className="hero-dashboard__project">
          <div className="hero-dashboard__project-icon">GV</div>
          <div className="hero-dashboard__project-info">
            <h3>Green Valley Residency</h3>
            <span>120 Units · Customer Handover Stage</span>
          </div>
        </div>
        <span className="hero-dashboard__badge">Active</span>
      </div>

      {/* Stats */}
      <div className="hero-dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__value">120</div>
          <div className="stat-card__label">Total Units</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value stat-card__value--green">78</div>
          <div className="stat-card__label">Handed Over</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value stat-card__value--blue">14</div>
          <div className="stat-card__label">Ready for Inspection</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value stat-card__value--red">11</div>
          <div className="stat-card__label">Blocked</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value stat-card__value--amber">17</div>
          <div className="stat-card__label">Active Defects</div>
        </div>
      </div>

      {/* Progress */}
      <div className="hero-dashboard__progress">
        <div className="progress-item">
          <div className="progress-item__header">
            <span className="progress-item__label">Construction</span>
            <span className="progress-item__value">92%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill progress-bar__fill--green" style={{ width: animatedProgress ? '92%' : '0%' }} />
          </div>
        </div>
        <div className="progress-item">
          <div className="progress-item__header">
            <span className="progress-item__label">Inspection</span>
            <span className="progress-item__value">76%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: animatedProgress ? '76%' : '0%' }} />
          </div>
        </div>
        <div className="progress-item">
          <div className="progress-item__header">
            <span className="progress-item__label">Documentation</span>
            <span className="progress-item__value">68%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill progress-bar__fill--amber" style={{ width: animatedProgress ? '68%' : '0%' }} />
          </div>
        </div>
        <div className="progress-item">
          <div className="progress-item__header">
            <span className="progress-item__label">Handover</span>
            <span className="progress-item__value">65%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill progress-bar__fill--sky" style={{ width: animatedProgress ? '65%' : '0%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const AIBanner: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  
  const slides = [
    {
      title: "Know which defects are critical instantly with AI",
      desc: "Auto-tag, prioritize, and assign issues—all powered by Handoverly AI.",
      features: ["✓ Smart Defect Tagging", "✓ Auto Priority Scoring", "✓ Instant Team Assignment"],
      theme: "theme-navy"
    },
    {
      title: "Automate your daily reports and paperwork",
      desc: "Generate comprehensive site diaries and PDF reports with a single click.",
      features: ["✓ Photo Recognition", "✓ Smart Analytics", "✓ Auto Report Generation"],
      theme: "theme-teal"
    },
    {
      title: "Predict delays before they even happen",
      desc: "Stay ahead of schedule with AI-driven risk identification and forecasting.",
      features: ["✓ Predictive Timelines", "✓ Risk Identification", "✓ Subcontractor Tracking"],
      theme: "theme-purple"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = slides[slideIndex];

  return (
    <div className={`ai-banner ${currentSlide.theme}`}>
      <div className="container ai-banner__inner">
        <div className="ai-banner__text">
          <span className="ai-banner__badge">
            BUILT FOR HANDOVERS 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
          <h2 key={`title-${slideIndex}`} className="ai-banner__title animate-fade-in">
            {currentSlide.title}
          </h2>
          <p key={`desc-${slideIndex}`} className="ai-banner__desc animate-fade-in">
            {currentSlide.desc}
          </p>
        </div>
        <div className="ai-banner__text-base">
          {currentSlide.features.map((feat, i) => (
            <p key={`feat-${slideIndex}-${i}`} className="animate-fade-in">{feat}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

const HeroSection: React.FC = () => (
  <section className="hero" id="hero">
    <AIBanner />
    <div className="container">
      <div className="hero__content">
        <div className="hero__eyebrow">
          Builder Handover OS
        </div>
        <h1 className="hero__title">
          <span>Every handover.</span>
          <span>Completely under control.</span>
        </h1>
        <p className="hero__description">
          Handoverly brings project completion, inspections, defects, documents, payments, customer approvals, and final handover into one connected workflow.
        </p>
        <div className="hero__actions">
          <button className="btn btn--primary btn--lg">Book a Demo →</button>
        </div>
        <p className="hero__trust-text">
          Built for builders. Built for better handovers.
        </p>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   REASONS SECTION (Editorial Layout)
   ═══════════════════════════════════════ */
const ReasonsSection: React.FC = () => {
  const reasons = [
    { id: '01', title: 'One Connected Workflow', desc: 'Bring project completion, inspections, defects, documents, payments, and handover into one organized workflow.' },
    { id: '02', title: 'Know What’s Blocking Handover', desc: 'See unresolved defects, missing documents, pending payments, and approvals holding a unit back.' },
    { id: '03', title: 'Close Defects With Accountability', desc: 'Assign defects to the right contractor, track progress, collect evidence, and require authorised reinspection.' },
    { id: '04', title: 'Give Customers a Better Handover', desc: 'Keep customers informed about inspections, documents, payments, defects, and handover readiness.' },
    { id: '05', title: 'Never Lose the Important Details', desc: 'Organise documents, keys, access cards, assets, meter readings, warranties, and handover records in one place.' },
    { id: '06', title: 'Keep the Journey Going After Handover', desc: 'Track warranties, service requests, vendors, AMCs, common areas, assets, and transition to the owners’ association.' }
  ];

  return (
    <section className="reasons-editorial section" id="reasons">
      <div className="container">
        <div className="reasons-editorial__header animate-on-scroll">
          <h2 className="reasons-editorial__title">
            Everything connected. <span className="reasons-editorial__title-highlight">Nothing overlooked.</span>
          </h2>
          <p className="reasons-editorial__subtitle">
            Six capabilities. One seamless handover experience.
          </p>
        </div>
        
        <div className="reasons-editorial__grid">
          {reasons.map((reason, index) => (
            <div key={index} className="reasons-editorial__item animate-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
              <div className="reasons-editorial__number">{reason.id}</div>
              <div className="reasons-editorial__line"></div>
              <div className="reasons-editorial__dot"></div>
              <div className="reasons-editorial__content">
                <h3 className="reasons-editorial__item-title">{reason.title}</h3>
                <p className="reasons-editorial__item-desc">{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════
   ABOUT HANDOVERLY SECTION
   ═══════════════════════════════════════ */
const AboutHandoverlySection: React.FC = () => (
  <section className="about-editorial section" id="about">
    <div className="container">
      {/* Editorial Header */}
      <div className="about-editorial__header animate-on-scroll">
        <div className="about-editorial__eyebrow">
          About Handoverly
        </div>
        <h2 className="about-editorial__headline">
          <span className="about-headline__line">The Builder Handover OS designed to make property</span>
          <span className="about-headline__line">handovers organized, transparent, and accountable.</span>
        </h2>
        <p className="about-editorial__lead">
          <span className="about-lead__line">Handoverly brings project completion, inspections, defect resolution, documents, payments,</span>
          <span className="about-lead__line">customer approvals, final handover, warranty, service, and association transition into one connected workflow.</span>
        </p>
      </div>

      {/* Narrative & Transformation Grid */}
      <div className="about-editorial__grid animate-on-scroll">
        {/* Left Column: The Problem */}
        <div className="about-editorial__card about-editorial__card--problem">
          <div className="about-editorial__card-tag">THE PROBLEM</div>
          <h3 className="about-editorial__card-title">Scattered tools create lost details and delays</h3>
          <p className="about-editorial__card-text">
            Instead of relying on scattered WhatsApp messages, Excel sheets, emails, paper checklists, and separate records, builders need a single source of truth.
          </p>
          <div className="about-editorial__scattered-pills">
            <span className="scattered-pill">WhatsApp Chats</span>
            <span className="scattered-pill">Excel Sheets</span>
            <span className="scattered-pill">Email Threads</span>
            <span className="scattered-pill">Paper Checklists</span>
            <span className="scattered-pill">Separate Records</span>
          </div>
        </div>

        {/* Right Column: The Handoverly OS Solution */}
        <div className="about-editorial__card about-editorial__card--solution">
          <div className="about-editorial__card-tag about-editorial__card-tag--active">ONE CONNECTED OS</div>
          <h3 className="about-editorial__card-title">One place from project completion to post-handover care</h3>
          <p className="about-editorial__card-text">
            Handoverly gives builders and their teams one place to manage the entire journey from project completion to post-handover care with complete transparency.
          </p>
          <div className="about-editorial__flow-chain">
            <span className="about-flow-item">Completion</span>
            <span className="about-flow-arrow">&rarr;</span>
            <span className="about-flow-item">Inspections</span>
            <span className="about-flow-arrow">&rarr;</span>
            <span className="about-flow-item">Approvals</span>
            <span className="about-flow-arrow">&rarr;</span>
            <span className="about-flow-item">Handover</span>
            <span className="about-flow-arrow">&rarr;</span>
            <span className="about-flow-item">Care</span>
          </div>
        </div>
        </div>
      </div>

      {/* Built For Stakeholders Full-Width Banner (Zero Side Margins) */}
      <div className="about-editorial__stakeholders animate-on-scroll">
        <div className="container">
          <div className="about-editorial__stakeholders-label">
            BUILT FOR EVERY TEAM THROUGHOUT THE HANDOVER JOURNEY
          </div>
          <div className="about-editorial__stakeholders-list">
            <span className="stakeholder-badge">Builders</span>
            <span className="stakeholder-badge">Project Managers</span>
            <span className="stakeholder-badge">Site Teams</span>
            <span className="stakeholder-badge">CRM Teams</span>
            <span className="stakeholder-badge">Accounts Teams</span>
            <span className="stakeholder-badge">Contractors</span>
            <span className="stakeholder-badge">Customers</span>
            <span className="stakeholder-badge">Associations</span>
          </div>
          <p className="about-editorial__stakeholders-summary">
            Built for builders, project managers, site teams, CRM and accounts teams, contractors, customers, and associations &mdash; Handoverly helps everyone stay aligned, responsibilities clear, and important information connected throughout the handover journey.
          </p>
        </div>
      </div>
    </section>
  );



/* ═══════════════════════════════════════
   WORKFLOW SECTION
   ═══════════════════════════════════════ */
const WorkflowSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Build',
      icon: '🏗️',
      iconClass: 'workflow__step-icon--build',
      desc: 'Track project, blocks, floors, units, customers and milestones.',
    },
    {
      number: '02',
      title: 'Inspect',
      icon: '🔍',
      iconClass: 'workflow__step-icon--inspect',
      desc: 'Inspect units and common areas using structured checklists.',
    },
    {
      number: '03',
      title: 'Resolve',
      icon: '🔧',
      iconClass: 'workflow__step-icon--resolve',
      desc: 'Assign and track defects through contractor resolution and reinspection.',
    },
    {
      number: '04',
      title: 'Approve',
      icon: '✅',
      iconClass: 'workflow__step-icon--approve',
      desc: 'Verify readiness, documents and financial clearance.',
    },
    {
      number: '05',
      title: 'Handover',
      icon: '🔑',
      iconClass: 'workflow__step-icon--handover',
      desc: 'Transfer keys, assets, documents and digital acceptance.',
    },
    {
      number: '06',
      title: 'Care',
      icon: '🛡️',
      iconClass: 'workflow__step-icon--care',
      desc: 'Manage warranties, service requests and ongoing obligations.',
    },
  ];

  return (
    <section className="workflow section" id="workflow">
      <div className="container">
        <div className="section__header animate-on-scroll">
          <span className="section__eyebrow">Core Workflow</span>
          <h2 className="section__title">From project completion to successful handover.</h2>
          <p className="section__subtitle">
            Every unit follows a structured journey from construction to customer handover and warranty care.
          </p>
        </div>

        <div className="workflow__steps animate-on-scroll">
          {steps.map((step, i) => (
            <div key={step.number} className={`workflow__step animate-on-scroll animate-delay-${i + 1}`}>
              <div className="workflow__step-number">{step.number}</div>
              <div className={`workflow__step-icon ${step.iconClass}`}>{step.icon}</div>
              <div className="workflow__step-title">{step.title}</div>
              <div className="workflow__step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════
   SHOWCASE SECTION 1 – Project Dashboard
   ═══════════════════════════════════════ */
const ShowcaseDashboard: React.FC = () => (
  <section className="showcase section" id="showcase-dashboard">
    <div className="container">
      <div className="showcase__grid animate-on-scroll">
        <div className="showcase__content">
          <span className="section__eyebrow">Project Visibility</span>
          <h2 className="showcase__title">Know exactly what is blocking handover.</h2>
          <p className="showcase__description">
            See every unit's status, track critical defects, monitor payment clearance, identify missing documents, and measure handover progress — all in real time.
          </p>
          <button className="btn btn--primary">Learn More →</button>
        </div>
        <div className="showcase__visual">
          <div className="mock-ui">
            <div className="mock-ui__header">
              <span className="mock-ui__title">Project Dashboard</span>
              <span className="mock-ui__badge mock-ui__badge--green">Active</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Total Units', value: '120', color: '' },
                { label: 'Ready for Inspection', value: '14', color: 'stat-card__value--blue' },
                { label: 'Critical Defects', value: '5', color: 'stat-card__value--red' },
                { label: 'Payment Pending', value: '8', color: 'stat-card__value--amber' },
                { label: 'Missing Documents', value: '12', color: 'stat-card__value--amber' },
                { label: 'Handover Progress', value: '65%', color: 'stat-card__value--green' },
              ].map((s) => (
                <div key={s.label} className="stat-card" style={{ padding: '14px' }}>
                  <div className={`stat-card__value ${s.color}`} style={{ fontSize: '1.25rem' }}>{s.value}</div>
                  <div className="stat-card__label" style={{ fontSize: '0.65rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Construction', pct: 92, cls: 'progress-bar__fill--green' },
                { label: 'Inspection', pct: 76, cls: '' },
                { label: 'Documentation', pct: 68, cls: 'progress-bar__fill--amber' },
              ].map((p) => (
                <div key={p.label} className="progress-item">
                  <div className="progress-item__header">
                    <span className="progress-item__label" style={{ fontSize: '0.8rem' }}>{p.label}</span>
                    <span className="progress-item__value" style={{ fontSize: '0.8rem' }}>{p.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar__fill ${p.cls}`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   SHOWCASE SECTION 2 – Inspection
   ═══════════════════════════════════════ */
const ShowcaseInspection: React.FC = () => (
  <section className="showcase showcase--alt section" id="showcase-inspection">
    <div className="container">
      <div className="showcase__grid showcase__grid--reverse animate-on-scroll">
        <div className="showcase__content">
          <span className="section__eyebrow">Inspection</span>
          <h2 className="showcase__title">Turn every inspection into a tracked workflow.</h2>
          <p className="showcase__description">
            Structured checklists for every room and system. Each item gets a clear status — passed, defect found, resolved, or not applicable — so nothing is left to memory.
          </p>
          <button className="btn btn--primary">Learn More →</button>
        </div>
        <div className="showcase__visual">
          <div className="mock-ui">
            <div className="mock-ui__header">
              <span className="mock-ui__title">Inspection Checklist · Unit A-203</span>
              <span className="mock-ui__badge mock-ui__badge--blue">In Progress</span>
            </div>
            {[
              {
                category: 'Entrance',
                items: [
                  { name: 'Main door', status: 'Passed', cls: 'status--passed' },
                  { name: 'Lock', status: 'Passed', cls: 'status--passed' },
                  { name: 'Door frame', status: 'Defect Found', cls: 'status--defect' },
                ],
              },
              {
                category: 'Kitchen',
                items: [
                  { name: 'Counter', status: 'Passed', cls: 'status--passed' },
                  { name: 'Sink & Plumbing', status: 'Defect Found', cls: 'status--defect' },
                  { name: 'Cabinets', status: 'Passed', cls: 'status--passed' },
                ],
              },
              {
                category: 'Electrical',
                items: [
                  { name: 'Switches & Sockets', status: 'Passed', cls: 'status--passed' },
                  { name: 'Distribution Board', status: 'Resolved', cls: 'status--resolved' },
                  { name: 'Earthing', status: 'N/A', cls: 'status--na' },
                ],
              },
            ].map((cat) => (
              <div key={cat.category} className="checklist-mock__category">
                <div className="checklist-mock__category-title">{cat.category}</div>
                {cat.items.map((item) => (
                  <div key={item.name} className="checklist-mock__item">
                    <span className="checklist-mock__item-name">
                      <span style={{ color: item.cls === 'status--passed' ? 'var(--color-green)' : item.cls === 'status--defect' ? 'var(--color-red)' : item.cls === 'status--resolved' ? 'var(--color-blue)' : 'var(--color-text-secondary)' }}>
                        {item.cls === 'status--passed' ? '✓' : item.cls === 'status--defect' ? '✕' : item.cls === 'status--resolved' ? '↻' : '—'}
                      </span>
                      {item.name}
                    </span>
                    <span className={`checklist-mock__item-status ${item.cls}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   SHOWCASE SECTION 3 – Defect Management
   ═══════════════════════════════════════ */
const ShowcaseDefects: React.FC = () => (
  <section className="showcase section" id="showcase-defects">
    <div className="container">
      <div className="showcase__grid animate-on-scroll">
        <div className="showcase__content">
          <span className="section__eyebrow">Defect Management</span>
          <h2 className="showcase__title">Close defects with accountability.</h2>
          <p className="showcase__description">
            Every defect follows a structured lifecycle — from reporting through contractor assignment, resolution, and reinspection. Contractors cannot directly close defects. An authorised builder employee must inspect and approve.
          </p>
          <button className="btn btn--primary">Learn More →</button>
        </div>
        <div className="showcase__visual">
          <div className="mock-ui">
            <div className="mock-ui__header">
              <span className="mock-ui__title">Defect Lifecycle</span>
            </div>
            <div className="defect-lifecycle">
              {['Reported', 'Assigned', 'Accepted', 'In Progress', 'Reinspection', 'Resolved', 'Closed'].map((step, i) => (
                <div key={step} className="defect-lifecycle__step">
                  <span className={`defect-lifecycle__node ${i < 5 ? 'defect-lifecycle__node--done' : i === 5 ? 'defect-lifecycle__node--active' : ''}`}>
                    {step}
                  </span>
                  {i < 6 && <span className="defect-lifecycle__arrow">→</span>}
                </div>
              ))}
            </div>

            <div className="defect-card">
              <div className="defect-card__header">
                <span className="defect-card__title">Kitchen sink plumbing leak</span>
                <span className="mock-ui__badge mock-ui__badge--red">Critical</span>
              </div>
              <div className="defect-card__meta">
                <span className="defect-card__meta-item">👷 Plumbing Contractor</span>
                <span className="defect-card__meta-item">📍 Unit A-203 · Kitchen</span>
                <span className="defect-card__meta-item">📅 Due: Aug 25</span>
              </div>
            </div>
            <div className="defect-card">
              <div className="defect-card__header">
                <span className="defect-card__title">Door frame alignment issue</span>
                <span className="mock-ui__badge mock-ui__badge--amber">High</span>
              </div>
              <div className="defect-card__meta">
                <span className="defect-card__meta-item">👷 Carpentry Contractor</span>
                <span className="defect-card__meta-item">📍 Unit A-203 · Entrance</span>
                <span className="defect-card__meta-item">📅 Due: Aug 22</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   SHOWCASE SECTION 4 – Handover Readiness
   ═══════════════════════════════════════ */
const ShowcaseHandover: React.FC = () => (
  <section className="showcase showcase--alt section" id="showcase-handover">
    <div className="container">
      <div className="showcase__grid showcase__grid--reverse animate-on-scroll">
        <div className="showcase__content">
          <span className="section__eyebrow">Handover Readiness</span>
          <h2 className="showcase__title">Everything required before the keys change hands.</h2>
          <p className="showcase__description">
            Before any unit is handed over, every readiness dimension must be verified — the unit itself, documents, finances, assets, and approvals.
          </p>
          <button className="btn btn--primary">Learn More →</button>
        </div>
        <div className="showcase__visual">
          <div className="mock-ui">
            <div className="mock-ui__header">
              <span className="mock-ui__title">Handover Readiness · Unit A-203</span>
              <span className="mock-ui__badge mock-ui__badge--amber">4 of 5 Ready</span>
            </div>
            <div className="readiness-grid">
              {[
                { icon: '🏠', title: 'Unit Readiness', status: 'Ready', cls: 'status--passed' },
                { icon: '📄', title: 'Document Readiness', status: 'Ready', cls: 'status--passed' },
                { icon: '💰', title: 'Financial Readiness', status: 'Pending', cls: 'status--defect' },
                { icon: '🔑', title: 'Asset Readiness', status: 'Ready', cls: 'status--passed' },
                { icon: '✅', title: 'Approval Readiness', status: 'Ready', cls: 'status--passed' },
              ].map((item) => (
                <div key={item.title} className="readiness-card">
                  <div className="readiness-card__icon">{item.icon}</div>
                  <div className="readiness-card__title">{item.title}</div>
                  <span className={`readiness-card__status ${item.cls}`}>{item.status}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Keys', status: '✓' },
                { label: 'Access Cards', status: '✓' },
                { label: 'Parking Allotment', status: '✓' },
                { label: 'Meter Readings', status: '✓' },
                { label: 'Documents', status: '✓' },
                { label: 'Payment Clearance', status: 'Pending' },
                { label: 'Customer Acceptance', status: 'Awaiting' },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                }}>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{item.label}</span>
                  <span style={{
                    fontWeight: 600,
                    color: item.status === '✓' ? 'var(--color-green)' : 'var(--color-amber)',
                  }}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   CUSTOMER EXPERIENCE SECTION
   ═══════════════════════════════════════ */
const CustomerSection: React.FC = () => (
  <section className="showcase section" id="customer">
    <div className="container">
      <div className="showcase__grid animate-on-scroll">
        <div className="showcase__content">
          <span className="section__eyebrow">Customer Experience</span>
          <h2 className="showcase__title">Give customers clarity before handover day.</h2>
          <p className="showcase__description">
            Customers see their unit's progress, inspection status, required documents, payment status, open defects, and handover readiness — without needing to call.
          </p>
          <div className="customer-journey">
            {[
              { label: 'Inspection Scheduled', cls: 'customer-journey__step--done' },
              { label: 'Issues Reported', cls: 'customer-journey__step--done' },
              { label: 'Issues Resolved', cls: 'customer-journey__step--done' },
              { label: 'Customer Approval', cls: 'customer-journey__step--active' },
              { label: 'Handover Scheduled', cls: '' },
              { label: 'Unit Handed Over', cls: '' },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                <span className={`customer-journey__step ${step.cls}`}>{step.label}</span>
                {i < 5 && <span className="customer-journey__arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="showcase__visual">
          <div className="customer-mock">
            <div className="mock-ui__header" style={{ marginBottom: '16px', paddingBottom: '12px' }}>
              <span className="mock-ui__title">My Unit · A-203</span>
              <span className="mock-ui__badge mock-ui__badge--blue">Customer View</span>
            </div>
            {[
              { section: 'Progress', items: [
                { label: 'Unit Completion', value: '96%', color: 'var(--color-green)' },
                { label: 'Next Milestone', value: 'Final Inspection', color: 'var(--color-blue)' },
              ]},
              { section: 'Status', items: [
                { label: 'Inspection', value: 'Completed', color: 'var(--color-green)' },
                { label: 'Open Defects', value: '1 remaining', color: 'var(--color-amber)' },
                { label: 'Payment Status', value: 'Cleared', color: 'var(--color-green)' },
                { label: 'Documents', value: '8 of 9 approved', color: 'var(--color-blue)' },
              ]},
              { section: 'Readiness', items: [
                { label: 'Handover Readiness', value: 'Almost Ready', color: 'var(--color-amber)' },
              ]},
            ].map((sec) => (
              <div key={sec.section} className="customer-mock__section">
                <div className="customer-mock__section-title">{sec.section}</div>
                {sec.items.map((item) => (
                  <div key={item.label} className="customer-mock__row">
                    <span className="customer-mock__label">{item.label}</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   AI SECTION
   ═══════════════════════════════════════ */
const AISection: React.FC = () => (
  <section className="ai-section section" id="ai">
    <div className="container">
      <div className="section__header animate-on-scroll">
        <span className="section__eyebrow section__eyebrow--light">✦ Handoverly AI</span>
        <h2 className="section__title">AI that helps your team move handovers forward.</h2>
        <p className="section__subtitle">Intelligent assistance without taking away human control.</p>
      </div>

      <div className="ai__grid animate-on-scroll">
        <div className="ai-chat">
          <div className="ai-chat__header">
            <div className="ai-chat__avatar">✦</div>
            <div>
              <div className="ai-chat__title">AI Handover Summary</div>
              <div className="ai-chat__subtitle">Generated just now</div>
            </div>
          </div>
          <div className="ai-chat__body">
            <div className="ai-chat__project">Green Valley Residency</div>
            <div className="ai-chat__stat">
              <span className="ai-chat__stat-value">11</span> units are currently blocked.
            </div>
            <div style={{ paddingLeft: '16px', margin: '8px 0 12px', color: 'rgba(255,255,255,0.65)', fontSize: 'var(--font-size-sm)' }}>
              <div>• 6 by unresolved defects</div>
              <div>• 3 by missing documents</div>
              <div>• 2 by payment clearance</div>
            </div>
            <div className="ai-chat__actions">
              <div className="ai-chat__action-title">Recommended next actions</div>
              <div className="ai-chat__action">Follow up on plumbing defects in Tower A</div>
              <div className="ai-chat__action">Request missing documents for 3 units</div>
              <div className="ai-chat__action">Review payment clearance for Units B-104, B-201</div>
            </div>
          </div>
        </div>

        <div className="ai-capabilities">
          {[
            { icon: '📄', title: 'Document Understanding', desc: 'Identify document types, extract dates, detect missing information.' },
            { icon: '🎤', title: 'Voice-Note Updates', desc: 'Convert spoken site updates into structured project entries.' },
            { icon: '🔧', title: 'Defect Intelligence', desc: 'Suggest categories, priorities, and detect similar past defects.' },
            { icon: '📊', title: 'Handover Summaries', desc: 'Generate management reports with blocking issues and next actions.' },
            { icon: '💬', title: 'Customer Communication', desc: 'Draft updates, invitations, and reminders in Tamil, English, or mixed.' },
            { icon: '🎯', title: 'Priority Suggestions', desc: 'Highlight critical items blocking handover progress.' },
          ].map((cap) => (
            <div key={cap.title} className="ai-cap">
              <div className="ai-cap__icon">{cap.icon}</div>
              <div className="ai-cap__title">{cap.title}</div>
              <div className="ai-cap__desc">{cap.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   DOCUMENTS + PAYMENTS SECTION
   ═══════════════════════════════════════ */
const DocsPaymentSection: React.FC = () => (
  <section className="section section--bg" id="documents">
    <div className="container">
      <div className="section__header animate-on-scroll">
        <span className="section__eyebrow">Readiness Gates</span>
        <h2 className="section__title">Nothing important gets lost before handover.</h2>
        <p className="section__subtitle">
          Documents and payment clearance are mandatory gates before any unit can be handed over.
        </p>
      </div>

      <div className="docs-payment__grid animate-on-scroll">
        <div className="docs-payment__card">
          <div className="docs-payment__card-title">📄 Document Readiness</div>
          <div className="docs-payment__statuses">
            {[
              { label: 'Required', color: 'var(--color-text-secondary)' },
              { label: 'Requested', color: 'var(--color-amber)' },
              { label: 'Uploaded', color: 'var(--color-blue)' },
              { label: 'Under Review', color: 'var(--color-sky)' },
              { label: 'Approved', color: 'var(--color-green)' },
              { label: 'Rejected', color: 'var(--color-red)' },
              { label: 'Expired', color: 'var(--color-text-tertiary)' },
            ].map((s) => (
              <div key={s.label} className="docs-payment__status">
                <span className="docs-payment__status-label">{s.label}</span>
                <span className="docs-payment__status-dot" style={{ background: s.color }} />
              </div>
            ))}
          </div>
        </div>

        <div className="docs-payment__card">
          <div className="docs-payment__card-title">💰 Payment Clearance</div>
          <div className="docs-payment__statuses">
            {[
              { label: 'Not Reviewed', color: 'var(--color-text-secondary)' },
              { label: 'Pending Payment', color: 'var(--color-amber)' },
              { label: 'Partially Cleared', color: 'var(--color-sky)' },
              { label: 'Cleared', color: 'var(--color-green)' },
              { label: 'Approved for Handover', color: 'var(--color-green)' },
              { label: 'On Hold', color: 'var(--color-red)' },
            ].map((s) => (
              <div key={s.label} className="docs-payment__status">
                <span className="docs-payment__status-label">{s.label}</span>
                <span className="docs-payment__status-dot" style={{ background: s.color }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   ASSOCIATION SECTION
   ═══════════════════════════════════════ */
const AssociationSection: React.FC = () => {
  const steps = [
    'Builder', 'Documents Shared', 'Assets Shared', 'Vendors Shared',
    'Common Areas Inspected', 'Pending Obligations', 'Association Acceptance'
  ];

  return (
    <section className="section" id="association">
      <div className="container">
        <div className="section__header animate-on-scroll">
          <span className="section__eyebrow">Association Transition</span>
          <h2 className="section__title">The handover doesn't end at the front door.</h2>
          <p className="section__subtitle">
            Handoverly tracks common areas, assets, vendor contracts, warranties, financial records, builder commitments, and association acceptance.
          </p>
        </div>

        <div className="association__flow animate-on-scroll">
          {steps.map((step, i) => (
            <React.Fragment key={step}>
              <div className="association__flow-step">{step}</div>
              {i < steps.length - 1 && <span className="association__flow-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════
   TESTIMONIALS SECTION
   ═══════════════════════════════════════ */
const TestimonialsSection: React.FC = () => (
  <section className="section section--bg" id="testimonials">
    <div className="container">
      <div className="section__header animate-on-scroll">
        <span className="section__eyebrow">Testimonials</span>
        <h2 className="section__title">What our customers say</h2>
        <p className="section__subtitle">
          Real feedback from teams using Handoverly to manage their property handovers.
        </p>
      </div>

      <div className="testimonials__grid animate-on-scroll">
        {[
          { initials: '?', role: 'Builder Owner' },
          { initials: '?', role: 'Project Manager' },
          { initials: '?', role: 'Site Engineer' },
        ].map((t, i) => (
          <div key={i} className="testimonial-card">
            <p className="testimonial-card__quote">"Add customer testimonial here."</p>
            <div className="testimonial-card__author">
              <div className="testimonial-card__avatar">{t.initials}</div>
              <div>
                <div className="testimonial-card__name">Customer Name</div>
                <div className="testimonial-card__role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   WHO IT'S FOR SECTION
   ═══════════════════════════════════════ */
const RolesSection: React.FC = () => {
  const roles = [
    { icon: '🏢', title: 'Builder Owners', desc: 'Monitor all projects, delays, defects, and handover progress company-wide.' },
    { icon: '📋', title: 'Project Managers', desc: 'Coordinate departments, approve readiness, and confirm units for customer inspection.' },
    { icon: '🔧', title: 'Site Engineers', desc: 'Update site progress, inspect units, create defects, and verify contractor work.' },
    { icon: '💬', title: 'CRM Teams', desc: 'Schedule inspections, manage documents, coordinate payments, and collect customer acceptance.' },
    { icon: '💰', title: 'Accounts Teams', desc: 'Update payment status, confirm financial clearance, and approve handover finances.' },
    { icon: '👷', title: 'Contractors', desc: 'Accept assigned defects, update work progress, and submit for reinspection.' },
    { icon: '🏠', title: 'Property Customers', desc: 'View unit progress, report inspection issues, track resolutions, and accept handover.' },
    { icon: '🏛️', title: 'Association Representatives', desc: 'Review common areas, assets, documents, vendors, and accept builder-to-association transition.' },
  ];

  return (
    <section className="section" id="roles">
      <div className="container">
        <div className="section__header animate-on-scroll">
          <span className="section__eyebrow">Built For</span>
          <h2 className="section__title">Built for every team involved in handover.</h2>
          <p className="section__subtitle">
            From builder owners to property customers — everyone has a role in a successful handover.
          </p>
        </div>

        <div className="roles__grid animate-on-scroll">
          {roles.map((role) => (
            <div key={role.title} className="role-card">
              <div className="role-card__icon">{role.icon}</div>
              <div className="role-card__title">{role.title}</div>
              <div className="role-card__desc">{role.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════ */
const FinalCTA: React.FC = () => (
  <section className="final-cta" id="cta">
    <div className="container">
      <div className="animate-on-scroll">
        <h2 className="final-cta__title">
          <span>Finish projects.</span>
          <span>Close defects.</span>
          <span>Hand over with confidence.</span>
        </h2>
        <p className="final-cta__description">
          Bring every handover task, approval, document, defect, and commitment into one connected system.
        </p>
        <div className="final-cta__actions">
          <button className="btn btn--navy btn--lg">Book a Demo →</button>
          <button className="btn btn--outline-light btn--lg">Explore Handoverly →</button>
        </div>
      </div>
    </div>
  </section>
);
/* ═══════════════════════════════════════
   ROLES SECTION (Editorial Interactive Layout)
   ═══════════════════════════════════════ */
const RolesEditorialSection: React.FC = () => {
  const [activeRole, setActiveRole] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const roles = [
    { 
      name: 'Builder Owners', color: '#0F172A', headline: 'See the bigger picture.', 
      desc: 'Monitor project completion, delays, unresolved defects, customer handovers, and overall progress.',
      features: ['Portfolio-wide visibility', 'Real-time financial clearance', 'Risk & delay forecasting'],
      cta: 'Explore Owner Tools'
    },
    { 
      name: 'Project Managers', color: '#064E3B', headline: 'Keep the project moving.', 
      desc: 'Coordinate teams, inspections, readiness, defects, and delayed work.',
      features: ['Automated milestone tracking', 'Cross-team defect routing', 'Instant readiness reports'],
      cta: 'Explore PM Tools'
    },
    { 
      name: 'Site Engineers', color: '#7C2D12', headline: 'Turn site updates into action.', 
      desc: 'Update progress, inspect units, upload evidence, and track defects.',
      features: ['Mobile site inspections', 'One-click defect logging', 'Photo & evidence uploads'],
      cta: 'Explore Site Tools'
    },
    { 
      name: 'CRM Teams', color: '#4C1D95', headline: 'Keep customers informed.', 
      desc: 'Manage inspections, documents, questions, payments, and handover schedules.',
      features: ['Automated customer updates', 'Document portal access', 'Streamlined key handover'],
      cta: 'Explore CRM Tools'
    },
    { 
      name: 'Accounts Teams', color: '#0C4A6E', headline: 'Know what\'s financially ready.', 
      desc: 'Track payment status and provide financial clearance.',
      features: ['Payment milestone triggers', 'Financial clearance workflows', 'Invoice tracking'],
      cta: 'Explore Finance Tools'
    },
    { 
      name: 'Contractors', color: '#881337', headline: 'Know exactly what needs to be done.', 
      desc: 'Accept assigned tasks, track defect resolutions, and submit updates for reinspection.',
      features: ['Direct task assignment', 'Proof of completion', 'Instant reinspection requests'],
      cta: 'Explore Contractor Tools'
    },
  ];

  React.useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveRole((prev) => (prev + 1) % roles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, roles.length]);

  return (
    <section className="roles-editorial section" id="roles">
      <div className="container">
        <div className="roles-editorial__header animate-on-scroll">
          <h2 className="roles-editorial__title">
            One Project. Everyone Aligned.
          </h2>
          <p className="roles-editorial__subtitle">
            Give every team the clarity they need.
          </p>
        </div>
      </div>

      <div 
        className="roles-editorial__layout animate-on-scroll"
        style={{ '--role-bg': roles[activeRole].color, backgroundColor: 'var(--role-bg)', transition: 'background-color 0.4s ease' } as React.CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="roles-editorial__sidebar">
            {roles.map((role, idx) => (
              <button 
                key={role.name}
                className={`roles-editorial__tab ${activeRole === idx ? 'is-active' : ''}`}
                onClick={() => setActiveRole(idx)}
              >
                {role.name}
              </button>
            ))}
          </div>

          <div className="roles-editorial__content-area">
            {roles.map((role, idx) => (
              <div 
                key={role.name}
                className={`roles-editorial__panel ${activeRole === idx ? 'is-active' : ''}`}
              >
                <h3 className="roles-editorial__panel-headline">{role.headline}</h3>
                <p className="roles-editorial__panel-desc">{role.desc}</p>
                
                <ul className="roles-editorial__features">
                  {role.features.map(feat => (
                    <li key={feat} className="roles-editorial__feature">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="roles-editorial__check">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button className="roles-editorial__cta">
                  {role.cta} <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════
   AI ASSISTANT SECTION (Pure Typography Flow)
   ═══════════════════════════════════════ */
const AIAssistantSection: React.FC = () => (
  <section className="ai-typo-section section" id="ai" style={{ position: 'relative' }}>
    <Hyperspeed
      effectOptions={{
        "distortion":"turbulentDistortion",
        "length":400,
        "roadWidth":10,
        "islandWidth":2,
        "lanesPerRoad":3,
        "fov":90,
        "fovSpeedUp":150,
        "speedUp":2,
        "carLightsFade":0.4,
        "totalSideLightSticks":20,
        "lightPairsPerRoadWay":40,
        "shoulderLinesWidthPercentage":0.05,
        "brokenLinesWidthPercentage":0.1,
        "brokenLinesLengthPercentage":0.5,
        "lightStickWidth":[0.12,0.5],
        "lightStickHeight":[1.3,1.7],
        "movingAwaySpeed":[60,80],
        "movingCloserSpeed":[-120,-160],
        "carLightsLength":[12,80],
        "carLightsRadius":[0.05,0.14],
        "carWidthPercentage":[0.3,0.5],
        "carShiftX":[-0.8,0.8],
        "carFloorSeparation":[0,5],
        "colors":{
          "roadColor":526344,
          "islandColor":657930,
          "background":0,
          "shoulderLines":1250072,
          "brokenLines":1250072,
          "leftCars":[14177983,6770850,12732332],
          "rightCars":[242627,941733,3294549],
          "sticks":242627
        }
      }}
    />
    <div className="container" style={{ position: 'relative', zIndex: 10 }}>
      <div className="ai-typo__layout animate-on-scroll">
        
        <div className="ai-typo__content">

          
          <h2 className="ai-typo__title">
            Your handover team, <span className="text-blue">with an AI assistant.</span>
          </h2>
          
          <p className="ai-typo__desc">
            Turn project information into clear insights, actions, and updates — without the manual searching and follow-ups.
          </p>


          
          <button className="btn btn--blue btn--lg ai-typo__cta">
            Explore Handoverly AI &rarr;
          </button>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════ */
export const Footer: React.FC = () => (
  <footer className="footer-pro" id="about">
    <div className="footer-pro__container">

      {/* Top: brand + columns */}
      <div className="footer-pro__main">
        <div className="footer-pro__brand-col">
          <div className="footer-pro__logo">HANDOVERLY AI</div>
          <p className="footer-pro__tagline">
            The AI-powered handover platform built for construction teams.
            Inspect faster, resolve smarter, close with confidence.
          </p>
        </div>
        <div className="footer-pro__columns">
          <div className="footer-pro__col">
            <div className="footer-pro__col-title">Product</div>
            <a href="#" className="footer-pro__link">AI Inspection</a>
            <a href="#" className="footer-pro__link">Defect Tracker</a>
            <a href="#" className="footer-pro__link">Handover Readiness</a>
            <a href="#" className="footer-pro__link">Smart Workflows</a>
            <a href="#" className="footer-pro__link">Integrations</a>
          </div>
          <div className="footer-pro__col">
            <div className="footer-pro__col-title">Solutions</div>
            <a href="#" className="footer-pro__link">For Contractors</a>
            <a href="#" className="footer-pro__link">For Developers</a>
            <a href="#" className="footer-pro__link">For Project Managers</a>
            <a href="#" className="footer-pro__link">Enterprise</a>
            <a href="#" className="footer-pro__link">Consulting Firms</a>
          </div>
          <div className="footer-pro__col">
            <div className="footer-pro__col-title">Company</div>
            <a href="#" className="footer-pro__link">About Us</a>
            <a href="#" className="footer-pro__link">Careers</a>
            <a href="#" className="footer-pro__link">Blog</a>
            <a href="#" className="footer-pro__link">Press</a>
            <a href="#" className="footer-pro__link">Contact</a>
          </div>
          <div className="footer-pro__col">
            <div className="footer-pro__col-title">Resources</div>
            <a href="#" className="footer-pro__link">Documentation</a>
            <a href="#" className="footer-pro__link">Case Studies</a>
            <a href="#" className="footer-pro__link">Changelog</a>
            <a href="#" className="footer-pro__link">API Reference</a>
            <a href="#" className="footer-pro__link">Status</a>
          </div>
        </div>
      </div>

      {/* Statement */}
      <div className="footer-pro__statement-row">
        <span className="footer-pro__statement">Build better. <em>Handover smarter.</em></span>
        <a href="#" className="footer-pro__cta-link">Get early access &rarr;</a>
      </div>

      {/* Divider */}
      <div className="footer-pro__divider"></div>

      {/* Bottom bar */}
      <div className="footer-pro__bottom">
        <div className="footer-pro__copyright">
          &copy; {new Date().getFullYear()} Handoverly AI. All rights reserved.
        </div>
        <div className="footer-pro__legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Security</a>
          <a href="#">Cookies</a>
        </div>
      </div>

    </div>
  </footer>
);

/* ═══════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════ */
const LandingPage: React.FC = () => {
  useSmoothScroll();
  useScrollAnimation();

  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <ReasonsSection />
      <AboutHandoverlySection />
      <RolesEditorialSection />
      <AIAssistantSection />

      <Footer />
    </div>
  );
};

export default LandingPage;
