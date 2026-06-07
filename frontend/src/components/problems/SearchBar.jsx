const SearchBar = ({ value, onChange }) => {
  return (
    <label className="search-bar">
      <span>Search by title</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search problems..."
      />
    </label>
  );
};

export default SearchBar;
