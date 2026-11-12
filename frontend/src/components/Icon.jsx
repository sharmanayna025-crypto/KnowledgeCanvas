const PATHS = {
  home: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z",
  note: "M5 3h10l4 4v14H5z M15 3v4h4 M8 12h8 M8 16h6",
  docs: "M4 5a2 2 0 012-2h5v18H6a2 2 0 01-2-2z M13 3h5a2 2 0 012 2v14a2 2 0 01-2 2h-5z",
  file: "M6 3h8l4 4v14H6z M14 3v4h4",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14z M21 21l-4.3-4.3",
  plus: "M12 5v14 M5 12h14",
  upload: "M12 16V4 M7 9l5-5 5 5 M4 20h16",
  pin: "M12 17v5 M8 3h8l-1 6 3 4H6l3-4z",
  edit: "M4 20h4L19 9l-4-4L4 16z M13 7l4 4",
  trash: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6 M14 11v6",
  sun: "M12 8a4 4 0 100 8 4 4 0 000-8z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5",
  moon: "M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z",
  logout: "M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4 M16 8l4 4-4 4 M20 12H9",
  copy: "M9 9h10v11H9z M5 15V4h10",
  download: "M12 4v12 M7 11l5 5 5-5 M4 20h16",
  check: "M5 12l5 5 9-10",
  x: "M6 6l12 12 M18 6L6 18",
  refresh: "M20 11a8 8 0 10-2.3 6 M20 4v7h-7",
  sparkle:
    "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  chat: "M4 5h16v11H9l-5 4z",
  quiz: "M12 3a9 9 0 100 18 9 9 0 000-18z M9.5 9.5a2.5 2.5 0 114 2c-.8.6-1.5 1-1.5 2 M12 17h.01",
  list: "M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  back: "M19 12H5 M11 6l-6 6 6 6",
  send: "M4 12l16-8-6 16-3-7z",
  external: "M14 4h6v6 M20 4l-9 9 M18 14v5H5V6h5",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 100 6 3 3 0 000-6z",
  bold: "M7 5h6a3.5 3.5 0 010 7H7z M7 12h7a3.5 3.5 0 010 7H7z",
  italic: "M10 5h8 M6 19h8 M14 5l-4 14",
  heading: "M6 5v14 M18 5v14 M6 12h12",
  quote: "M5 8h5v6H7a2 2 0 01-2-2z M14 8h5v6h-3a2 2 0 01-2-2z",
  code: "M9 8l-5 4 5 4 M15 8l5 4-5 4",
  checklist: "M4 6l1.5 1.5L8 5 M4 13l1.5 1.5L8 12 M11 7h9 M11 14h9 M4 20h.01 M11 20h9",
};

export default function Icon({ name, size = 18, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]?.split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );
}
