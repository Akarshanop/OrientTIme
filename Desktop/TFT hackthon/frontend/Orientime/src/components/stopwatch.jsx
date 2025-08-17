import { useState, useRef } from "react";
import "../styles/stopwatch.css";

function StopWatch() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const timerRef = useRef(null);

    const formatTime = (ms) => {
        const minutes = String(Math.floor(ms / 60000)).padStart(2, "0");
        const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
        const milliseconds = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
        return `${minutes}:${seconds}:${milliseconds}`;
    };

    const startStopwatch = () => {
        if (!isRunning) {
            setIsRunning(true);
            timerRef.current = setInterval(() => {
                setTime((prev) => prev + 10);
            }, 10);
        }
    };

    const stopStopwatch = () => {
        clearInterval(timerRef.current);
        setIsRunning(false);
    };

    const resetStopwatch = () => {
        clearInterval(timerRef.current);
        setIsRunning(false);
        setTime(0);
        setLaps([]);
    };

    const recordLap = () => {
        if (isRunning) {
            setLaps((prev) => [...prev, formatTime(time)]);
        }
    };

    return (
        <div className="stopwatch-container">
            <div className="stopwatch-display">{formatTime(time)}</div>

            <div className="button-group">
                {!isRunning ? (
                    <button className="button start" onClick={startStopwatch}>Start</button>
                ) : (
                    <button className="button stop" onClick={stopStopwatch}>Stop</button>
                )}
                <button className="button reset" onClick={resetStopwatch}>Reset</button>
                <button className="button lap" onClick={recordLap} disabled={!isRunning}>Lap</button>
            </div>

            {laps.length > 0 && (
                <div className="laps">
                    <h3>Laps</h3>
                    <ul>
                        {laps.map((lap, index) => (
                            <li key={index}>
                                <span>Lap {index + 1}</span>
                                <span>{lap}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default StopWatch;
