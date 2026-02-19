import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SessionTimeout() {
  const navigate = useNavigate();

  useEffect(() => {
    const flagged = sessionStorage.getItem("session_timeout");
    if (!flagged) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="max-w-xl mx-auto p-10">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-3">Session Timed Out</h1>
        <p className="text-sm text-gray-700 mb-5">
          Your session has timed out due to inactivity. Please login again.
        </p>
        <div className="flex gap-3">
          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={() => {
              sessionStorage.removeItem("session_timeout");
              navigate("/login");
            }}
          >
            Click Here to Login
          </button>
          <button
            className="border px-4 py-2 rounded"
            onClick={() => {
              sessionStorage.removeItem("session_timeout");
              navigate("/");
            }}
          >
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}
