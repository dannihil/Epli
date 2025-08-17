import { useState } from "react";
import emailjs from "emailjs-com";

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

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={closeModal}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          width: "400px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Skila inn villu</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nafn"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: "100%", marginBottom: 10 }}
            required
          />
          <input
            type="email"
            placeholder="Netfang"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            style={{ width: "100%", marginBottom: 10 }}
            required
          />
          <textarea
            placeholder="Lýsing á villu"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            style={{ width: "100%", height: 100, marginBottom: 10 }}
            required
          />
          <button type="submit" style={{ padding: "8px 16px" }}>
            Senda
          </button>
        </form>
      </div>
    </div>
  );
}
