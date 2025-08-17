import { useState, useEffect } from "react";
import emailjs from "emailjs-com";
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
        <h2>Senda tilkynningu um villu</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nafn"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Netfang"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Lýsing á villu"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            required
          />
          <button className="footer-modal-send-button" type="submit">
            Senda
          </button>
        </form>
      </div>
    </div>
  );
}
