import { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  isLowest?: boolean;
  savings?: number;
  onClick?: () => void;
}

export default function ProductCard({
  product,
  isLowest,
  savings,
  onClick
}: ProductCardProps) {
    
  return (
<div
  onClick={onClick} className="relative glass-card glass-card-hover rounded-3xl overflow-hidden border border-cyan-400/20">      
      
        {isLowest && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-cyan-400/50 z-10">
          🔥 Best Deal
        </div>
      )}
      {/* Image */}
      <div className="bg-gradient-to-br from-cyan-400/10 to-blue-500/10 h-64 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Platform + Rating */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-300">
            {product.platform}
          </h2>

          {product.rating && (
            <span className="text-yellow-400 font-semibold">
              ⭐ {product.rating}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="mt-3 text-cyan-100/70 text-sm leading-6 h-12 overflow-hidden">
          {product.title}
        </p>

        {/* Price */}
      <p className="mt-5 text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
  ₹{product.price.toLocaleString()}
</p>

{isLowest && (
  <p className="text-cyan-400 text-sm mt-2 font-medium">
     Save ₹{(savings ?? 0).toLocaleString()}
  </p>
)}

        {/* Button */}
        <a
          href={product.url}
          target="_blank"
          rel="noreferrer"
          className="block w-full text-center mt-5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-400/50 transition"
        >
          View Deal
        </a>
      </div>
    </div>
  );
}