export function initVoiceRecognition(onCommand) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Your browser does not support Speech Recognition 😢");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("🎤 You said:", transcript);
    onCommand(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Voice recognition error:", event.error);
  };

  return recognition;
}
