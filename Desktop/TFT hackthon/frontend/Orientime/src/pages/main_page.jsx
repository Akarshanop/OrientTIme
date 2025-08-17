import { useState, useEffect } from 'react';
import AlarmClock from "../components/alarm";
import StopWatch from "../components/stopwatch";
import Timer from "../components/timer";
import Weather from "../components/weather";
import "../styles/mainPage.css";
function Page() {
  const [orientation, setOrientation] = useState(screen.orientation.type);
  console.log(orientation)
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(screen.orientation.type);
    };
    screen.orientation.addEventListener('change', handleOrientationChange);
    return () => {
      screen.orientation.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  return (
    <div className="page-container">
      <div className={`view-wrapper ${orientation === 'portrait-primary' ? 'active' : ''}`}>
        <AlarmClock />
      </div>
      <div className={`view-wrapper ${orientation === 'landscape-primary' ? 'active' : ''}`}>
        <StopWatch />
      </div>
      <div className={`view-wrapper ${orientation === 'portrait-secondary' ? 'active' : ''}`}>
        <Weather/>
      </div>
      <div className={`view-wrapper ${orientation === 'landscape-secondary' ? 'active' : ''}`}>
        <Timer />
      </div>
    </div>
  );
}

export default Page;