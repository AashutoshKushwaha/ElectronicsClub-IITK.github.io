import React, { useEffect, useState } from 'react';
import ScrollHUD from './cyber/ScrollHUD';
import Reveal from './cyber/Reveal';
import Cursor from './cyber/Cursor';
import './Leaderboard.css';

const Leaderboard = () => {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: Converts Google Drive share links to a high-quality thumbnail link
  const getDirectImageSrc = (url) => {
    if (!url) return null;

    // Check if it's a google drive link
    if (url.includes('drive.google.com')) {
      // Extract the ID
      const idMatch = url.match(/\/d\/(.*?)\/|id=(.*?)(&|$)/);
      const id = idMatch ? (idMatch[1] || idMatch[2]) : null;
      if (id) {
        // Use the 'thumbnail' endpoint with size w1000 (width 1000px) —
        // much more reliable for embedding than export=view
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
      }
    }
    // If it's a direct link (like imgur), just return it as is
    return url;
  };

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRlYfXayJkfwtIWcG5-w8_UEt66uGRqDLOf4SFBbtzuO_5zO9a7Uwv8a4-An3f9thC-5NtdCqAkiNzR/pub?output=csv&gid=918222027')
      .then(res => res.text())
      .then(csv => {
        const [headerLine, ...lines] = csv.trim().split('\n');
        const headers = headerLine.split(',').map(h => h.trim());

        const rawEntries = lines.map(line => {
          const cols = line.split(',');
          return headers.reduce((obj, key, i) => {
            obj[key] = cols[i] ? cols[i].trim() : '';
            return obj;
          }, {});
        });

        const groups = {};

        rawEntries.forEach(entry => {
          const challengeName = entry[headers[0]];
          const month = entry[headers[1]];
          const groupKey = `${month}::${challengeName}`;

          if (!groups[groupKey]) {
            groups[groupKey] = {
              month: month,
              challengeName: challengeName,
              imageUrl: null, // Initialize image container
              entries: []
            };
          }

          // Create a copy of the row data
          const entryData = { ...entry };

          // 1. Look for the ImageURL column (strictly named "ImageURL")
          if (entryData['ImageURL']) {
            // If this group doesn't have an image yet, set it
            if (!groups[groupKey].imageUrl) {
              groups[groupKey].imageUrl = getDirectImageSrc(entryData['ImageURL']);
            }
          }

          // 2. Cleanup: Delete columns we don't want in the table
          delete entryData[headers[0]]; // Remove Challenge Name column
          delete entryData[headers[1]]; // Remove Month column
          delete entryData['ImageURL']; // Remove ImageURL column (so it doesn't show in table)

          groups[groupKey].entries.push(entryData);
        });

        const sortedGroups = Object.values(groups).sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateB - dateA;
        });

        setGroupedData(sortedGroups);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching CSV:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="lb-root">
      {/* same neon dot + lagging ring cursor used on the other pages */}
      <Cursor />

      <ScrollHUD
        sections={[
          { id: "lb-hero", code: "00", label: "SCOREBOARD" },
          { id: "lb-body", code: "01", label: "STANDINGS" },
        ]}
      />

      <section className="lb-hero" id="lb-hero">
        {/* moving square grid — same rhythm as the Articles/Components heroes */}
        <div className="lb-grid-overlay" aria-hidden="true" />
        <div className="lb-vignette" aria-hidden="true" />

        {/* ghost podium rising behind the title — 2 · 1 · 3 */}
        <div className="lb-podium" aria-hidden="true">
          <div className="lb-podium-bar lb-podium-2"><span>2</span></div>
          <div className="lb-podium-bar lb-podium-1"><span>1</span></div>
          <div className="lb-podium-bar lb-podium-3"><span>3</span></div>
        </div>

        <span className="lb-hud lb-hud-tl">SYS // SCOREBOARD_ONLINE</span>
        <span className="lb-hud lb-hud-tr">RANKINGS · LIVE_FEED</span>

        <div className="lb-hero-content">
          <Reveal delay={0} y={16}>
            <p className="lb-eyebrow">&gt; FETCHING_RANKINGS</p>
          </Reveal>

          {/* scan-wipe reveal — a lime score-bar sweeps the title in */}
          <h1 className="lb-title">LEADERBOARD</h1>

          <Reveal delay={0.25} y={16}>
            <p className="lb-tagline">
              <span>COMPETE</span>
              <span className="lb-dot">·</span>
              <span>SCORE</span>
              <span className="lb-dot">·</span>
              <span>CLIMB</span>
            </p>
          </Reveal>

          <Reveal delay={0.4} y={16}>
            <p className="lb-sub">
              Monthly challenge standings, straight from the scorekeepers.
              Top the board and claim the bragging rights.
            </p>
          </Reveal>

        </div>

        <div className="lb-scroll-cue" aria-hidden="true">
          <span>SCROLL</span>
          <div className="lb-scroll-track">
            <div className="lb-scroll-dot" />
          </div>
        </div>
      </section>

      <div className="lb-body" id="lb-body">
        {loading && (
          <p className="lb-status">
            &gt; SYNCING_SCOREBOARD <span className="lb-blink">▮</span>
          </p>
        )}

        {!loading && groupedData.map((group, index) => (
          <Reveal key={`${group.month}::${group.challengeName}`} y={34}>
            <div className="lb-section">
              <div className="lb-section-head">
                <span className="lb-month">{`// ${group.month}`}</span>
                <h2 className="lb-challenge">{group.challengeName}</h2>
              </div>

              <div className="lb-table-wrap">
                <table className="lb-table">
                  <thead>
                    <tr>
                      {/* Dynamically render headers based on remaining keys */}
                      {group.entries.length > 0 && Object.keys(group.entries[0]).map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      /* podium accents key off the sheet's Rank column when
                         present (rows aren't guaranteed rank-ordered);
                         fall back to row order otherwise */
                      const rankKey =
                        group.entries.length > 0
                          ? Object.keys(group.entries[0]).find(k => /rank/i.test(k))
                          : null;
                      return group.entries.map((row, i) => {
                        const rank = rankKey ? parseInt(row[rankKey], 10) : i + 1;
                        return (
                          <tr
                            key={i}
                            className={rank >= 1 && rank <= 3 ? `lb-rank lb-rank-${rank}` : undefined}
                          >
                            {Object.entries(row).map(([k, val], j) => (
                              <td
                                key={j}
                                className={rankKey && k === rankKey ? "lb-rank-cell" : undefined}
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Check if this group has an image URL and render it */}
              {group.imageUrl && (
                <figure className="lb-highlight">
                  <span className="lb-highlight-tag">{'// HIGHLIGHT'}</span>
                  <img
                    src={group.imageUrl}
                    alt={`${group.month} Challenge Highlight`}
                    className="lb-highlight-img"
                    loading="lazy"
                  />
                </figure>
              )}
            </div>
          </Reveal>
        ))}

        {!loading && groupedData.length === 0 && (
          <p className="lb-status">&gt; NO_RECORDS_FOUND</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
