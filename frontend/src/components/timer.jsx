import { useState, useRef, useEffect } from "react";
import "../styles/timer.css";
import Modal from "../components/modal";
import TimesUp from "../components/timeUp";

const CircularProgress = ({ progress }) => {
  const radius = 140;
  const stroke = 12;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="progress-ring" aria-hidden="true">
      <circle
        className="progress-ring__background"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className="progress-ring__circle"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};

function Timer() {
  const [initialTime, setInitialTime] = useState(5 * 60);
  const [time, setTime] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [active, setActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef(null);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  function startTimer() {
    if (!isRunning && time > 0) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev > 1) return prev - 1;
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setActive(true);
          return 0;
        });
      }, 1000);
    }
  }

  function stopTimer() {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  }

  function resetTimer() {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(initialTime);
    setActive(false);
  }

  function handleSetTimer(newSeconds) {
    clearInterval(intervalRef.current);
    setInitialTime(newSeconds);
    setTime(newSeconds);
    setIsRunning(false);
    setActive(false);
    setShowModal(false);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const progress = initialTime > 0 ? (time / initialTime) * 100 : 0;

  return (
    <div className="timer-container" aria-label="Timer screen">
      <div className="timer-circle-container">
        <CircularProgress progress={progress} />
        <button
          className="time-display"
          onClick={() => setShowModal(true)}
          aria-label="Set timer duration"
          title="Tap to set timer"
        >
          {formatTime(time)}
        </button>
      </div>

      <div className="timer-controls">
        <button onClick={resetTimer} className="timer-button secondary" aria-label="Reset timer">Reset</button>
        {!isRunning ? (
          <button onClick={startTimer} className="timer-button main-action start" aria-label="Start timer">
            {time === initialTime ? "Start" : "Resume"}
          </button>
        ) : (
          <button onClick={stopTimer} className="timer-button main-action stop" aria-label="Pause timer">
            Pause
          </button>
        )}
      </div>

      {showModal && (
        <Modal mode="timer" onClose={() => setShowModal(false)} onSubmit={handleSetTimer} />
      )}

      <TimesUp show={active} onClose={resetTimer} />
    </div>
  );
}

export default Timer;
