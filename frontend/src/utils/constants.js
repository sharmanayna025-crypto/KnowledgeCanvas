export const NOTE_COLORS = [
  { value: "#FFFFFF", label: "Plain" },
  { value: "#FFF3B0", label: "Yellow" },
  { value: "#FFD6D6", label: "Rose" },
  { value: "#CDEFD4", label: "Green" },
  { value: "#CFE5FF", label: "Blue" },
  { value: "#E6D9FA", label: "Lavender" },
  { value: "#FFE2C2", label: "Peach" },
  { value: "#DDD5CC", label: "Stone" },
];

export const DEFAULT_CATEGORIES = ["General", "Study", "Work", "Personal", "Ideas", "To-Do"];

export const isPlain = (color) => !color || color.toUpperCase() === "#FFFFFF";
