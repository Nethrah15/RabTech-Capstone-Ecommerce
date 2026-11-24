import { getProducts } from "./api.js";

let allProducts = [];
let cart = JSON.parse(localStorage.getItem("capstone_cart")) || [];
let myProducts = JSON.parse(localStorage.getItem("my_products")) || [];
let editingId = null;
let currentUser = localStorage.getItem("capstone_user") || null;

updateAuthUI();
updateCartUI();

// AUTH SIMULATION
window.login = function() {
  const name = prompt("Enter your name to Login:");
  if (!name) return;
  currentUser = name;
  localStorage.setItem("capstone_user", name);
  updateAuthUI();
  alert(`Welcome ${name}! Login Successful`);
}
function updateAuthUI() {
  document.getElementById("userName").textContent = currentUser ? `Hi, ${currentUser}` : "Guest";
  document.getElementById("loginBtn").textContent = currentUser ? "Logout" : "Login";
  if (currentUser) {
    document.getElementById("loginBtn").onclick = () => {
      localStorage.removeItem("capstone_user");
      currentUser = null; updateAuthUI();
    }
  } else document.getElementById("loginBtn").onclick = login;
}

// LOAD
async function load() {
  try {
    const apiProducts = await getProducts();
    allProducts = [...myProducts, ...apiProducts];
    applyFilters();
  } catch (e) {
    document.getElementById("error").textContent = "Error loading products. Check internet.";
    document.getElementById("error").style.display = "block";
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

// FILTER + SEARCH + SORT
window.applyFilters = function() {
  let filtered = [...allProducts];
  const search = document.getElementById("searchInput").value.toLowerCase();
  const cat = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("sortSelect").value;
  if (search) filtered = filtered.filter(p => p.title.toLowerCase().includes(search));
  if (cat !== "all") filtered = filtered.filter(p => p.category === cat);
  if (sort === "low") filtered.sort((a,b) => a.price - b.price);
  if (sort === "high") filtered.sort((a,b) => b.price - a.price);
  render(filtered);
}

function render(list) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";
  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "card glass";
    div.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/150'}" >
      <h3>${p.title.slice(0,40)}</h3>
      <p>${p.category} | $${p.price}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
      <button onclick="editProduct(${p.id})">Edit</button>
      <button onclick="deleteProduct(${p.id})">Delete</button>
    `;
    grid.appendChild(div);
  });
}

// CRUD - CREATE / UPDATE
window.showAddForm = () => document.getElementById("productForm").style.display = "block";
window.hideAddForm = () => document.getElementById("productForm").style.display = "none";

document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newP = {
    id: editingId || Date.now(),
    title: document.getElementById("pTitle").value,
    price: Number(document.getElementById("pPrice").value),
    category: document.getElementById("pCategory").value,
    image: document.getElementById("pImage").value
  };
  if (editingId) {
    myProducts = myProducts.map(p => p.id === editingId ? newP : p);
    editingId = null;
  } else myProducts.push(newP);
  localStorage.setItem("my_products", JSON.stringify(myProducts));
  hideAddForm(); e.target.reset(); load(); applyFilters();
  alert("Product Saved!");
});

// CRUD - DELETE
window.deleteProduct = function(id) {
  if (!confirm("Delete this product?")) return;
  myProducts = myProducts.filter(p => p.id !== id);
  allProducts = allProducts.filter(p => p.id !== id);
  localStorage.setItem("my_products", JSON.stringify(myProducts));
  applyFilters();
}

// CRUD - EDIT
window.editProduct = function(id) {
  const p = allProducts.find(x => x.id === id);
  editingId = id;
  document.getElementById("pTitle").value = p.title;
  document.getElementById("pPrice").value = p.price;
  document.getElementById("pCategory").value = p.category;
  showAddForm();
}

// CART - Persistent State
window.addToCart = function(id) {
  const p = allProducts.find(x => x.id === id);
  cart.push(p);
  localStorage.setItem("capstone_cart", JSON.stringify(cart));
  updateCartUI();
}
function updateCartUI() {
  document.getElementById("cartCount").textContent = cart.length;
  const total = cart.reduce((s,p) => s + p.price, 0);
  document.getElementById("cartTotal").textContent = `Total: $${total.toFixed(2)}`;
  document.getElementById("cartList").innerHTML = cart.map(c => `<li>${c.title.slice(0,30)} - $${c.price}</li>`).join("");
}
window.clearCart = function() { cart = []; localStorage.removeItem("capstone_cart"); updateCartUI(); }
window.toggleCart = function() {
  const b = document.getElementById("cartBox");
  b.style.display = b.style.display === "none" ? "block" : "none";
}
document.getElementById("searchInput").addEventListener("input", applyFilters);
load();
