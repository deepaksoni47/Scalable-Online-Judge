const DifficultyBadge = ({ difficulty }) => {
  const normalizedDifficulty = difficulty || "Unknown";

  return (
    <span
      className={`difficulty-badge difficulty-${normalizedDifficulty.toLowerCase()}`}
    >
      {normalizedDifficulty}
    </span>
  );
};

export default DifficultyBadge;
