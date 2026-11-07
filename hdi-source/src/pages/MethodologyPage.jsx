import { Navigate } from "react-router-dom";

/** Legacy route — content lives on About & Sources. */
export default function MethodologyPage() {
  return <Navigate to="/about#sources" replace />;
}
