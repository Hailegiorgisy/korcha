interface InventorySummaryData {
  totalProducts: number;
  inStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
}

interface InventorySummaryProps {
  summary: InventorySummaryData;
}

const InventorySummary = ({ summary }: InventorySummaryProps) => {
  return (
    <section className="stats-row" aria-label="Inventory summary">
      <article className="stat-tile">
        <span className="stat-tile-label">Total Products</span>
        <span className="stat-tile-value">{summary.totalProducts}</span>
      </article>
      <article className="stat-tile">
        <span className="stat-tile-label">In Stock</span>
        <span className="stat-tile-value">{summary.inStockCount}</span>
      </article>
      <article className="stat-tile">
        <span className="stat-tile-label">Out of Stock</span>
        <span className="stat-tile-value">{summary.outOfStockCount}</span>
      </article>
      <article className="stat-tile">
        <span className="stat-tile-label">Stock Value</span>
        <span className="stat-tile-value money">
          ${summary.totalStockValue.toFixed(2)}
        </span>
      </article>
    </section>
  );
};

export default InventorySummary;
