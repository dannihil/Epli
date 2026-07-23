import { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import { FiMessageSquare, FiX } from "react-icons/fi";
import "../css/FooterModal.css";

export default function FooterModal({ closeModal }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        alert("Takk! Skilaboðin voru send ✅");
        setFormData({ name: "", email: "", message: "" });
        closeModal();
      })
      .catch((err) => {
        alert("Villa kom upp ❌ Reyndu aftur");
        console.error(err);
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
    <div className="footer-modal-overlay" onClick={closeModal}>
      <div
        className="footer-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="footer-modal-close"
          onClick={closeModal}
          aria-label="Loka"
        >
          <FiX size={18} />
        </button>

        <div className="footer-modal-icon">
          <FiMessageSquare size={22} />
        </div>
        <h2>Senda ábendingu</h2>
        <p className="footer-modal-subtitle">
          Sástu villu eða dettur eitthvað í hug? Láttu okkur vita.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="footer-modal-label">
            Nafn
            <input
              type="text"
              placeholder="Nafn þitt"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </label>
          <label className="footer-modal-label">
            Netfang
            <input
              type="email"
              placeholder="netfang@epli.is"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </label>
          <label className="footer-modal-label">
            Lýsing
            <textarea
              placeholder="Lýstu villunni eða hugmyndinni þinni..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
            />
          </label>
          <button className="footer-modal-send-button" type="submit">
            Senda ábendingu
          </button>
        </form>
      </div>
    </div>
  );
}
