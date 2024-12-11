import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [s3Link, setS3Link] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setS3Link("");
    setError("");
    setLoading(true);

    if (!youtubeUrl) {
      setError("Please provide a YouTube URL.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://3.126.59.193:5000/download-audio", {
        params: { url: youtubeUrl },
      });

      if (response.data.s3_link) {
        setS3Link(response.data.s3_link);
      } else {
        setError("Failed to retrieve the S3 link.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while processing the request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", textAlign: "center", marginBottom: "20px" }}>
        Download YouTube Audio
      </h1>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        style={{
          padding: "10px",
          width: "90%",
          maxWidth: "400px",
          fontSize: "16px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: loading ? "#aaa" : "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "20px",
        }}
      >
        {loading ? "Downloading..." : "Download"}
      </button>
      {s3Link && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <a
            href={s3Link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: "bold",
              color: "white",
              backgroundColor: "#28a745",
              padding: "15px",
              borderRadius: "8px",
              margin: "10px 0",
            }}
          >
            Download Your Audio File
          </a>
        </div>
      )}
      {error && (
        <div style={{ marginTop: "20px", color: "red", textAlign: "center" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default App;
