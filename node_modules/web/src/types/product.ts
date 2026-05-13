export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  platform: string;
  url: string;
  rating?: number;
    isLowest?: boolean;
}