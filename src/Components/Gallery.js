import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ScrollHUD from './cyber/ScrollHUD';
import Reveal from './cyber/Reveal';
import Cursor from './cyber/Cursor';
import './Gallery.css';

// ==========================================
// YOUR KEYS
// ==========================================
const API_KEY = 'AIzaSyAGU_45FCNsh5M6tuc9mnUqQ8Uhf5Cdjgk';
const FOLDER_ID = '1SDMIBSuweTO3zHHKqZXy7nMpEMPhVOK9';
// ==========================================

/* camera-style running timecode for the REC indicator */
const RecTimecode = () => {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) setT((v) => v + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [reduce]);

  const pad = (n) => String(n).padStart(2, '0');
  return (
    <>{`${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`}</>
  );
};

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reduce = useReducedMotion();

  // Helper: Fisher-Yates Shuffle
  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  useEffect(() => {
    const fetchMediaFromDrive = async () => {
      try {
        // Query asks for images OR videos
        const query = `'${FOLDER_ID}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`;

        // We request 'videoMediaMetadata' too
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,imageMediaMetadata,videoMediaMetadata)&key=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        const processedItems = data.files.map(file => {
          const isVideo = file.mimeType.startsWith('video');

          // Get metadata from the correct property
          const metadata = isVideo ? file.videoMediaMetadata : file.imageMediaMetadata;

          // Fallback if metadata is missing (sometimes happens with new files)
          const width = metadata ? metadata.width : 1;
          const height = metadata ? metadata.height : 1;
          const aspectRatio = width / height;

          // INTELLIGENT SIZING LOGIC
          let sizeClass = 'item-small';

          if (aspectRatio < 0.75) {
            sizeClass = 'item-tall'; // Portrait
          } else if (aspectRatio > 1.3) {
            sizeClass = 'item-wide'; // Landscape
          } else if (width > 1200 && height > 1200) {
            sizeClass = 'item-big';  // High-res Square
          }

          return {
            id: file.id,
            // Drive generates thumbnails for videos too!
            src: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
            alt: file.name,
            sizeClass: sizeClass,
            isVideo: isVideo,
            // Link to open video in new tab (since autoplaying grid videos is heavy)
            videoLink: isVideo ? `https://drive.google.com/file/d/${file.id}/view` : null
          };
        });

        const randomizedItems = shuffleArray(processedItems);
        setItems(randomizedItems);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching media:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMediaFromDrive();
  }, []);

  return (
    <div className="gal-root">
      {/* same neon dot + lagging ring cursor used on the other pages */}
      <Cursor />

      <ScrollHUD
        sections={[
          { id: "gal-hero", code: "00", label: "VIEWFINDER" },
          { id: "gal-body", code: "01", label: "ARCHIVE" },
        ]}
      />

      <section className="gal-hero" id="gal-hero">
        {/* moving square grid — same rhythm as the Articles/Components heroes */}
        <div className="gal-grid-overlay" aria-hidden="true" />
        <div className="gal-scanlines" aria-hidden="true" />
        <div className="gal-vignette" aria-hidden="true" />
        {/* one-shot camera flash on load */}
        <div className="gal-flash" aria-hidden="true" />

        <span className="gal-hud gal-hud-rec">
          <i className="gal-rec-dot" aria-hidden="true" /> REC <RecTimecode />
        </span>
        <span className="gal-hud gal-hud-tr">VISUAL_LOG · ARCHIVE</span>

        <div className="gal-hero-content">
          <Reveal delay={0} y={16}>
            <p className="gal-eyebrow">&gt; DECODING_VISUAL_ARCHIVE</p>
          </Reveal>

          {/* viewfinder: focus brackets lock onto the title as it
             pulls focus (blur → sharp) */}
          <div className="gal-viewfinder">
            <span className="gal-vf gal-vf-tl" aria-hidden="true" />
            <span className="gal-vf gal-vf-tr" aria-hidden="true" />
            <span className="gal-vf gal-vf-bl" aria-hidden="true" />
            <span className="gal-vf gal-vf-br" aria-hidden="true" />
            {/* rule-of-thirds grid + roaming AF point, like a live camera */}
            <span className="gal-vf-grid" aria-hidden="true" />
            <span className="gal-af" aria-hidden="true" />
            <h1 className="gal-title">GALLERY</h1>
          </div>

          <Reveal delay={0.25} y={16}>
            <p className="gal-tagline">
              <span>MOMENTS</span>
              <span className="gal-dot">·</span>
              <span>BUILDS</span>
              <span className="gal-dot">·</span>
              <span>PEOPLE</span>
            </p>
          </Reveal>

          <Reveal delay={0.35} y={12}>
            <p className="gal-exif">ISO 800 · ƒ/1.8 · 1/250 · AF-LOCK</p>
          </Reveal>

          <Reveal delay={0.45} y={16}>
            <p className="gal-sub">
              Snapshots from workshops, competitions, and everything the club
              gets its hands on. Click a video tile to play it.
            </p>
          </Reveal>
        </div>

        <div className="gal-scroll-cue" aria-hidden="true">
          <span>SCROLL</span>
          <div className="gal-scroll-track">
            <div className="gal-scroll-dot" />
          </div>
        </div>
      </section>

      <div className="gal-body" id="gal-body">
        {loading && (
          <p className="gal-status">
            &gt; LOADING_MEMORY_BANKS <span className="gal-blink">▮</span>
          </p>
        )}

        {error && (
          <p className="gal-status gal-error">&gt; TRANSMISSION_FAILED :: {error}</p>
        )}

        {!loading && !error && (
          <div className="gallery-grid">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className={`gallery-item ${item.sizeClass}`}
                initial={reduce ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.55,
                  delay: (index % 5) * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                // If it's a video, clicking opens it. If image, it does nothing
                onClick={() => item.isVideo && window.open(item.videoLink, '_blank')}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="gallery-img"
                  loading="lazy"
                />

                {/* hover scan overlay + corner reticles */}
                <div className="gallery-overlay" aria-hidden="true">
                  {item.isVideo && <span className="play-chip">▶ PLAY</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
