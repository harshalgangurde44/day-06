
export default function ProductCard({ product }) {
    return (
      <article className="product-card">
        <div className="product-image">
          <img
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
          />
        </div>
  
        <div className="product-info">
          <h3>{product.title}</h3>
  
          <p className="product-description">
            {product.description}
          </p>
  
          <div className="product-footer">
            <span className="product-price">
              ${product.price}
            </span>
  
            <span className="product-rating">
              ⭐ {product.rating}
            </span>
          </div>
        </div>
      </article>
    );
  }
  