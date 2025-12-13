let cards = [];

// ---------- ブックマーク ----------
function getBookmarks() {
  return JSON.parse(localStorage.getItem("bookmarks") || "[]");
}

function saveBookmarks(bookmarks) {
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

function isBookmarked(id) {
  return getBookmarks().includes(id);
}

function toggleBookmark(id) {
  let bookmarks = getBookmarks();
  bookmarks = bookmarks.includes(id)
    ? bookmarks.filter(b => b !== id)
    : [...bookmarks, id];

  saveBookmarks(bookmarks);
  applyFilters();
}

// ---------- JSON読み込み ----------
fetch("cards.json")
  .then(res => res.json())
  .then(data => {
    cards = data;
    displayCards(sortCards(cards));
  });

// ---------- ソート ----------
function sortCards(arr) {
  return arr.slice().sort((a, b) => {
    const aItem = a.tags.includes("アイテム");
    const bItem = b.tags.includes("アイテム");

    if (aItem && !bItem) return 1;
    if (!aItem && bItem) return -1;

    return a.name.localeCompare(b.name, "ja");
  });
}

// ---------- 表示 ----------
function displayCards(list) {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p>条件に一致するカードはありません。</p>";
    return;
  }

  list.forEach(card => {
    const div = document.createElement("div");
    const isItem = card.tags.includes("アイテム");
    const star = `
      <span class="bookmark ${isBookmarked(card.id) ? "active" : ""}"
            onclick="toggleBookmark(${card.id})">★</span>
    `;

    if (isItem) {
      div.className = "card item";
      div.innerHTML = `
        ${star}
        <img src="${card.image}" alt="${card.name}">
        <h3>${card.name}</h3>
        <p><strong>効果:</strong> ${card.effect}</p>
      `;
    } else {
      const tagsHTML = card.tags
        .map(t => `<span class="tag ${t}">${t}</span>`)
        .join(" ");

      div.className = "card";
      div.innerHTML = `
        ${star}
        <img src="${card.image}" alt="${card.name}">
        <h3>${card.name}</h3>
        <div class="tags">${tagsHTML}</div>
        <p><strong>射程距離:</strong> ${card.range}</p>
        <p><strong>HP:</strong> ${card.hp}</p>
        <p><strong>通常攻撃:</strong> ${card.normalAttack}</p>
        <p><strong>低コストスキル (${card.lowCostSkill.cp}CP):</strong>
          ${card.lowCostSkill.name} - ${card.lowCostSkill.description}</p>
        <p><strong>高コストスキル (${card.highCostSkill.cp}CP):</strong>
          ${card.highCostSkill.name} - ${card.highCostSkill.description}</p>
        <p><strong>パッシブ:</strong> ${card.passive}</p>
      `;
    }

    container.appendChild(div);
  });
}

// ---------- フィルタ ----------
document.getElementById("searchName").addEventListener("input", applyFilters);
document.getElementById("showBookmarks").addEventListener("change", applyFilters);
document.querySelectorAll("#tagFilters input")
  .forEach(cb => cb.addEventListener("change", applyFilters));

function applyFilters() {
  const nameQuery = document.getElementById("searchName").value.trim();
  const selectedTags = Array.from(
    document.querySelectorAll("#tagFilters input:checked")
  ).map(cb => cb.value);
  const bookmarksOnly = document.getElementById("showBookmarks").checked;

  let filtered = cards.filter(card => {
    if (bookmarksOnly && !isBookmarked(card.id)) return false;
    if (!card.name.includes(nameQuery)) return false;

    if (selectedTags.length === 0) return true;

    return selectedTags.some(tag => card.tags.includes(tag));
  });

  displayCards(sortCards(filtered));
}
