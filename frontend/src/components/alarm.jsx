import { useState, useEffect } from "react";
import Modal from "../components/modal.jsx";
import TimesUp from "../components/timeUp.jsx";
import "../styles/alarm.css";
import { initVoiceRecognition } from "../utils/voice.js";

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return currentTime;
};

function AlarmClock() {
  const [alarms, setAlarms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(false);
  const currentTime = useCurrentTime();

  const nowHHMM = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("alarms")) || [];
    setAlarms(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("alarms", JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    const alarmToTrigger = alarms.find((a) => a.enabled && a.time === nowHHMM);
    if (alarmToTrigger && !activeAlarm) setActiveAlarm(true);
  }, [nowHHMM, alarms, activeAlarm]);

  const addAlarm = (time) => {
    const newAlarm = { id: Date.now(), time, enabled: true };
    setAlarms((prev) => [newAlarm, ...prev]);
    setShowModal(false);
  };

  const deleteAlarm = (id) => setAlarms(alarms.filter((a) => a.id !== id));
  const toggleAlarm = (id) =>
    setAlarms(alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));

  const stopAlarm = () => {
    setActiveAlarm(false);
    setAlarms(alarms.map((a) => (a.time === nowHHMM ? { ...a, enabled: false } : a)));
  };

  const handleVoiceCommand = (command) => {
    if (command.includes("set alarm for")) {
      // matches "6:30", "06:30", "6", "6 pm", "6 30" etc.
      const match = command.match(/(\d{1,2})(?::| )?(\d{2})?/);
      if (match) {
        let hours = parseInt(match[1], 10);
        let minutes = match[2] ? match[2] : "00";

        if (command.includes("pm") && hours < 12) hours += 12;
        if (command.includes("am") && hours === 12) hours = 0;

        const formatted = `${String(hours).padStart(2, "0")}:${minutes}`;
        console.log("✅ Voice alarm:", formatted);
        addAlarm(formatted);
      } else {
        console.log("Could not detect time in command:", command);
      }
    } else {
      console.log("Command not recognized:", command);
    }
  };

  const useVoice = () => {
    const recognition = initVoiceRecognition(handleVoiceCommand);
    if (recognition) recognition.start();
  };

  return (
    <div className="alarm-container" aria-label="Alarm screen">
      <div className="digital-clock" aria-live="polite">
        {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>

      <div className="alarm-list" role="list">
        {alarms.length ? (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`alarm-item ${!alarm.enabled ? "disabled" : ""}`}
              role="listitem"
            >
              <span className="alarm-time" aria-label={`Alarm at ${alarm.time}`}>
                {alarm.time}
              </span>
              <div className="alarm-controls">
                <label className="toggle-switch" aria-label="Enable or disable alarm">
                  <input
                    type="checkbox"
                    checked={alarm.enabled}
                    onChange={() => toggleAlarm(alarm.id)}
                  />
                  <span className="slider"></span>
                </label>
                <button
                  className="delete-btn"
                  onClick={() => deleteAlarm(alarm.id)}
                  aria-label="Delete alarm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-alarms">No alarms set</p>
        )}
      </div>

      <div className="button-class">
        <button
          className="add-btn"
          onClick={() => setShowModal(true)}
          aria-label="Add new alarm"
          title="Add alarm"
        >
          +
        </button>

        <button
          className="voice-btn"         
          onClick={useVoice}
          aria-label="Voice command"
          title="Voice command"
        >
          🎙️
        </button>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} onSubmit={addAlarm} />}

      <TimesUp show={activeAlarm} onClose={stopAlarm} />
    </div>
  );
}

export default AlarmClock;
