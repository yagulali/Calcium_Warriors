let cards = [];

// JSON読み込み
fetch('cards.json')
  .then(response => response.json())
  .then(data => {
    cards = data;
    // 五十音順にソートして表示
    displayCards(sortCardsByName(cards));
  })
  .catch(error => console.error("カードデータの読み込みに失敗しました:", error));

// 五十音順ソート
function sortCardsByName(cardsArray) {
  // 日本語順に並べ替え
  return cardsArray.slice().sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

// カード表示
function displayCards(cardList) {
  const container = document.getElementById('cardContainer');
  container.innerHTML = '';

  if (cardList.length === 0) {
    container.innerHTML = '<p>条件に一致するカードはありません。</p>';
    return;
  }

  cardList.forEach(card => {
    // タグごとに <span> を作る
    const tagsHTML = card.tags.map(tag => `<span class="tag ${tag}">${tag}</span>`).join(' ');

    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.innerHTML = `
  <img src="${card.image}" alt="${card.name}">
  <h3>${card.name}</h3>
  <div class="tags">${tagsHTML}</div> <!-- 名前の下に移動 -->
  <p><strong>射程距離:</strong> ${card.range}</p>
  <p><strong>HP:</strong> ${card.hp}</p>
  <p><strong>通常攻撃:</strong> ${card.normalAttack}</p>
  <p><strong>低コストスキル (${card.lowCostSkill.cp}CP):</strong> ${card.lowCostSkill.name} - ${card.lowCostSkill.description}</p>
  <p><strong>高コストスキル (${card.highCostSkill.cp}CP):</strong> ${card.highCostSkill.name} - ${card.highCostSkill.description}</p>
  <p><strong>パッシブ:</strong> ${card.passive}</p>
`;

    container.appendChild(cardDiv);
  });
}

// 名前検索・タグ絞り込み
document.getElementById('searchName').addEventListener('input', applyFilters);
document.querySelectorAll('#tagFilters input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', applyFilters);
});

function applyFilters() {
  const nameQuery = document.getElementById('searchName').value.trim();
  const selectedTags = Array.from(document.querySelectorAll('#tagFilters input:checked')).map(cb => cb.value);

  let filtered = cards.filter(card => {
    const matchName = card.name.includes(nameQuery);
    const matchTags = selectedTags.length === 0 || selectedTags.every(tag => card.tags.includes(tag));
    return matchName && matchTags;
  });

  // フィルタ後も五十音順にソートして表示
  displayCards(sortCardsByName(filtered));
}
