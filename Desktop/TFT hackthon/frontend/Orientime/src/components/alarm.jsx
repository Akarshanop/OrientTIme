import { useState, useEffect } from "react";
import Modal from "../components/modal.jsx";
import TimesUp from "../components/timeUp.jsx"; 
import "../styles/alarm.css";

const useCurrentTime = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return currentTime;
};

function AlarmClock() {
    const [alarms, setAlarms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [activeAlarm, setActiveAlarm] = useState(false);
    const currentTime = useCurrentTime();

    useEffect(() => {
        const formattedCurrentTime = currentTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
        });

        const alarmToTrigger = alarms.find(alarm => 
            alarm.time === formattedCurrentTime && alarm.enabled
        );

        if (alarmToTrigger && !activeAlarm) {
            console.log("ALARM TRIGGERED!", alarmToTrigger);
            setActiveAlarm(true);
        }

    }, [currentTime, alarms, activeAlarm]);

    useEffect(() => {
        const storedAlarms = JSON.parse(localStorage.getItem("alarms")) || [];
        setAlarms(storedAlarms);
    }, []);

    useEffect(() => {
        localStorage.setItem("alarms", JSON.stringify(alarms));
    }, [alarms]);

    const addAlarm = (time) => {
        const newAlarm = { id: Date.now(), time, enabled: true };
        setAlarms([...alarms, newAlarm]);
        setShowModal(false);
    };

    const deleteAlarm = (id) => {
        setAlarms(alarms.filter((alarm) => alarm.id !== id));
    };

    const toggleAlarm = (id) => {
        setAlarms(
            alarms.map((alarm) =>
                alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
            )
        );
    };
    
    const stopAlarm = () => {
        setActiveAlarm(false);
        const formattedCurrentTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        setAlarms(alarms.map(alarm => 
            alarm.time === formattedCurrentTime ? { ...alarm, enabled: false } : alarm
        ));
    };

    return (
        <div className="alarm-container">
            <div className="digital-clock">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>

            <div className="alarm-list">
                {alarms.length > 0 ? (
                    alarms.map((alarm) => (
                        <div key={alarm.id} className={`alarm-item ${!alarm.enabled ? 'disabled' : ''}`}>
                            <span className="alarm-time">{alarm.time}</span>
                            <div className="alarm-controls">
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={alarm.enabled} onChange={() => toggleAlarm(alarm.id)} />
                                    <span className="slider"></span>
                                </label>
                                <button className="delete-btn" onClick={() => deleteAlarm(alarm.id)}>🗑️</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-alarms">No alarms set</p>
                )}
            </div>

            <button className="add-btn" onClick={() => setShowModal(true)}>+</button>
            {showModal && (
                <Modal
                    onClose={() => setShowModal(false)}
                    onSubmit={addAlarm}
                />
            )}

            <TimesUp
                show={activeAlarm}
                onClose={stopAlarm}
            />
        </div>
    );
}

export default AlarmClock;