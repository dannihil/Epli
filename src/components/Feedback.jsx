import { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import { FiMessageSquare, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import "../css/Feedback.css";

export default function Feedback({ closeModal }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          title: "Villa á vefsíðu",
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
      .then(() => {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(closeModal, 4000);
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  };

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeModal]);

  return (
    <div className="feedback-overlay" onClick={closeModal}>
      <div
        className="feedback-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="feedback-close"
          onClick={closeModal}
          aria-label="Loka"
        >
          <FiX size={18} />
        </button>

        {status === "success" ? (
          <div className="feedback-result">
            <div className="feedback-icon feedback-icon-success">
              <FiCheck size={22} />
            </div>
            <h2>Takk fyrir ábendinguna!</h2>
            <p className="feedback-subtitle">
              Þetta verður skoðað við allra fyrsta tækifæri.
            </p>
          </div>
        ) : (
          <>
            <div className="feedback-icon">
              <FiMessageSquare size={22} />
            </div>
            <h2>Senda ábendingu</h2>
            <p className="feedback-subtitle">
              Sástu villu eða dettur eitthvað nýtt í hug?
              <br /> Láttu okkur vita.
            </p>

            <form onSubmit={handleSubmit}>
              <label className="feedback-label">
                Nafn
                <input
                  type="text"
                  placeholder="Nafn þitt"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={status === "sending"}
                  required
                />
              </label>
              <label className="feedback-label">
                Netfang
                <input
                  type="email"
                  placeholder="netfang@epli.is"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={status === "sending"}
                  required
                />
              </label>
              <label className="feedback-label">
                Lýsing
                <textarea
                  placeholder="Lýstu villunni eða hugmyndinni þinni..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  disabled={status === "sending"}
                  required
                />
              </label>

              {status === "error" && (
                <p className="feedback-error">
                  <FiAlertCircle size={14} />
                  Ekki tókst að senda skilaboð. Reyndu aftur.
                </p>
              )}

              <button
                className="feedback-send-button"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sendi..." : "Senda ábendingu"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
