import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import CircuitBG from "./cyber/CircuitBG";
import Reveal from "./cyber/Reveal";
import Cursor from "./cyber/Cursor";
import ScrollHUD from "./cyber/ScrollHUD";
import "./team.css";
import data from "../database/data.json";

const Card = ({ title, items, featured = false, code, id }) => {
  const reduce = useReducedMotion();

  return (
    <section className="team-section" id={id}>
      {(code || title) && (
        <Reveal cut className="team-section-head">
          {code && <span className="section-code">{code}</span>}
          {title && <h2 className="section-title">{title}</h2>}
        </Reveal>
      )}

      <div className="team-grid">
        {items.map((item, index) => (
          /* stagger wrapper — the inline transform framer leaves behind
             must NOT land on .team-card, or it would override the CSS
             hover lift. Cards animate in per grid row (index % 4). */
          <motion.div
            className="team-card-wrap"
            key={item.id ?? item.name}
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.55,
              delay: (index % 4) * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className={`team-card ${featured ? "featured-card" : ""}`}>
              {/* hover gloss sweep — both card pseudos are taken by the corner brackets */}
              <span className="card-sheen" aria-hidden="true" />

              <div className="image-wrapper">
                <img
                  /* data.json paths are relative ("team/x.jpg") — resolve from the
                     site root so they survive routes like /Team/ (trailing slash) */
                  src={`/${item.image}`}
                  alt={item.name}
                  className="team-image"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // avoid a retry loop if the fallback 404s
                    e.currentTarget.src = "/fallback-avatar.svg";
                  }}
                />
              </div>

              <div className="team-content">
                <h4 className="member-name">{item.name}</h4>

                {(item.facebook || item.email) && (
                  <div className="social-links">
                    {item.facebook &&
                      item.facebook.trim() !== "#" &&
                      item.facebook.trim() !== "" && (
                        <a
                          href={item.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${item.name} Instagram profile`}
                        >
                          <i className="fa fa-instagram"></i>
                        </a>
                      )}

                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        aria-label={`Email ${item.name}`}
                      >
                        <i className="fa fa-envelope"></i>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

function Team() {
  return (
    <div className="team-page">
      {/* same neon dot + lagging ring cursor used on the other pages */}
      <Cursor />
      {/* same drifting lime/cyan node constellation used on the homepage */}
      <CircuitBG />

      <ScrollHUD
        sections={[
          { id: "team-hero", code: "00", label: "ROSTER" },
          { id: "sec-core", code: "01", label: "CORE" },
          { id: "sec-legacy", code: "02", label: "LEGACY" },
          { id: "sec-ops", code: "03", label: "OPS" },
        ]}
      />

      <div className="team-page-inner">
        <div className="team-hero" id="team-hero">
          <Reveal delay={0} y={14}>
            <span className="team-kicker">
              ROSTER // the people behind the club
            </span>
          </Reveal>

          <Reveal delay={0.12} y={22}>
            <h1>
              MEET OUR <span className="team-hl">TEAM</span>
            </h1>
          </Reveal>

          <Reveal delay={0.25} y={16}>
            <p>
              You can access information about the current members of the
              Electronics Club team below. Contact details are provided so you
              can easily reach the appropriate team member for guidance,
              projects, events, or club-related queries.
            </p>
          </Reveal>
        </div>

        <Card
          id="sec-core"
          code="01_CORE"
          title="Coordinators"
          items={data.coordi}
          featured={true}
        />

        <Card
          id="sec-legacy"
          code="02_LEGACY"
          title="Coordinators 25-26"
          items={data.pastcoordi}
        />

        <Card
          id="sec-ops"
          code="03_OPS"
          title="Secretaries"
          items={data.manager}
        />
      </div>
    </div>
  );
}

export default Team;
export { Card };
