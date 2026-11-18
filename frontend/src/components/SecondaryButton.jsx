import { Link } from "react-router-dom";

function SecondaryButton({ to, children, arrow = "right" }) {
  return (
    <Link className="secondary-button" to={to}>
      <span>{children}</span>
      <span aria-hidden="true">{arrow === "left" ? "←" : "→"}</span>
    </Link>
  );
}

export default SecondaryButton;
