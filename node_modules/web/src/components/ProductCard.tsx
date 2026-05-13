import { Product } from "../types/product";

interface Props {
  product: Product;
    isLowest?: boolean;
  savings?: number;
   onClick?: () => void;
   selectedProduct:string;
}

export default function ProductCard({
  product,
  isLowest,
  savings,
   onClick,
   selectedProduct
}: Props) {
    
  return (
<div
  onClick={onClick} className="relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-600 hover:scale-[1.02] transition duration-300 shadow-xl">      
      
        {isLowest && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
          🔥 Best Deal
        </div>
      )}
      {/* Image */}
      <div className="bg-white h-64 overflow-hidden">
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
          <h2 className="text-xl font-bold text-white">
            {product.platform}
          </h2>

          {product.rating && (
            <span className="text-yellow-400 font-semibold">
              ⭐ {product.rating}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="mt-3 text-zinc-300 text-sm leading-6 h-12 overflow-hidden">
          {product.title}
        </p>

        {/* Price */}
      <p className="mt-5 text-3xl font-bold text-white">
  ₹{product.price.toLocaleString()}
</p>

{isLowest && (
  <p className="text-green-400 text-sm mt-2 font-medium">
     Save ₹{(savings ?? 0).toLocaleString()}
  </p>
)}

        {/* Button */}
        <a
          href={product.url}
          target="_blank"
          rel="noreferrer"
          className="block w-full text-center mt-5 bg-white text-black py-3 rounded-xl font-semibold hover:bg-zinc-200 transition"
        >
          View Deal
        </a>
      </div>
    </div>
  );
}