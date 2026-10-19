import React, { useState, useEffect } from "react";
import "../css/LoggedInHomepage.css";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { FiPackage, FiMonitor, FiShoppingBag, FiPercent } from "react-icons/fi";
import PatchNotesModal from "../functions/patchNotesModal";

const navItems = [
  {
    icon: <FiPackage size={30} />,
    title: "Staða sendinga",
    desc: "FG order",
    route: "/stada-sendinga",
  },
  {
    icon: <FiMonitor size={30} />,
    title: "Sérpöntunarverðlisti",
    desc: "Sjáðu verð og útfærslur fyrir sérpantanir",
    route: "/cto",
  },
  {
    icon: <FiShoppingBag size={30} />,
    title: "Sölutorg",
    desc: "Gagnabanki - Sölutorg",
    route: "/solutorg",
  },
  {
    icon: <FiPercent size={30} />,
    title: "Söluþóknun",
    desc: "Reglur og reiknivél fyrir söluþóknun",
    route: "/soluthoknun",
  },
];

function LoggedInHomepage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 18 ? "Góðan daginn" : "Gott kvöld";

  const [articles, setArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    fetch("/api/9to5mac")
      .then((res) => res.json())
      .then((data) => setArticles(data))
      .catch((err) => console.error("fetch error:", err))
      .finally(() => setLoadingNews(false));
  }, []);

  return (
    <div>
      <PatchNotesModal />

      <div className="hero-section">
        <p className="greeting-soft">{greeting}</p>
        <h1 className="greeting-name">{user.fullName}</h1>
      </div>

      <div className="nav-buttons">
        {navItems.map((item) => (
          <div
            key={item.route}
            className="content-selection"
            onClick={() => navigate(item.route)}
          >
            <div className="content-selection-icon">{item.icon}</div>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="news-section">
        <h2 className="news-heading">Fréttir</h2>

        {loadingNews ? (
          <div className="news-layout">
            <div className="news-skeleton featured-skeleton" />
            <div className="news-skeleton" />
            <div className="news-skeleton" />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default LoggedInHomepage;
