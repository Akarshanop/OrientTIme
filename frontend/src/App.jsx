import { useEffect, useMemo, useState } from 'react';
import AlarmClock from "./components/alarm";
import StopWatch from "./components/stopwatch";
import Timer from "./components/timer";
import Weather from "./components/weather";
import "./App.css";

function getOrientationFallback() {
  if (typeof window === 'undefined') return 'portrait-primary';
  const isLandscape = window.innerWidth > window.innerHeight;
  return isLandscape ? 'landscape-primary' : 'portrait-primary';
}

function useOrientation() {
  const [orientation, setOrientation] = useState(() => {
    if (typeof window === 'undefined' || !window.screen || !window.screen.orientation) {
      return getOrientationFallback();
    }
    return window.screen.orientation.type || getOrientationFallback();
  });

  useEffect(() => {
    const update = () => {
      if (window.screen?.orientation?.type) {
        setOrientation(window.screen.orientation.type);
      } else {
        setOrientation(getOrientationFallback());
      }
    };

    // listen to both APIs for broader support
    window.addEventListener('resize', update);
    window.screen?.orientation?.addEventListener?.('change', update);

    return () => {
      window.removeEventListener('resize', update);
      window.screen?.orientation?.removeEventListener?.('change', update);
    };
  }, []);

  return orientation;
}

function App() {
  const orientation = useOrientation();

  const activeName = useMemo(() => {
    switch (orientation) {
      case 'portrait-primary': return 'Alarm';
      case 'landscape-primary': return 'Stopwatch';
      case 'portrait-secondary': return 'Weather';
      case 'landscape-secondary': return 'Timer';
      default: return 'Alarm';
    }
  }, [orientation]);
  return (
    <div className="page-container">
      <div className="bg-aurora" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <div className="active-pill" role="status" aria-live="polite">
        {activeName}
      </div>
      <div className={`view-wrapper ${orientation === 'portrait-primary' ? 'active' : ''}`}>
        <AlarmClock />
      </div>
      <div className={`view-wrapper ${orientation === 'landscape-primary' ? 'active' : ''}`}>
        <StopWatch />
      </div>
      <div className={`view-wrapper ${orientation === 'portrait-secondary' ? 'active' : ''}`}>
        <Weather />
      </div>
      <div className={`view-wrapper ${orientation === 'landscape-secondary' ? 'active' : ''}`}>
        <Timer />
      </div>
    </div>
  );
}

export default App;
