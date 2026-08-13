import { memo } from 'react';
import Aurora from '../reactbits/Aurora';
import SplitText from '../reactbits/SplitText';
import BlurText from '../reactbits/BlurText';
import SpecularButton from '../reactbits/SpecularButton';
import BackgroundLayer from '../BackgroundLayer';
import './Hero.css';

function Hero({ auroraColors, onGetStarted, themeMode, textColor }) {
  return (
    <section id="hero" className="hero" style={{ '--hero-fg': textColor }}>
      <BackgroundLayer themeMode={themeMode} />

      {/* Desktop-only ambient tonal lighting — pure CSS, no gradient layers
          render at all below the tablet breakpoint, so mobile is
          byte-for-byte the same as before. See Hero.css for why this needs
          its own treatment rather than reusing BackgroundLayer's shapes. */}
      <div className="hero__ambient" aria-hidden="true" />

      <div className="hero__aurora" aria-hidden="true">
        <Aurora colorStops={auroraColors} amplitude={0.6} blend={0.35} speed={0.25} />
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="container hero__content">
        <span className="section-eyebrow md-label-large">Material Design 3 · Expressive</span>

        <SplitText
          text="Material You Studio"
          tag="h1"
          className="md-display-large hero__heading"
          splitType="chars"
          delay={22}
          duration={0.9}
          ease="power3.out"
          from={{ opacity: 0, y: 46 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="0px"
        />

        <BlurText
          text="Generate beautiful Material You color palettes from wallpapers."
          animateBy="words"
          direction="bottom"
          delay={70}
          className="md-body-large hero__subtitle"
        />

        <div className="hero__cta">
          <SpecularButton
            size="lg"
            radius={28}
            lineColor={textColor}
            baseColor="#8a8a8a"
            intensity={0.75}
            proximity={260}
            onClick={onGetStarted}
          >
            Get Started
          </SpecularButton>
        </div>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

// V2.1: Hero drives the WebGL Aurora background — skipping its re-render
// (and therefore Aurora's prop-update work) when unrelated App state
// changes is a real, measurable saving, not a cosmetic one.
export default memo(Hero);
