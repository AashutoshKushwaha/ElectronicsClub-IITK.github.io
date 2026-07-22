import React, { useState } from 'react';
import './comp.css';
import CircuitBG from './cyber/CircuitBG';
import ScrollHUD from './cyber/ScrollHUD';
import PartsBG from './cyber/PartsBG';
import Reveal from './cyber/Reveal';
import Cursor from './cyber/Cursor';

/* ==================================================================
   GOOGLE FORM BRIDGE — "Component Issue form 2024-25"
   Native HTML/React form, no iframe -- single page scrollbar only.
   On submit it quietly posts into the real Google Form in the
   background so the existing spreadsheet keeps filling itself.

   STATUS OF THE IDS BELOW:
   - purpose and expectedDate are CONFIRMED correct (read directly out
     of the live form's DOM).
   - The other 6 are CANDIDATES pulled from the form's hidden-input
     block, but Google Forms renders that block in a shuffled order
     (see `data-shuffle-seed` on the <form> tag) that does NOT
     reliably match the visual question order. Do not trust these
     until verified.

   HOW TO VERIFY (2 minutes, foolproof):
   1. Open the live form in a normal tab.
   2. Fill it with obviously distinct test values, e.g.:
        Name -> "ZZTEST-NAME"
        Component issued by -> "ZZTEST-ISSUER"
        Email -> "zztest@x.com"
        Mobile -> "0000000001"
        Address -> "ZZTEST-ADDR"
        Details of component -> "ZZTEST-DETAILS"
   3. Submit it, then open the linked Google Sheet -- the column
      headers ARE the question titles, so you can instantly read off
      which value landed in which column.
   4. Open the form's page source again, Ctrl+F each test string is
      gone (it's cross-origin submitted) -- instead, match by ELIMINATION:
      whichever entry ID you have NOT yet confirmed, submit one more
      isolated test leaving every other field blank and see which sheet
      column changes.
   Once confirmed, just swap the six TODO ids below for the right ones.
   ================================================================== */
const FORM_ACTION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdiRJRtA_9I7mHRMAiQ-Dhm59oJHRlixD8nQHHTBXHA5Nb6pQ/formResponse';

const ENTRY_IDS = {
  name: 'entry.268476346',        // TODO: unverified candidate -- confirm via sheet test
  issuedBy: 'entry.28148681',     // TODO: unverified candidate -- confirm via sheet test
  email: 'entry.2144025755',      // TODO: unverified candidate -- confirm via sheet test
  mobile: 'entry.1117505140',     // TODO: unverified candidate -- confirm via sheet test
  address: 'entry.2025455077',    // TODO: unverified candidate -- confirm via sheet test
  details: 'entry.1065875760',    // TODO: unverified candidate -- confirm via sheet test
  remarks: 'entry.400965518',     // TODO: unverified candidate -- confirm via sheet test
  purpose: 'entry.894600812',     // CONFIRMED
  dateEntryBase: 'entry.877841720', // CONFIRMED -- split into _year/_month/_day on submit
};

const PURPOSE_OPTIONS = [
  'Self Project',
  'Borrowing it for an SnT Team',
  'Borrowing it for an SnT Club',
];

const TEXT_FIELDS = [
  { key: 'name', label: 'NAME_OF_INTENDER', placeholder: 'Full name', required: true },
  { key: 'issuedBy', label: 'ISSUED_BY', placeholder: 'Name & role of the person issuing it', required: true },
  { key: 'email', label: 'EMAIL', placeholder: 'you@iitk.ac.in', type: 'email', required: true },
  { key: 'mobile', label: 'MOBILE_NO', placeholder: '10-digit number', type: 'tel', required: true },
  { key: 'address', label: 'ADDRESS', placeholder: 'Hall of residence & room no.', required: true },
];

