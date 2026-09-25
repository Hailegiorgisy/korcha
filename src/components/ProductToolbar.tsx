import type { SortOption } from "../types/product";

interface ProductToolbarProps {
  searchTerm: string;
  sortOption: SortOption;
  hasProducts: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onClearAll: () => void;
}

const ProductToolbar = ({
  searchTerm,
  sortOption,
  hasProducts,
  onSearchChange,
  onSortChange,
  onClearAll,
}: ProductToolbarProps) => {
  return (
    <section className="toolbar-panel panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Search & Filters</h2>
          <p className="panel-subtitle">
            Find products quickly and adjust list ordering.
          </p>
        </div>
      </div>

      <div className="toolbar-grid">
        <div className="field-group">
          <label htmlFor="search-products">Search</label>
          <input
            id="search-products"
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or category"
          />
        </div>

        <div className="field-group">
          <label htmlFor="sort-products">Sort by Price</label>
          <select
            id="sort-products"
            value={sortOption}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
          >
            <option value="default">Default order</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {hasProducts && (
          <div className="toolbar-actions">
            <button type="button" className="btn btn-danger" onClick={onClearAll}>
              Clear All
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductToolbar;
