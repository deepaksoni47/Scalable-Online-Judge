const TagList = ({ tags = [], selectedTag = "", onTagClick }) => {
  if (!tags.length) {
    return <span className="muted-text">No tags</span>;
  }

  return (
    <div className="tag-list">
      {tags.map((tag) => {
        const isSelected = selectedTag === tag;
        const className = isSelected ? "tag-chip selected" : "tag-chip";

        if (onTagClick) {
          return (
            <button
              className={className}
              key={tag}
              type="button"
              onClick={() => onTagClick(isSelected ? "" : tag)}
            >
              {tag}
            </button>
          );
        }

        return (
          <span className={className} key={tag}>
            {tag}
          </span>
        );
      })}
    </div>
  );
};

export default TagList;
