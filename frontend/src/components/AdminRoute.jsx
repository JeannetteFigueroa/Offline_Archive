import { Navigate } from "react-router-dom";
import { getStoredSession } from "../utils/auth";

function AdminRoute({ children }) {
  const session = getStoredSession();
  if (!session || session.role !== "admin") {
    return <Navigate to="/login" replace state={{ from: "/admin" }} />;
  }
  return children;
}

export default AdminRoute;
