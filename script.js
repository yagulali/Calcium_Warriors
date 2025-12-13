let cards = [];
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

/* =====================
   JSON 読み込み
===================== */
fetch("cards.json")
  .then(res => res.json())
  .then(data => {
    cards = data;
    applyFilters();
  })
  .catch(err => console.error("カードデータ読み込み失敗", err));

/* =====================
   ソート（キャラ→アイテム）
===================== */
function sortCards(cardList) {
  const characters = cardList
    .filter(c => !c.tags.includes("アイテム"))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  const items = cardList
    .filter(c => c.tags.includes("アイテム"))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  return [...characters, ...items];
}

/* =====================
   カード表示
===================== */
function displayCards(cardList) {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  if (cardList.length === 0) {
    container.innerHTML = "<p>条件に一致するカードはありません。</p>";
    return;
  }

  cardList.forEach(card => {
    const isItem = card.tags.includes("アイテム");
    const isBookmarked = bookmarks.includes(card.id);

    const tagsHTML = card.tags
      .map(tag => `<span class="tag ${tag}">${tag}</span>`)
      .join(" ");

    const star = `
      <div class="bookmark ${isBookmarked ? "active" : ""}" data-id="${card.id}">
        ★
      </div>
    `;

    const div = document.createElement("div");

    /* ===== アイテム ===== */
    if (isItem) {
      div.className = "card item";
      div.innerHTML = `
        ${star}
        <img src="${card.image}" alt="${card.name}">
        <h3>${card.name}</h3>
        <div class="tags">${tagsHTML}</div>
        <p><strong>CP:</strong> ${card.cp}</p>
        <p><strong>効果:</strong> ${card.effect}</p>
      `;
    }
    /* ===== キャラ ===== */
    else {
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
          ${card.lowCostSkill.name} - ${card.lowCostSkill.description}
        </p>
        <p><strong>高コストスキル (${card.highCostSkill.cp}CP):</strong>
          ${card.highCostSkill.name} - ${card.highCostSkill.description}
        </p>
        <p><strong>パッシブ:</strong> ${card.passive}</p>
      `;
    }

    container.appendChild(div);
  });

  setupBookmarkEvents();
}

/* =====================
   ブックマーク処理
===================== */
function setupBookmarkEvents() {
  document.querySelectorAll(".bookmark").forEach(el => {
    el.addEventListener("click", e => {
      const id = Number(e.target.dataset.id);

      if (bookmarks.includes(id)) {
        bookmarks = bookmarks.filter(b => b !== id);
      } else {
        bookmarks.push(id);
      }

      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      applyFilters();
    });
  });
}

/* =====================
   フィルタ処理（OR 条件）
===================== */
document.getElementById("searchName").addEventListener("input", applyFilters);
document
  .querySelectorAll("#tagFilters input[type=checkbox]")
  .forEach(cb => cb.addEventListener("change", applyFilters));

function applyFilters() {
  const nameQuery = document.getElementById("searchName").value.trim();
  const selectedTags = Array.from(
    document.querySelectorAll("#tagFilters input:checked")
  ).map(cb => cb.value);

  const filtered = cards.filter(card => {
    const matchName = card.name.includes(nameQuery);

    if (selectedTags.length === 0) return matchName;

    const matchTags = selectedTags.some(tag =>
      card.tags.includes(tag)
    );

    return matchName && matchTags;
  });

  displayCards(sortCards(filtered));
}
