// ===== CONFIG =====
const STORAGE_KEY = "library_books_v7";
let books = [];

// ===== LOAD & SAVE =====
async function loadBooks() {
  try {
    const response = await fetch("books.json"); // fetch JSON file
    const jsonBooks = await response.json();

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      books = JSON.parse(raw);
    } else {
      books = jsonBooks;
      saveBooks();
    }
  } catch (error) {
    console.error("Error loading books.json:", error);
    books = [];
  }

  renderBooks();
  updateDashboard(); // also update dashboard if present
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// ===== RENDER LIBRARY =====
function renderBooks() {
  const table = document.getElementById("bookTable");
  if (!table) return; // skip if not on library page

  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const filter = document.getElementById("filterSelect")?.value || "all";

  let filtered = books.filter(book =>
    book.title.toLowerCase().includes(search) ||
    book.author.toLowerCase().includes(search) ||
    book.isbn.includes(search)
  );

  if (filter === "available") filtered = filtered.filter(b => b.available);
  if (filter === "borrowed") filtered = filtered.filter(b => !b.available);

  table.innerHTML = "";
  filtered.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <h3>${book.title}</h3>
      <div class="meta">Author: ${book.author} | ISBN: ${book.isbn} | Year: ${book.year}</div>
      <div class="status ${book.available ? "available" : "borrowed"}">
        ${book.available ? "Available" : `Borrowed by ${book.borrowerName} (ID: ${book.borrowerId})`}
      </div>
      <div class="actions">
        <button onclick="borrowBook(${book.id})" ${book.available ? "" : "disabled"}>Borrow</button>
        <button onclick="returnBook(${book.id})" ${book.available ? "disabled" : ""}>Return</button>
        <button onclick="deleteBook(${book.id})">Delete</button>
      </div>
    `;
    table.appendChild(card);
  });

  updateStats();
}

// ===== UPDATE STATS =====
function updateStats() {
  const total = books.length;
  const available = books.filter(b => b.available).length;
  const borrowed = total - available;

  // Library page stats
  document.getElementById("totalCount")?.textContent = `Total: ${total}`;
  document.getElementById("availableCount")?.textContent = `Available: ${available}`;
  document.getElementById("borrowedCount")?.textContent = `Borrowed: ${borrowed}`;

  // Dashboard page stats
  updateDashboard();
}

// ===== DASHBOARD =====
function updateDashboard() {
  if (document.body.classList.contains("dashboard")) {
    const total = books.length;
    const available = books.filter(b => b.available).length;
    const borrowed = total - available;

    document.getElementById("dashTotal")?.textContent = total;
    document.getElementById("dashAvailable")?.textContent = available;
    document.getElementById("dashBorrowed")?.textContent = borrowed;
  }
}

// ===== ACTIONS =====
function borrowBook(id) {
  const name = prompt("Enter borrower name:");
  const borrowerId = prompt("Enter borrower ID number:");
  if (!name || !borrowerId) return;
  const book = books.find(b => b.id === id);
  book.available = false;
  book.borrowerName = name;
  book.borrowerId = borrowerId;
  saveBooks();
  renderBooks();
}

function returnBook(id) {
  const book = books.find(b => b.id === id);
  book.available = true;
  book.borrowerName = "";
  book.borrowerId = "";
  saveBooks();
  renderBooks();
}

function deleteBook(id) {
  books = books.filter(b => b.id !== id);
  saveBooks();
  renderBooks();
}

function addBook() {
  const title = prompt("Title:"); if (!title) return;
  const author = prompt("Author:"); if (!author) return;
  const isbn = prompt("ISBN:"); if (!isbn) return;
  const year = prompt("Year:"); if (!year) return;

  books.push({
    id: Date.now(),
    title,
    author,
    isbn,
    year,
    available: true,
    borrowerName: "",
    borrowerId: ""
  });
  saveBooks();
  renderBooks();
}

function resetLibrary() {
  localStorage.removeItem(STORAGE_KEY);
  loadBooks();
}

// ===== EVENT LISTENERS =====
document.getElementById("addBookBtn")?.addEventListener("click", addBook);
document.getElementById("searchInput")?.addEventListener("input", renderBooks);
document.getElementById("filterSelect")?.addEventListener("change", renderBooks);

// ===== INIT =====
loadBooks();
