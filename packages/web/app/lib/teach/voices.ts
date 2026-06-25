// Inworld TTS 2 voices offered in the UI (Teach page + editor re-voice).
// Values are Inworld voice ids passed straight to the model.
export const LESSON_VOICES = [
  { value: "Olivia", label: "Olivia (f)" },
  { value: "Sarah", label: "Sarah (f)" },
  { value: "Ashley", label: "Ashley (f)" },
  { value: "Priya", label: "Priya (f)" },
  { value: "Elizabeth", label: "Elizabeth (f)" },
  { value: "Dennis", label: "Dennis (m)" },
  { value: "Mark", label: "Mark (m)" },
  { value: "Ethan", label: "Ethan (m)" },
  { value: "Theodore", label: "Theodore (m)" },
  { value: "Brian", label: "Brian (m)" },
] as const;

export const DEFAULT_VOICE = "Olivia";
