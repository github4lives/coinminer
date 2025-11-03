import React, { CSSProperties, useMemo, useState } from 'react';
import './App.css';

const frameLabels = ['01', '02', '03', '04', '05', '06'];

type FrameStyle = CSSProperties & {
  '--frame-index'?: number;
};

const App: React.FC = () => {
  const [loopPrompt, setLoopPrompt] = useState(
    'A curious fox hops across floating islands, each leap leaving a pastel ripple that loops back to the beginning.'
  );
  const [frameCount, setFrameCount] = useState(4);
  const [tone, setTone] = useState('Dreamy & playful');

  const frames = useMemo(() => frameLabels.slice(0, frameCount), [frameCount]);

  return (
    <div className="app">
      <div className="loop-card">
        <div className="loop-card__label">
          <span className="loop-card__dot" aria-hidden="true"></span>
          <span className="loop-card__label-text">PIXEL BLOCKS</span>
          <span className="loop-card__label-pill">Crafted with crisp pixels</span>
        </div>

        <div className="loop-card__content">
          <section className="loop-card__intro" aria-labelledby="loop-heading">
            <h1 id="loop-heading">Sketch tiny stories in motion</h1>
            <p>
              Describe a moment and the GPT-5 artist paints it as a looping 3D pixel animation.
              Keep details tight and cinematic &mdash; no gradients, just cozy shapes bathed in soft light.
            </p>

            <div className="loop-card__callouts" aria-label="creative guidance">
              <article className="callout">
                <h2>Loop focus</h2>
                <p>Suggest a motion that restarts gracefully. Think ripples, twirls, gentle pans, or looping creature antics.</p>
              </article>
              <article className="callout">
                <h2>Palette</h2>
                <p>Soft clays, warm ambers, and moonlit blues keep the vibe dreamy. Add one pop color for drama.</p>
              </article>
              <article className="callout">
                <h2>Details</h2>
                <p>3&ndash;6 panels only. Give one hero, one motion, and a mood. The model handles lighting and timing.</p>
              </article>
            </div>

            <button className="loop-card__action" type="button">Craft loop</button>
          </section>

          <section className="loop-card__composer" aria-label="Loop composer">
            <header className="composer-header">
              <h2>Describe the loop</h2>
              <span className="composer-subtitle">Your scene becomes a looping story in pixel-perfect motion.</span>
            </header>

            <label className="input-group">
              <span className="input-label">Narrative spark</span>
              <textarea
                value={loopPrompt}
                onChange={(event) => setLoopPrompt(event.target.value)}
                rows={5}
                spellCheck={false}
                aria-describedby="prompt-guidance"
              />
              <span id="prompt-guidance" className="input-helper">
                Include the setting, the main character, and what loops forever.
              </span>
            </label>

            <label className="input-group">
              <span className="input-label">Tone</span>
              <input
                type="text"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                placeholder="Dreamy & playful"
              />
            </label>

            <div className="slider-group">
              <div>
                <span className="input-label">Panels</span>
                <span className="slider-value">{frameCount} frame loop</span>
              </div>
              <input
                type="range"
                min={3}
                max={6}
                value={frameCount}
                onChange={(event) => setFrameCount(Number(event.target.value))}
                aria-valuemin={3}
                aria-valuemax={6}
                aria-valuenow={frameCount}
                aria-label="Select how many panels"
              />
              <div className="slider-scale" aria-hidden="true">
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>

            <div className="preview" aria-live="polite">
              <div className="preview__canvas" role="img" aria-label={`Preview of ${frameCount} frame loop`}>
                {frames.map((frame, index) => {
                  const frameStyle: FrameStyle = { '--frame-index': index };
                  return (
                    <div key={frame} className="preview__frame" style={frameStyle}>
                      <span className="preview__frame-id">{frame}</span>
                    </div>
                  );
                })}
              </div>
              <div className="preview__caption">
                <h3>Staging notes</h3>
                <p>
                  {tone} &middot; {frameCount} panels &middot;{' '}
                  {loopPrompt.length > 90 ? `${loopPrompt.slice(0, 90)}…` : loopPrompt}
                </p>
              </div>
            </div>

            <footer className="composer-footer">
              <div className="status">
                <span className="status-indicator" aria-hidden="true"></span>
                Crafting in progress&mdash;your animation will appear the moment it completes.
              </div>
              <div className="progress-bar" aria-hidden="true">
                <span className="progress-bar__fill" style={{ width: `${40 + frameCount * 8}%` }}></span>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;
