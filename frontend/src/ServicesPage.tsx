import React, { useCallback } from 'react';
import { Navbar, Footer, useSmoothScroll, useScrollAnimation } from './LandingPage';
import './services.css';

const ServicesPage: React.FC = () => {
  useSmoothScroll();
  useScrollAnimation();

  // Scroll helper for in-page smooth navigation
  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="services-page">
      {/* ── EXISTING NAVBAR ── */}
      <Navbar />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 01 — HERO
          ───────────────────────────────────────────────────────────── */}
      <section className="services-hero">
        <div className="container services-hero__content animate-on-scroll">
          <span className="services-eyebrow">SERVICES</span>
          
          <h1 className="services-hero__title">
            Everything you need<br />
            from completion to care.
          </h1>

          <p className="services-hero__subtitle">
            One connected system for managing the work behind every successful property handover.
          </p>

          <button 
            className="services-hero__cta"
            onClick={() => scrollToId('journey')}
          >
            Explore the workflow &darr;
          </button>

          {/* Minimal horizontal journey visual with traveling dot */}
          <div className="services-hero__track">
            <div className="services-hero__track-line"></div>
            <div className="services-hero__track-dot"></div>
            <div className="services-hero__stages">
              <div className="services-hero__stage">
                <div className="services-hero__stage-node"></div>
                <span className="services-hero__stage-name">Build</span>
              </div>
              <div className="services-hero__stage">
                <div className="services-hero__stage-node"></div>
                <span className="services-hero__stage-name">Inspect</span>
              </div>
              <div className="services-hero__stage">
                <div className="services-hero__stage-node"></div>
                <span className="services-hero__stage-name">Handover</span>
              </div>
              <div className="services-hero__stage">
                <div className="services-hero__stage-node"></div>
                <span className="services-hero__stage-name">Care</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 02 — THE JOURNEY (Vertical Timeline)
          ───────────────────────────────────────────────────────────── */}
      <section className="services-journey" id="journey">
        <div className="services-journey__container">
          {/* Continuous vertical spine */}
          <div className="services-journey__spine"></div>

          {/* ── 01: BUILD ── */}
          <div className="journey-step journey-step--left animate-on-scroll">
            <div className="journey-step__content">
              <div className="journey-step__meta">
                <span className="journey-step__number">01</span>
                <span className="journey-step__label">BUILD</span>
              </div>
              <h2 className="journey-step__title">
                Start with a clear view of every project.
              </h2>
              <p className="journey-step__desc">
                Set up projects, blocks, floors, units, customers, employees, contractors, milestones, and completion information in one organized system.
              </p>
              <ul className="journey-step__list">
                <li className="journey-step__list-item">
                  <span className="journey-step__list-dot"></span>
                  Project information
                </li>
                <li className="journey-step__list-item">
                  <span className="journey-step__list-dot"></span>
                  Unit & customer details
                </li>
                <li className="journey-step__list-item">
                  <span className="journey-step__list-dot"></span>
                  Completion milestones
                </li>
                <li className="journey-step__list-item">
                  <span className="journey-step__list-dot"></span>
                  Customer updates
                </li>
                <li className="journey-step__list-item">
                  <span className="journey-step__list-dot"></span>
                  Team & contractor responsibilities
                </li>
              </ul>
            </div>

            <div className="journey-step__spine-node">
              <div className="journey-step__node-circle"></div>
            </div>

            <div className="journey-step__visual">
              <div className="journey-visual-box">
                <div className="visual-build">
                  <div className="visual-build__track"></div>
                  <div className="visual-build__node">
                    <div className="visual-build__point"></div>
                    <span className="visual-build__label">Project</span>
                  </div>
                  <div className="visual-build__node">
                    <div className="visual-build__point"></div>
                    <span className="visual-build__label">Units</span>
                  </div>
                  <div className="visual-build__node">
                    <div className="visual-build__point"></div>
                    <span className="visual-build__label">Team</span>
                  </div>
                  <div className="visual-build__node">
                    <div className="visual-build__point"></div>
                    <span className="visual-build__label">Completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 02: INSPECT ── */}
          <div className="journey-step journey-step--right animate-on-scroll">
            <div className="journey-step__visual">
              <div className="journey-visual-box">
                <div className="visual-inspect">
                  <span className="visual-inspect__step">INSPECT</span>
                  <span className="visual-inspect__arrow">&darr;</span>
                  <span className="visual-inspect__step">REPORT</span>
                  <span className="visual-inspect__arrow">&darr;</span>
                  <span className="visual-inspect__step visual-inspect__step--active">ASSIGN</span>
                  <span className="visual-inspect__arrow">&darr;</span>
                  <span className="visual-inspect__step">RESOLVE</span>
                  <span className="visual-inspect__arrow">&darr;</span>
                  <span className="visual-inspect__step">REINSPECT</span>
                  <span className="visual-inspect__arrow">&darr;</span>
                  <span className="visual-inspect__step">CLOSE</span>
                </div>
              </div>
            </div>

            <div className="journey-step__spine-node">
              <div className="journey-step__node-circle"></div>
            </div>

            <div className="journey-step__content">
              <div className="journey-step__meta">
                <span className="journey-step__number">02</span>
                <span className="journey-step__label">INSPECT</span>
              </div>
              <h2 className="journey-step__title">
                Turn inspections into actionable work.
              </h2>
              <p className="journey-step__desc">
                Manage unit and common-area inspections, create defects, assign them to contractors, track progress, and send completed work through authorised reinspection.
              </p>
            </div>
          </div>

          {/* ── 03: HANDOVER ── */}
          <div className="journey-step journey-step--left animate-on-scroll">
            <div className="journey-step__content">
              <div className="journey-step__meta">
                <span className="journey-step__number">03</span>
                <span className="journey-step__label">HANDOVER</span>
              </div>
              <h2 className="journey-step__title">
                Know when a unit is truly ready.
              </h2>
              <p className="journey-step__desc">
                Bring document readiness, payment clearance, defect resolution, asset readiness, approvals, customer inspection, and final acceptance into one readiness workflow.
              </p>
            </div>

            <div className="journey-step__spine-node">
              <div className="journey-step__node-circle"></div>
            </div>

            <div className="journey-step__visual">
              <div className="journey-visual-box">
                <div className="visual-handover">
                  <div className="visual-handover__row">
                    <span className="visual-handover__key">DOCUMENTS</span>
                    <span className="visual-handover__check">&#10003;</span>
                  </div>
                  <div className="visual-handover__row">
                    <span className="visual-handover__key">PAYMENTS</span>
                    <span className="visual-handover__check">&#10003;</span>
                  </div>
                  <div className="visual-handover__row">
                    <span className="visual-handover__key">DEFECTS</span>
                    <span className="visual-handover__check">&#10003;</span>
                  </div>
                  <div className="visual-handover__row">
                    <span className="visual-handover__key">KEYS</span>
                    <span className="visual-handover__check">&#10003;</span>
                  </div>
                  <div className="visual-handover__row">
                    <span className="visual-handover__key">APPROVALS</span>
                    <span className="visual-handover__check">&#10003;</span>
                  </div>
                  <div className="visual-handover__badge">
                    READY FOR HANDOVER
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 04: CARE ── */}
          <div className="journey-step journey-step--right animate-on-scroll">
            <div className="journey-step__visual">
              <div className="journey-visual-box">
                <div className="visual-care">
                  <div className="visual-care__chain">
                    <span className="visual-care__item">WARRANTY</span>
                    <span className="visual-care__arrow">&rarr;</span>
                    <span className="visual-care__item">SERVICE</span>
                    <span className="visual-care__arrow">&rarr;</span>
                    <span className="visual-care__item">VENDOR</span>
                  </div>
                  <div className="visual-care__chain" style={{ justifyContent: 'center', gap: '16px' }}>
                    <span className="visual-care__arrow">&darr;</span>
                  </div>
                  <div className="visual-care__chain">
                    <span className="visual-care__item">RESOLUTION</span>
                    <span className="visual-care__arrow">&rarr;</span>
                    <span className="visual-care__item">CUSTOMER</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="journey-step__spine-node">
              <div className="journey-step__node-circle"></div>
            </div>

            <div className="journey-step__content">
              <div className="journey-step__meta">
                <span className="journey-step__number">04</span>
                <span className="journey-step__label">CARE</span>
              </div>
              <h2 className="journey-step__title">
                Keep the relationship going after handover.
              </h2>
              <p className="journey-step__desc">
                Continue tracking warranties, defect-liability periods, AMC contracts, service requests, vendors, and resolution progress after the property is handed over.
              </p>
            </div>
          </div>

          {/* ── 05: ASSOCIATION TRANSITION ── */}
          <div className="journey-step journey-step--left animate-on-scroll">
            <div className="journey-step__content">
              <div className="journey-step__meta">
                <span className="journey-step__number">05</span>
                <span className="journey-step__label">ASSOCIATION TRANSITION</span>
              </div>
              <h2 className="journey-step__title">
                Make the final transfer just as organized.
              </h2>
              <p className="journey-step__desc">
                Manage common-area handover, asset registers, vendor contracts, financial and legal documents, pending commitments, and builder-to-association acceptance.
              </p>
            </div>

            <div className="journey-step__spine-node">
              <div className="journey-step__node-circle"></div>
            </div>

            <div className="journey-step__visual">
              <div className="journey-visual-box">
                <div className="visual-association">
                  <div className="visual-association__transfer">
                    <span className="visual-association__entity">BUILDER</span>
                    <div className="visual-association__line-wrap">
                      <div className="visual-association__line"></div>
                      <span className="visual-association__arrow">&rarr;</span>
                    </div>
                    <span className="visual-association__entity">ASSOCIATION</span>
                  </div>
                  <div className="visual-association__meta">
                    Assets &middot; Documents &middot; Vendors &middot; Commitments &middot; Acceptance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 06 — AI ASSISTANCE
          ───────────────────────────────────────────────────────────── */}
      <section className="services-ai" id="services-ai">
        <div className="services-ai__container animate-on-scroll">
          <span className="services-ai__eyebrow">INTELLIGENT WORKFLOWS</span>
          
          <h2 className="services-ai__title">
            Your handover team,<br />
            with an AI assistant.
          </h2>

          <p className="services-ai__desc">
            Turn project information into clear insights, actions, and updates &mdash; without the manual searching and follow-ups.
          </p>

          <div className="services-ai__flow">
            <div className="services-ai__step">
              <span className="services-ai__step-name">UNDERSTAND</span>
              <div className="services-ai__step-line"></div>
            </div>
            <span className="services-ai__flow-arrow">&rarr;</span>
            
            <div className="services-ai__step">
              <span className="services-ai__step-name">ORGANIZE</span>
              <div className="services-ai__step-line"></div>
            </div>
            <span className="services-ai__flow-arrow">&rarr;</span>
            
            <div className="services-ai__step">
              <span className="services-ai__step-name">SUMMARIZE</span>
              <div className="services-ai__step-line"></div>
            </div>
            <span className="services-ai__flow-arrow">&rarr;</span>
            
            <div className="services-ai__step">
              <span className="services-ai__step-name">ASSIST</span>
              <div className="services-ai__step-line"></div>
            </div>
          </div>

          <div className="services-ai__statement">
            Your team stays in control.
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 07 — CLOSING STATEMENT
          ───────────────────────────────────────────────────────────── */}
      <section className="services-closing">
        <div className="services-closing__container animate-on-scroll">
          <span className="services-closing__label">THE HANDOVER JOURNEY</span>
          
          <h2 className="services-closing__title">
            From completion<br />
            to care.
          </h2>

          <p className="services-closing__subtitle">
            One connected workflow for every step that matters.
          </p>

          <div className="services-closing__sequence">
            <span className="services-closing__seq-item">BUILD</span>
            <span className="services-closing__seq-arrow">&rarr;</span>
            <span className="services-closing__seq-item">INSPECT</span>
            <span className="services-closing__seq-arrow">&rarr;</span>
            <span className="services-closing__seq-item">RESOLVE</span>
            <span className="services-closing__seq-arrow">&rarr;</span>
            <span className="services-closing__seq-item">HANDOVER</span>
            <span className="services-closing__seq-arrow">&rarr;</span>
            <span className="services-closing__seq-item">CARE</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 08 — CTA
          ───────────────────────────────────────────────────────────── */}
      <section className="services-cta">
        <div className="services-cta__container animate-on-scroll">
          <h2 className="services-cta__title">
            Ready for a better handover?
          </h2>
          <p className="services-cta__subtitle">
            See how Handoverly brings the entire handover journey together.
          </p>
          <button className="services-cta__button">
            Book a Demo &rarr;
          </button>
        </div>
      </section>

      {/* ── EXISTING FOOTER ── */}
      <Footer />
    </div>
  );
};

export default ServicesPage;