const Components = () => {
  const [values, setValues] = useState({
    name: '',
    issuedBy: '',
    email: '',
    mobile: '',
    address: '',
    details: '',
    purpose: '',
    expectedDate: '',
    remarks: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleChange = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');

    try {
      const body = new URLSearchParams();
      body.append(ENTRY_IDS.name, values.name);
      body.append(ENTRY_IDS.issuedBy, values.issuedBy);
      body.append(ENTRY_IDS.email, values.email);
      body.append(ENTRY_IDS.mobile, values.mobile);
      body.append(ENTRY_IDS.address, values.address);
      body.append(ENTRY_IDS.details, values.details);
      body.append(ENTRY_IDS.remarks, values.remarks);
      body.append(ENTRY_IDS.purpose, values.purpose);

      // Google's native date widget submits three separate fields.
      if (values.expectedDate) {
        const [yyyy, mm, dd] = values.expectedDate.split('-');
        body.append(`${ENTRY_IDS.dateEntryBase}_year`, yyyy);
        body.append(`${ENTRY_IDS.dateEntryBase}_month`, String(Number(mm)));
        body.append(`${ENTRY_IDS.dateEntryBase}_day`, String(Number(dd)));
      }

      // no-cors is required (Forms doesn't send CORS headers back), which
      // also means we can never read a real success/failure status --
      // that's a permanent limitation of this bridge, not a bug here.
      await fetch(FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      setStatus('sent');
      setValues({
        name: '', issuedBy: '', email: '', mobile: '', address: '',
        details: '', purpose: '', expectedDate: '', remarks: '',
      });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="cp-root">
      <Cursor />
      <CircuitBG />

      <ScrollHUD
        sections={[
          { id: "cp-hero", code: "00", label: "INVENTORY" },
          { id: "cp-body", code: "01", label: "STOCK" },
        ]}
      />

      <section className="cp-hero" id="cp-hero">
        <PartsBG />
        <div className="cp-grid-overlay" aria-hidden="true" />
        <div className="cp-scanlines" aria-hidden="true" />
        <div className="cp-vignette" aria-hidden="true" />

        <span className="cp-hud cp-hud-tl">SYS // REQUISITION_UPLINK</span>
        <span className="cp-hud cp-hud-tr">IIT KANPUR · SUPPLY DESK</span>

        <div className="cp-hero-content">
          <Reveal delay={0} y={16}>
            <p className="cp-eyebrow">&gt; OPENING_REQUEST_TERMINAL</p>
          </Reveal>

          <Reveal delay={0.1} y={24}>
            <h1 className="cp-title" data-text="COMPONENTS">
              COMPONENTS
            </h1>
          </Reveal>

          <Reveal delay={0.25} y={16}>
            <p className="cp-tagline">
              <span>RESISTORS</span>
              <span className="cp-dot">·</span>
              <span>ICs</span>
              <span className="cp-dot">·</span>
              <span>MODULES</span>
              <span className="cp-dot">·</span>
              <span>CABLES</span>
            </p>
          </Reveal>

          <Reveal delay={0.4} y={16}>
            <p className="cp-sub">
              Taking a part from the club? File the issue log below --
              it routes straight into the component register.
            </p>
          </Reveal>
        </div>

        <div className="cp-scroll-cue" aria-hidden="true">
          <span>SCROLL</span>
          <div className="cp-scroll-track">
            <div className="cp-scroll-dot" />
          </div>
        </div>
      </section>

      <div className="cp-body" id="cp-body">
        <Reveal y={30} className="cp-panel-wrap">
          <div className="cp-panel">
            <span className="cp-corner cp-corner-tl" />
            <span className="cp-corner cp-corner-br" />

            <div className="cp-panel-bar">
              <div className="cp-panel-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="cp-panel-bar-title">COMPONENT_ISSUE_FORM.exe</span>
              <span className="cp-panel-bar-status">
                {status === 'sending' && 'TRANSMITTING…'}
                {status === 'idle' && 'READY'}
                {status === 'sent' && 'LOGGED'}
                {status === 'error' && 'LINK_ERROR'}
              </span>
            </div>

            <div className="cp-panel-body">
              {status === 'sent' ? (
                <div className="cp-success">
                  <span className="cp-success-glyph">✓</span>
                  <p className="cp-success-title">ISSUE_LOGGED</p>
                  <p className="cp-success-sub">
                    Please return the component as soon as you're done with
                    it -- the club runs on everyone doing this.
                  </p>
                  <button
                    type="button"
                    className="cp-submit cp-submit-ghost"
                    onClick={() => setStatus('idle')}
                  >
                    &gt; LOG_ANOTHER_ITEM
                  </button>
                </div>
              ) : (
                <form className="cp-form" onSubmit={handleSubmit}>
                  <div className="cp-field-grid">
                    {TEXT_FIELDS.map((field) => (
                      <label key={field.key} className="cp-field">
                        <span className="cp-field-label">
                          <span className="cp-field-prompt">&gt;</span> {field.label}
                          {field.required && <span className="cp-field-req">*</span>}
                        </span>
                        <input
                          className="cp-input"
                          type={field.type || 'text'}
                          placeholder={field.placeholder}
                          value={values[field.key]}
                          onChange={handleChange(field.key)}
                          required={field.required}
                        />
                      </label>
                    ))}
                  </div>

                  <label className="cp-field cp-field-full">
                    <span className="cp-field-label">
                      <span className="cp-field-prompt">&gt;</span> DETAILS_OF_COMPONENT
                      <span className="cp-field-req">*</span>
                    </span>
                    <textarea
                      className="cp-input cp-textarea"
                      placeholder="Which component, model / value, how many..."
                      value={values.details}
                      onChange={handleChange('details')}
                      rows={3}
                      required
                    />
                  </label>

                  <fieldset className="cp-field cp-field-full cp-fieldset">
                    <legend className="cp-field-label">
                      <span className="cp-field-prompt">&gt;</span> PURPOSE
                      <span className="cp-field-req">*</span>
                    </legend>
                    <div className="cp-radio-group">
                      {PURPOSE_OPTIONS.map((opt) => (
                        <label key={opt} className="cp-radio">
                          <input
                            type="radio"
                            name="purpose"
                            value={opt}
                            checked={values.purpose === opt}
                            onChange={handleChange('purpose')}
                            required
                          />
                          <span className="cp-radio-dot" />
                          <span className="cp-radio-text">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="cp-field">
                    <span className="cp-field-label">
                      <span className="cp-field-prompt">&gt;</span> EXPECTED_RETURN_DATE
                    </span>
                    <input
                      className="cp-input"
                      type="date"
                      value={values.expectedDate}
                      onChange={handleChange('expectedDate')}
                    />
                  </label>

                  <label className="cp-field cp-field-full">
                    <span className="cp-field-label">
                      <span className="cp-field-prompt">&gt;</span> ADDITIONAL_REMARKS
                    </span>
                    <textarea
                      className="cp-input cp-textarea"
                      placeholder="Optional"
                      value={values.remarks}
                      onChange={handleChange('remarks')}
                      rows={2}
                    />
                  </label>

                  {status === 'error' && (
                    <p className="cp-error-note">
                      Transmission failed to send. Check your connection and try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    className="cp-submit"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'TRANSMITTING…' : '> LOG_ISSUE'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default Components;
