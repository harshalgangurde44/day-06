import "./styles.css";


import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import Loading from "./Loading";

const API_URL = "https://dummyjson.com/products";
const LIMIT = 12;

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const skipRef = useRef(0);
  const hasMoreRef = useRef(true);

  const loadProducts = useCallback(async () => {
    // Prevent duplicate requests.
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const skip = skipRef.current;

      const response = await fetch(
        `${API_URL}?limit=${LIMIT}&skip=${skip}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }

      const data = await response.json();

      setProducts((previous) => [
        ...previous,
        ...data.products,
      ]);

      setTotal(data.total);

      // Advance the offset only after a successful response.
      skipRef.current += data.products.length;

      const moreAvailable = skipRef.current < data.total;

      hasMoreRef.current = moreAvailable;
      setHasMore(moreAvailable);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please retry."
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || loading || error || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadProducts();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loading, error, hasMore, loadProducts]);

  return (
    <main className="page-container">
      <header className="page-header">
        <h1>Product Store</h1>
        <p>
          Scroll down to discover more products.
        </p>
      </header>

      <div className="results-info">
        Showing {products.length} of {total || "..."} products
      </div>

      <section className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </section>

      {loading && <Loading />}

      {error && (
        <div className="error-container" role="alert">
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={loadProducts}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && !hasMore && products.length > 0 && (
        <p className="end-message">
          You've reached the end. All products loaded!
        </p>
      )}

      {/* Intersection Observer watches this element. */}
      <div
        ref={sentinelRef}
        className="scroll-sentinel"
        aria-hidden="true"
      />
    </main>
  );
}

