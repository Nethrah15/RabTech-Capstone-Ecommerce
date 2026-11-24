// api.js - RESTful API Client
const BASE_URL = "https://fakestoreapi.com/products";

export async function getProducts() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("API Failed");
  return await res.json();
}
