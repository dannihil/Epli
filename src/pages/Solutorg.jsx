import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../css/Solutorg.css";

export default function Solutorg() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [serialNumber, setSerialNumber] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("Á lager");
  const [notes, setNotes] = useState("");
  const [newProductImages, setNewProductImages] = useState([]);

  const [galleryImages, setGalleryImages] = useState([]);
  const [activeGalleryImage, setActiveGalleryImage] = useState(null);

  const statusOptions = ["Á lager", "Í útláni", "Selt"];

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [editSerialNumber, setEditSerialNumber] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editStatus, setEditStatus] = useState("Á lager");
  const [editNotes, setEditNotes] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const [addProductError, setAddProductError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  function openGallery(images, startImage) {
    setGalleryImages(images);
    setActiveGalleryImage(startImage);
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (*)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowAddModal(false);

        if (typeof setShowEditModal !== "undefined") {
          setShowEditModal(false);
        }

        setActiveGalleryImage(null);
        setGalleryImages([]);
        return;
      }

      if (!activeGalleryImage) return;

      if (event.key === "ArrowRight") {
        showNextImage();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeGalleryImage, galleryImages]);

  function getStatusStyle(status) {
    if (status === "Á lager") return "status-in-stock";
    if (status === "Í útláni") return "status-loaned";
    if (status === "Selt") return "status-sold";
    return "status-default";
  }

  async function updateStatus(productId, newStatus) {
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", productId);

    if (error) {
      console.error(error);
      return;
    }

    await loadProducts();
  }

  async function addProduct() {
    const formattedSerial = serialNumber.trim().toUpperCase();

    if (!formattedSerial) return;

    const { data: existingProduct, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("serial_number", formattedSerial)
      .maybeSingle();

    if (checkError) {
      console.error(checkError);
      return;
    }

    if (existingProduct) {
      setAddProductError("A product with this serial number already exists.");
      return;
    }

    const { data: productData, error } = await supabase
      .from("products")
      .insert({
        serial_number: formattedSerial,
        model: model.trim(),
        status,
        notes: notes.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      setAddProductError("Could not add product.");
      return;
    }

    if (newProductImages.length > 0) {
      await Promise.all(
        newProductImages.map((file) => uploadImageFile(file, productData.id)),
      );
    }

    setSerialNumber("");
    setModel("");
    setStatus("Á lager");
    setNotes("");
    setNewProductImages([]);
    setAddProductError("");
    setShowAddModal(false);

    await loadProducts();
  }

  async function uploadImageFile(file, productId) {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${productId}/${Date.now()}-${safeFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("solutorg")
      .upload(path, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("solutorg")
      .getPublicUrl(uploadData.path);

    const { error: insertError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        image_url: publicData.publicUrl,
        storage_path: uploadData.path,
      });

    if (insertError) {
      console.error("Database insert error:", insertError);

      await supabase.storage.from("solutorg").remove([uploadData.path]);
    }
  }
  async function uploadImages(event, productId) {
    const files = Array.from(event.target.files);

    if (!files.length) return;

    await Promise.all(files.map((file) => uploadImageFile(file, productId)));

    event.target.value = "";

    await loadProducts();
  }

  const filteredProducts = products.filter((product) => {
    const value = search.toLowerCase();
    const matchesSearch =
      product.serial_number?.toLowerCase().includes(value) ||
      product.model?.toLowerCase().includes(value) ||
      product.status?.toLowerCase().includes(value) ||
      product.notes?.toLowerCase().includes(value);
    const matchesStatus =
      statusFilter === "All" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function cycleStatus(product) {
    const cycle = ["Á lager", "Í útláni", "Selt"];
    const next = cycle[(cycle.indexOf(product.status) + 1) % cycle.length];
    updateStatus(product.id, next);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setEditSerialNumber(product.serial_number || "");
    setEditModel(product.model || "");
    setEditStatus(product.status || "Á lager");
    setEditNotes(product.notes || "");
    setShowEditModal(true);
  }

  async function saveProductEdits() {
    if (!editingProduct) return;

    const { error } = await supabase
      .from("products")
      .update({
        serial_number: editSerialNumber.trim(),
        model: editModel.trim(),
        status: editStatus,
        notes: editNotes.trim(),
      })
      .eq("id", editingProduct.id);

    if (error) {
      console.error(error);
      return;
    }

    setShowEditModal(false);
    setEditingProduct(null);
    await loadProducts();
  }

  function showNextImage() {
    if (!galleryImages.length || !activeGalleryImage) return;

    const currentIndex = galleryImages.findIndex(
      (img) => img.image_url === activeGalleryImage,
    );

    const nextIndex = (currentIndex + 1) % galleryImages.length;

    setActiveGalleryImage(galleryImages[nextIndex].image_url);
  }

  function showPreviousImage() {
    if (!galleryImages.length || !activeGalleryImage) return;

    const currentIndex = galleryImages.findIndex(
      (img) => img.image_url === activeGalleryImage,
    );

    const previousIndex =
      (currentIndex - 1 + galleryImages.length) % galleryImages.length;

    setActiveGalleryImage(galleryImages[previousIndex].image_url);
  }

  function handleGalleryTouchEnd() {
    if (touchStartX === null || touchEndX === null) return;

    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      showNextImage();
    }

    if (distance < -minSwipeDistance) {
      showPreviousImage();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  }

  function getStoragePathFromUrl(imageUrl) {
    if (!imageUrl) return null;

    const marker = "/storage/v1/object/public/solutorg/";

    if (!imageUrl.includes(marker)) return null;

    return decodeURIComponent(imageUrl.split(marker)[1]);
  }

  async function deleteProduct(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product and all linked images?",
    );

    if (!confirmed) return;

    const { data: images, error: imageFetchError } = await supabase
      .from("product_images")
      .select("id, image_url, storage_path")
      .eq("product_id", productId);

    if (imageFetchError) {
      console.error("Image fetch error:", imageFetchError);
      return;
    }

    const dbPaths = (images || [])
      .map(
        (image) => image.storage_path || getStoragePathFromUrl(image.image_url),
      )
      .filter(Boolean);

    const { data: listedFiles, error: listError } = await supabase.storage
      .from("solutorg")
      .list(productId, { limit: 1000 });

    if (listError) {
      console.error("Storage list error:", listError);
    }

    const listedPaths = (listedFiles || []).map(
      (file) => `${productId}/${file.name}`,
    );

    const storagePaths = [...new Set([...dbPaths, ...listedPaths])];

    console.log("DB paths:", dbPaths);
    console.log("Listed paths:", listedPaths);
    console.log("Final paths to delete:", storagePaths);

    if (storagePaths.length > 0) {
      const { data: removedFiles, error: removeError } = await supabase.storage
        .from("solutorg")
        .remove(storagePaths);

      console.log("Removed files:", removedFiles);
      console.log("Remove error:", removeError);

      if (removeError) {
        console.error("Storage remove error:", removeError);
        return;
      }
    }

    const { error: productImagesDeleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);

    if (productImagesDeleteError) {
      console.error("Product images delete error:", productImagesDeleteError);
      return;
    }

    const { error: productDeleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (productDeleteError) {
      console.error("Product delete error:", productDeleteError);
      return;
    }

    await loadProducts();
  }

  return (
    <div className="solutorg-page">
      <div className="solutorg-header">
        <div>
          <h1>Sölutorg</h1>
        </div>

        <button
          className="add-product-button"
          onClick={() => setShowAddModal(true)}
        >
          + Add Product
        </button>
      </div>

      <div className="solutorg-filter-row">
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search serial, model, status, or notes..."
        />
        <div className="status-filter-pills">
          {["All", "Á lager", "Í útláni", "Selt"].map((s) => (
            <button
              key={s}
              className={`status-filter-pill ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card-header">
              <div>
                <h3 className="product-serial">{product.serial_number}</h3>
                <p className="product-model">{product.model || "No model"}</p>
              </div>
            </div>

            <div className="product-meta">
              <div className="meta-row">
                <span>Status</span>
                <button
                  className={`status-pill-solutorg ${getStatusStyle(product.status)}`}
                  onClick={() => cycleStatus(product)}
                >
                  {product.status}
                  <span className="status-pill-cycle-icon">↻</span>
                </button>
              </div>

              <div className="meta-row">
                <span>Notes</span>
                <p className="notes-text">{product.notes || "—"}</p>
              </div>

              <div className="meta-row">
                <span>Added</span>
                <p>
                  {new Date(product.created_at).toLocaleDateString("is-IS")}
                </p>
              </div>
            </div>

            <div className="product-card-bottom">
            {product.product_images?.length > 0 && (
              <div className="image-grid">
                {product.product_images.slice(0, 2).map((image, index) => {
                  const extraCount = product.product_images.length - 2;
                  const showOverlay = index === 1 && extraCount > 0;

                  return (
                    <div
                      key={image.id}
                      className="image-wrapper"
                      onClick={() =>
                        openGallery(product.product_images, image.image_url)
                      }
                    >
                      <img
                        src={image.image_url}
                        alt={product.serial_number}
                        className="product-image-solutorg"
                      />

                      {showOverlay && (
                        <div className="image-count-overlay">+{extraCount}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="product-card-actions">
              <label className="upload-button">
                + Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => uploadImages(e, product.id)}
                />
              </label>

              <div className="product-edit-delete-row">
                <button onClick={() => openEditModal(product)}>Edit</button>
                <button onClick={() => deleteProduct(product.id)}>
                  Delete
                </button>
              </div>
            </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Add Product</h2>

            <input
              style={{ backgroundColor: "#fff", color: "#000" }}
              value={serialNumber}
              onChange={(e) => {
                setSerialNumber(e.target.value.toUpperCase());
                setAddProductError("");
              }}
              placeholder="Serial number"
            />

            {addProductError && (
              <p className="modal-error">{addProductError}</p>
            )}

            <input
              style={{ backgroundColor: "#fff", color: "#000" }}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Model"
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <textarea
              style={{ backgroundColor: "#fff", color: "#000" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
            />

            <label className="modal-upload-button">
              {newProductImages.length > 0
                ? `${newProductImages.length} image(s) selected`
                : "+ Choose Images"}

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setNewProductImages(Array.from(e.target.files))
                }
              />
            </label>

            <div className="modal-actions">
              <button onClick={addProduct}>Save Product</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {activeGalleryImage && (
        <div
          className="gallery-overlay"
          onClick={() => setActiveGalleryImage(null)}
        >
          <div className="gallery-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="gallery-close"
              onClick={() => setActiveGalleryImage(null)}
            >
              ×
            </button>

            <button
              className="gallery-nav gallery-prev"
              onClick={showPreviousImage}
            >
              ‹
            </button>

            <button
              className="gallery-nav gallery-next"
              onClick={showNextImage}
            >
              ›
            </button>

            <img
              src={activeGalleryImage}
              alt="Large preview"
              className="gallery-main-image"
              onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
              onTouchMove={(e) => setTouchEndX(e.touches[0].clientX)}
              onTouchEnd={handleGalleryTouchEnd}
            />

            <div className="gallery-thumbnails">
              {galleryImages.map((image) => (
                <img
                  key={image.id}
                  src={image.image_url}
                  alt=""
                  onClick={() => setActiveGalleryImage(image.image_url)}
                  className={
                    activeGalleryImage === image.image_url
                      ? "gallery-thumbnail active"
                      : "gallery-thumbnail"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Product</h2>

            <input
              value={editSerialNumber}
              onChange={(e) => setEditSerialNumber(e.target.value)}
              placeholder="Serial number"
            />

            <input
              value={editModel}
              onChange={(e) => setEditModel(e.target.value)}
              placeholder="Model"
            />

            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Notes"
            />

            <div className="modal-actions">
              <button onClick={saveProductEdits}>Save Changes</button>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
