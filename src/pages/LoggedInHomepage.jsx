import React, { useState, useEffect } from "react";
import "../css/LoggedInHomepage.css";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import PatchNotesModal from "../functions/patchNotesModal";

function LoggedInHomepage() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Góðan daginn" : hour < 18 ? "Góðan daginn" : "Gott kvöld";

  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch("/api/9to5mac")
      .then((res) => {
        console.log("status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("articles:", data);
        setArticles(data);
      })
      .catch((err) => console.error("fetch error:", err));
  }, []);

  return (
    <div>
      <PatchNotesModal />
      <div className="LoggedInHomepage-container">
        <div className="title-box">
          <h1 className="greeting">
            <span className="greeting-soft">{greeting}</span>
            <br />
            <span className="greeting-name">{user.firstName}</span>
          </h1>
        </div>
      </div>
      <div className="button-container">
        <div
          className="content-selection"
          onClick={() => navigate("/stada-sendinga")}
        >
          <h2>Staða sendinga</h2>
          <p>Skoðaðu stöðu á Apple sendingum</p>
        </div>

        <div className="content-selection" onClick={() => navigate("/cto")}>
          <h2>Sérpöntunarverðlisti</h2>
          <p>Sjáðu verð og útfærslur fyrir sérpantanir</p>
        </div>
      </div>
      <div className="news-section">
        <div className="news-layout">
          {articles.map((article, index) => (
            <a
              key={index}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`news-card ${index === 0 ? "featured" : "secondary"}`}
            >
              {article.image && (
                <div className="image-wrapper">
                  <img src={article.image} alt={article.title} />
                </div>
              )}

              <div className="news-content">
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
              </div>

              <div className="news-footer">
                <span className="more-button">Lesa meira</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoggedInHomepage;
