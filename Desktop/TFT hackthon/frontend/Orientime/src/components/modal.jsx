import { useState } from "react";
import "../styles/modal.css";

function Modal({ mode = "alarm", onClose, onSubmit }) {
    const getDefaultValue = () => {
        if (mode === "alarm") {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            return `${hours}:${minutes}`;
        } else {
            return 5; // default 5 minutes for timer
        }
    };

    const [value, setValue] = useState(getDefaultValue());

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!value) return;

        if (mode === "alarm") {
            onSubmit(value); // string HH:MM
        } else {
            onSubmit(value * 60); // convert minutes → seconds
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                    {mode === "alarm" ? "Set New Alarm" : "Set Timer (minutes)"}
                </h2>
                <form onSubmit={handleSubmit}>
                    {mode === "alarm" ? (
                        <input
                            className="modal-time-input"
                            type="time"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            required
                        />
                    ) : (
                        <input
                            className="modal-time-input"
                            type="number"
                            min="1"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            required
                        />
                    )}
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Modal;
