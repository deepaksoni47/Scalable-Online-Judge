import { Link } from "react-router-dom";
import DifficultyBadge from "./DifficultyBadge.jsx";
import TagList from "./TagList.jsx";

const ProblemCard = ({ problem }) => {
  return (
    <article className="problem-card">
      <div className="problem-card-header">
        <div>
          <h2>{problem.title}</h2>
          <TagList tags={problem.tags} />
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <Link className="primary-button solve-button" to={`/problems/${problem._id}`}>
        Solve
      </Link>
    </article>
  );
};

export default ProblemCard;
