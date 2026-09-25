import { useState, type FormEvent } from "react";
import type { NewProductInput, Product } from "../types/product";
import { isDuplicateProductName } from "../utils/productHelpers";

interface ProductFormProps {
  products: Product[];
  onAddProduct: (product: NewProductInput) => void;
}

const initialFormState: NewProductInput = {
  name: "",
  price: 0,
  category: "",
  inStock: true,
};

const ProductForm = ({ products, onAddProduct }: ProductFormProps) => {
  const [formData, setFormData] = useState<NewProductInput>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const trimmedName = formData.name.trim();
  const trimmedCategory = formData.category.trim();
  const isDuplicate = isDuplicateProductName(products, trimmedName);

  const isFormValid =
    trimmedName.length > 0 &&
    formData.price > 0 &&
    trimmedCategory.length > 0 &&
    !isDuplicate;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!isFormValid) {
      if (isDuplicate) {
        setErrorMessage("A product with this name already exists.");
      }
      return;
    }

    onAddProduct({
      name: trimmedName,
      price: formData.price,
      category: trimmedCategory,
      inStock: formData.inStock,
    });

    setFormData(initialFormState);
    setErrorMessage("");
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Add Product</h2>
          <p className="panel-subtitle">
            Register a new item and add it to the classroom shop.
          </p>
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="product-name">Product Name</label>
        <input
          id="product-name"
          type="text"
          value={formData.name}
          onChange={(event) => {
            setFormData((prev) => ({ ...prev, name: event.target.value }));
            setErrorMessage("");
          }}
          placeholder="e.g. Wireless Mouse"
        />
      </div>

      <div className="field-group">
        <label htmlFor="product-price">Price ($)</label>
        <input
          id="product-price"
          type="number"
          min="0"
          step="0.01"
          value={formData.price || ""}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              price: Number(event.target.value),
            }))
          }
          placeholder="0.00"
        />
      </div>

      <div className="field-group">
        <label htmlFor="product-category">Category</label>
        <input
          id="product-category"
          type="text"
          value={formData.category}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, category: event.target.value }))
          }
          placeholder="e.g. Accessories"
        />
      </div>

      <div className="checkbox-field">
        <input
          id="product-stock"
          type="checkbox"
          checked={formData.inStock}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, inStock: event.target.checked }))
          }
        />
        <label htmlFor="product-stock">Available in stock</label>
      </div>

      {isDuplicate && trimmedName.length > 0 && (
        <p className="form-error">Duplicate product name is not allowed.</p>
      )}

      {errorMessage && <p className="form-error">{errorMessage}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
          Add Product
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
