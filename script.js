let cards = [];
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

// =======================
// JSON読み込み
// =======================
fetch("./cards.json")
  .then(res => res.json())
  .then(data => {
    cards = data;
    applyFilters();
  });

// =======================
// 五十音順（キャラのみ）
// =======================
function sortByName(list) {
  return list.slice().sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

// =======================
// 表示
// =======================
function displayCards(list) {
  const charBox = document.getElementById("characterContainer");
  const itemBox = document.getElementById("itemContainer");

  charBox.innerHTML = "";
  itemBox.innerHTML = "";

  const characters = sortByName(list.filter(c => c.type === "character"));
  const items = list.filter(c => c.type === "item");

  characters.forEach(card => charBox.appendChild(createCharacterCard(card)));
  items.forEach(card => itemBox.appendChild(createItemCard(card)));

  setupBookmarks();

  // ★ 解像度監視（毎回再登録）
  document.querySelectorAll(".card-image").forEach(img => {
    imageObserver.observe(img);
  });
}

// =======================
// キャラクターカード
// =======================
function createCharacterCard(card) {
  const div = document.createElement("div");
  div.className = "card";

  const fileName = card.image.split("/").pop(); // ★重要

  const lowSkills  = (card.skills || []).filter(s => s.tier === "low");
  const highSkills = (card.skills || []).filter(s => s.tier === "high");

  div.innerHTML = `
    <div class="bookmark ${bookmarks.includes(card.id) ? "active" : ""}" data-id="${card.id}">★</div>

    <img
      src="low_images/${fileName}"
      data-low="low_images/${fileName}"
      data-high="images/${fileName}"
      class="card-image"
      alt="${card.name}"
    >

    <h3>${card.name}</h3>
    <div class="tags">${makeTags(card.tags)}</div>

    <p>RANGE: <span class="dmg-number">${card.stats.range}</span></p>
    <p>HP: <span class="dmg-number">${card.stats.hp}</span></p>

    <p>
      通常攻撃:
      <span class="skill-name">【${card.attacks.normal.name}】</span>
      <span class="dmg-label"> DMG.</span><span class="dmg-number">${card.attacks.normal.damage}</span>
    </p>

    ${renderSkillBlock("低コストスキル", lowSkills)}
    ${renderSkillBlock("高コストスキル", highSkills)}
    ${makePassive(card.passive)}
  `;

  return div;
}

// =======================
// アイテムカード（★同じ構造）
// =======================
function createItemCard(card) {
  const div = document.createElement("div");
  div.className = "card item";

  const fileName = card.image.split("/").pop(); // ★重要

  div.innerHTML = `
    <div class="bookmark ${bookmarks.includes(card.id) ? "active" : ""}" data-id="${card.id}">★</div>

    <img
      src="low_images/${fileName}"
      data-low="low_images/${fileName}"
      data-high="images/${fileName}"
      class="card-image"
      alt="${card.name}"
    >

    <h3>${card.name}</h3>
    <div class="tags">${makeTags(card.tags)}</div>

    <p>CP <span class="dmg-number">${card.cp}</span></p>
    <p class="skill-description">${card.effect}</p>
  `;

  return div;
}

// =======================
// スキルブロック
// =======================
function renderSkillBlock(title, skills) {
  if (!skills || skills.length === 0) {
    return `<p>${title}: なし</p>`;
  }

  return skills.map(skill => `
    <p>
      ${title}（CP <span class="dmg-number">${skill.cp}</span>）:
      <span class="skill-name">【${skill.name}】</span>
    </p>
    <p class="skill-description">${skill.description}</p>
  `).join("");
}

// =======================
// パッシブ
// =======================
function makePassive(passive) {
  if (!passive) {
    return `<p>パッシブスキル: なし</p>`;
  }

  return `
    <p>
      パッシブスキル:
      <span class="skill-name">【${passive.name}】</span>
    </p>
    <p class="passive-description">${passive.description}</p>
  `;
}

// =======================
// タグ
// =======================
function makeTags(tags = []) {
  return tags.map(t => `<span class="tag ${t}">${t}</span>`).join("");
}

// =======================
// フィルター
// =======================
function applyFilters() {
  const name = document.getElementById("searchName").value.trim();
  const checkedTags = [...document.querySelectorAll("#tagFilters input:checked")]
    .map(c => c.value);
  const bookmarkOnly = document.getElementById("bookmarkOnly").checked;

  const filtered = cards.filter(card => {
    const nameOK = card.name.includes(name);
    const tagOK = checkedTags.length === 0 || checkedTags.some(t => card.tags.includes(t));
    const bookmarkOK = !bookmarkOnly || bookmarks.includes(card.id);
    return nameOK && tagOK && bookmarkOK;
  });

  displayCards(filtered);
}

// =======================
// ブックマーク
// =======================
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

// =======================
// イベント
// =======================
document.getElementById("searchName").addEventListener("input", applyFilters);
document.querySelectorAll("#tagFilters input").forEach(cb =>
  cb.addEventListener("change", applyFilters)
);
document.getElementById("bookmarkOnly").addEventListener("change", applyFilters);

// =======================
// 解像度管理（★画面内⇄画面外）
// =======================
const imageObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const img = entry.target;

    if (entry.isIntersecting) {
      // 画面内 → 高解像度
      if (img.dataset.high && img.src !== img.dataset.high) {
        img.src = img.dataset.high;
      }
    } else {
      // 画面外 → 低解像度に戻す
      if (img.dataset.low && img.src !== img.dataset.low) {
        img.src = img.dataset.low;
      }
    }
  });
}, {
  rootMargin: "100px",
  threshold: 0.1
});
