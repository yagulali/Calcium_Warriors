let cards = [];
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

// JSON読み込み
fetch("cards.json")
  .then(res => res.json())
  .then(data => {
    cards = data;
    applyFilters();
  });

// 五十音順（キャラのみ）
function sortByName(list) {
  return list.slice().sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

// 表示
function displayCards(list) {
  const charBox = document.getElementById("characterContainer");
  const itemBox = document.getElementById("itemContainer");

  charBox.innerHTML = "";
  itemBox.innerHTML = "";

  const characters = sortByName(list.filter(c => !c.tags.includes("アイテム")));
  const items = list.filter(c => c.tags.includes("アイテム"));

  characters.forEach(card => charBox.appendChild(createCharCard(card)));
  items.forEach(card => itemBox.appendChild(createItemCard(card)));

  setupBookmarks();
}

// キャラカード
function createCharCard(card) {
  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <div class="bookmark ${bookmarks.includes(card.id) ? "active" : ""}" data-id="${card.id}">★</div>
    <img src="${card.image}">
    <h3>${card.name}</h3>
    <div class="tags">${makeTags(card.tags)}</div>
    <p><strong>射程:</strong> ${card.range}</p>
    <p><strong>HP:</strong> ${card.hp}</p>
    <p><strong>通常攻撃:</strong> ${card.normalAttack}</p>
    <p><strong>低コストスキル (${card.lowCostSkill.cp}):</strong> ${card.lowCostSkill.name}</p>
    <p>${card.lowCostSkill.description}</p>
    <p><strong>高コストスキル (${card.highCostSkill.cp}):</strong> ${card.highCostSkill.name}</p>
    <p>${card.highCostSkill.description}</p>
    <p><strong>パッシブスキル:</strong> ${card.passive}</p>
  `;
  return div;
}

// アイテムカード
function createItemCard(card) {
  const div = document.createElement("div");
  div.className = "card item";

  div.innerHTML = `
    <div class="bookmark ${bookmarks.includes(card.id) ? "active" : ""}" data-id="${card.id}">★</div>
    <img src="${card.image}">
    <h3>${card.name}</h3>
    <div class="tags">${makeTags(card.tags)}</div>
    <p><strong>CP:</strong> ${card.cp}</p>
    <p><strong>効果:</strong> ${card.effect}</p>
  `;
  return div;
}

// タグHTML
function makeTags(tags) {
  return tags.map(t => `<span class="tag ${t}">${t}</span>`).join("");
}

// フィルター（OR条件）
function applyFilters() {
  const name = document.getElementById("searchName").value.trim();
  const checkedTags = [...document.querySelectorAll("#tagFilters input:checked")]
    .map(c => c.value);
  const bookmarkOnly = document.getElementById("bookmarkOnly").checked;

  const filtered = cards.filter(card => {
    const nameOK = card.name.includes(name);

    const tagOK =
      checkedTags.length === 0 ||
      checkedTags.some(t => card.tags.includes(t));

    const bookmarkOK =
      !bookmarkOnly || bookmarks.includes(card.id);

    return nameOK && tagOK && bookmarkOK;
  });

  displayCards(filtered);
}

// ブックマーク
function setupBookmarks() {
  document.querySelectorAll(".bookmark").forEach(b => {
    b.onclick = () => {
      const id = Number(b.dataset.id);
      bookmarks = bookmarks.includes(id)
        ? bookmarks.filter(x => x !== id)
        : [...bookmarks, id];
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      applyFilters();
    };
  });
}

document.getElementById("searchName").addEventListener("input", applyFilters);
document.querySelectorAll("#tagFilters input").forEach(cb =>
  cb.addEventListener("change", applyFilters)
);

document.getElementById("bookmarkOnly").addEventListener("change", applyFilters);
