import { useEffect, useRef } from 'react';
import "../styles/timesUp.css"; 
import alarmSound from "../assets/bolt.mp3";

function TimesUp({ show, onClose }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (show && audioRef.current) {
      audioRef.current.play();
    } else if (!show && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
    }
  }, [show]);


  if (!show) {
    return null; 
  }

  const handleStop = () => {
    onClose();
  };

  return (
    <div className="timesup-overlay">
      <div className="timesup-content">
        <div className="shaking-clock">⏰</div>
        <h1 className="timesup-title">Time's Up!</h1>
        <button className="stop-button" onClick={handleStop}>
          Stop Alarm
        </button>
      </div>
      <audio ref={audioRef} src={alarmSound} loop />
    </div>
  );
}

export default TimesUp;