// nazoFinder Application Logic

// Global Application State
let currentDictionary = []; // Array of { word, yomi, pos }
let yomiMap = new Map();     // yomi -> Array of { word, pos }
let gaWordsList = [];        // Array of { word, yomi, before, after }
let blacklist = new Set();   // Set of excluded words (surfaces)
let activeDictionaryName = "内蔵辞書 (IPADicベース)";
let illustrableSet = new Set(); // Set of user-defined illustrable words
let nonIllustrableSet = new Set(); // Set of user-defined non-illustrable words

// Preset of illustrable words (yomi in hiragana)
const ILLUSTRABLE_PRESET = new Set([
  // 日用品・文房具
  'かさ', 'てがみ', 'はがき', 'かがみ', 'めがね', 'ほん', 'えんぴつ', 'ふでばこ', 'はさみ', 'かばん', 'さいふ',
  'かぎ', 'とけい', 'くつ', 'ふく', 'ぼうし', 'かみ', 'しんぶん', 'でんわ', 'てれび', 'かめら', 'おもちゃ',
  // 家具・家電
  'つくえ', 'いす', 'べっど', 'そふぁ', 'かびん', 'ごみばこ', 'ぽすと', 'れいぞうこ', 'ほうき',
  // 食べ物・植物
  'りんご', 'みかん', 'ばなな', 'いちご', 'すいか', 'ぶどう', 'くり', 'かき', 'なし', 'もも', 'ぱん',
  'にく', 'さかな', 'たまご', 'こめ', 'おちゃ', 'みず', 'おかし', 'あめ', 'はな', 'くさ', 'き', 'は',
  // 動物・虫
  'いぬ', 'ねこ', 'うさぎ', 'くま', 'とら', 'らいおん', 'ぞう', 'きりん', 'さる', 'うし', 'うま', 'ぶた',
  'ひつじ', 'とり', 'はと', 'からす', 'すずめ', 'わし', 'たか', 'ぺんぎん', 'かえる', 'かめ', 'へび',
  'さめ', 'くじら', 'いるか', 'たこ', 'いか', 'かに', 'あり', 'はち', 'ちょう', 'くも', 'せみ',
  // 乗り物・建物
  'くるま', 'でんしゃ', 'ばす', 'ふね', 'ひこうき', 'じてんしゃ', 'ばいく', 'いえ', 'びる', 'はし', 'とう',
  // 自然・天体
  'やま', 'かわ', 'うみ', 'そら', 'くも', 'たいよう', 'つき', 'ほし', 'あめ', 'ゆき', 'かぜ', 'いし',
  // 体の部位
  'て', 'あし', 'め', 'はな', 'くち', 'みみ', 'かみ', 'かお', 'あたま', 'は', 'つめ', 'ひげ',
  // その他よくある謎解き具象名詞
  'え', 'ちず', 'はた', 'ふうせん', 'らっぱ', 'たいこ', 'すいか', 'かみなり', 'にじ', 'たまご', 'すし',
  'てんぷら', 'あめ', 'けーき', 'くりーむ', 'ちょこれーと', 'じゅーす', 'びーる', 'わいん', 'こっぷ', 'さら',
  'おわん', 'はし', 'すぷーん', 'ふぉーく', 'ないふ', 'なべ', 'かま', 'おけ', 'たる', 'かご', 'はこ',
  'てぶくろ', 'くつした', 'ずぼん', 'すかーと', 'しゃつ', 'ねくたい', 'まふらー', 'ますく', 'うちわ',
  'せんす', 'ちょうちん', 'ろうそく', 'まっち', 'たばこ', 'はぶらし', 'せっけん', 'たおる',
  'くし', 'まくら', 'ふとん', 'もうふ', 'かーてん', 'じゅうたん', 'たたみ', 'しょうじ', 'ふすま',
  'かべ', 'まど', 'とあ', 'ねんど', 'おりがみ', 'かるた', 'とらんぷ', 'つみき', 'にんぎょう',

  // 都道府県名
  'ほっかいどう', 'あおもり', 'いわて', 'みやぎ', 'あきた', 'やまがた', 'ふくしま', 'いばらき', 'とちぎ',
  'ぐんま', 'さいたま', 'ちば', 'とうきょう', 'かながわ', 'にいがた', 'とやま', 'いしかわ', 'ふくい',
  'やまなし', 'ながの', 'ぎふ', 'しずおか', 'あいち', 'みえ', 'しが', 'きょうと', 'おおさか', 'ひょうご',
  'なら', 'わかやま', 'とっとり', 'しまね', 'おかやま', 'ひろしま', 'やまぐち', 'とくしま', 'かがわ',
  'えひめ', 'こうち', 'ふくおか', 'さが', 'ながさき', 'くまもと', 'おおいた', 'みやざき', 'かごしま', 'おきなわ',

  // 主な県庁所在地（県名と重複しない特徴的なもの）
  'さっぽろ', 'もりおか', 'せんだい', 'うつのみや', 'まえばし', 'よこはま', 'かなざわ', 'こうふ',
  'おおつ', 'こうべ', 'まつえ', 'まつやま', 'たかまつ', 'なは',

  // 有名な観光地・ランドマーク
  'ふじさん', 'きんかくじ', 'ぎんかくじ', 'きよみずでら', 'いせじんぐう', 'すかいつりー', 'とうきょうたわー',
  'かみなりもん', 'しゅりじょう', 'いつくしま', 'あまのはしだて', 'まつしま', 'しらかわごう', 'ぐんかんじま',
  'あそさん', 'さくらじま', 'どうごおんせん', 'はこね', 'にっこう', 'あさくさ', 'おだいば', 'あらしやま', 'みやじま',
  'おぜ', 'かるいざわ', 'あたみ', 'しらはま',

  // 主要な国名
  'にほん', 'あめりか', 'いぎりす', 'ふらんす', 'いたりあ', 'ちゅうごく', 'かんこく', 'えじぷと', 'ぶらじる',
  'いんど', 'ろしあ', 'どいつ', 'すぺいん', 'かなだ', 'おーすとらりあ', 'すいす',

  // 十二支（干支）で不足しているもの
  'たつ', 'りゅう', 'いのしし', 'にわとり',

  // 黄道十二星座で不足しているもの
  'おひつじ', 'てんびん', 'おとめ', 'みずがめ',

  // トランプのマーク・カード
  'すぺーど', 'はーと', 'だいや', 'くろーばー', 'じょーかー',

  // 主要な楽器
  'ぴあの', 'ばいおりん', 'ぎたー', 'どらむ', 'ふるーと',

  // スポーツ用具・球技
  'ぼーる', 'ばっと', 'らけっと', 'さっかー', 'てにす', 'やきゅう',

  // 代表的な外来語（カタカナ語）の補強
  'とまと', 'れもん', 'めろん', 'かれー', 'さらだ', 'ちーず', 'ばたー', 'こーひー', 'こーら', 'ここあ',
  'みるく', 'すーぷ', 'すとろー', 'ぐらす', 'らじお', 'のーと', 'ぺん', 'いんく', 'たくしー', 'とらっく',
  'よっと', 'ぼーと', 'ろーぷ', 'てんと', 'りゅっく', 'ばっぐ', 'どれす', 'こーと', 'ぶーつ', 'しゅーず',
  'さんだる', 'りぼん', 'とらんぺっと', 'ほいっする', 'べる', 'ごりら', 'こあら', 'ぱんだ', 'しまうま',
  'かんがるー', 'らくだ', 'こうもり', 'かめれおん', 'ふらみんご', 'だいす', 'こいん'
]);
let searchResults = [];
let currentPage = 1;
const resultsPerPage = 50;

// POS Names mapping
const POS_LABELS = {
  'N': '名詞',
  'A': '形容詞',
  'V': '動詞',
  'D': '副詞'
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadBlacklist();
  loadIllustrableState();
  loadBuiltinDictionary();
  updateRuleUI();
});

// Load the default dictionary defined in dict_data.js
function loadBuiltinDictionary() {
  showLoading("辞書データを読み込んでいます...", 0);
  
  if (typeof BUILTIN_DICTIONARY === 'undefined') {
    showErrorModal("辞書データが見つかりません。dict_data.js が正しく読み込まれているか確認してください。");
    hideLoading();
    return;
  }

  setTimeout(() => {
    try {
      const total = BUILTIN_DICTIONARY.length;
      currentDictionary = [];
      yomiMap.clear();

      const chunkSize = 25000;
      let index = 0;

      function processChunk() {
        const end = Math.min(index + chunkSize, total);
        for (let i = index; i < end; i++) {
          const [word, yomi, pos] = BUILTIN_DICTIONARY[i];
          
          // Exclude non-plain form verbs (must end with u-dan sound in hiragana)
          if (pos === 'V') {
            const lastChar = yomi.slice(-1);
            const uDan = ['う', 'く', 'ぐ', 'す', 'ず', 'つ', 'づ', 'ぬ', 'ふ', 'ぶ', 'ぷ', 'む', 'ゆ', 'る'];
            if (!uDan.includes(lastChar)) {
              continue;
            }
          }

          const entry = { word, yomi, pos };
          currentDictionary.push(entry);
          
          // Index by yomi
          if (!yomiMap.has(yomi)) {
            yomiMap.set(yomi, []);
          }
          yomiMap.get(yomi).push({ word, pos });
        }

        index = end;
        const progress = Math.round((index / total) * 100);
        updateLoadingProgress(progress);

        if (index < total) {
          setTimeout(processChunk, 0);
        } else {
          activeDictionaryName = `内蔵辞書 (IPADicベース)`;
          updateDictionaryStatus(currentDictionary.length, false);
          hideLoading();
          updateGaWordsList();
        }
      }

      processChunk();
    } catch (e) {
      console.error(e);
      showErrorModal("辞書データの初期化中にエラーが発生しました: " + e.message);
      hideLoading();
    }
  }, 50);
}

// Update the dictionary status in UI
function updateDictionaryStatus(wordCount, isCustom = false) {
  document.getElementById('dictWordCount').textContent = wordCount.toLocaleString();
  const badge = document.getElementById('dictBadge');
  badge.textContent = isCustom ? "カスタム" : "内蔵";
  if (isCustom) {
    badge.classList.add('custom');
  } else {
    badge.classList.remove('custom');
  }
  document.getElementById('dictName').textContent = activeDictionaryName;
}

// Load Blacklist from localStorage
function loadBlacklist() {
  const saved = localStorage.getItem('nazoFinder_blacklist');
  if (saved) {
    try {
      const arr = JSON.parse(saved);
      blacklist = new Set(arr);
    } catch (e) {
      console.error("Failed to parse blacklist", e);
    }
  }
  updateBlacklistCountUI();
}

// Save Blacklist to localStorage
function saveBlacklist() {
  localStorage.setItem('nazoFinder_blacklist', JSON.stringify(Array.from(blacklist)));
  updateBlacklistCountUI();
}

// Update blacklist count in main UI
function updateBlacklistCountUI() {
  const count = blacklist.size;
  document.getElementById('blacklistCount').textContent = count;
  document.getElementById('modalBlacklistCount').textContent = count;
}

// Add a word to blacklist
function addToBlacklist(word) {
  if (!word) return;
  blacklist.add(word);
  saveBlacklist();

  // Filter out any results containing this word and re-render
  searchResults = searchResults.filter(item => item.sourceWord !== word && item.destWord !== word);
  
  // Keep on same page if possible, otherwise bound it
  const maxPage = Math.max(1, Math.ceil(searchResults.length / resultsPerPage));
  if (currentPage > maxPage) {
    currentPage = maxPage;
  }
  
  renderResults();
  updateGaWordsList();
}

// Remove a word from blacklist
function removeFromBlacklist(word) {
  if (blacklist.delete(word)) {
    saveBlacklist();
    renderBlacklistChips();
    updateGaWordsList();
  }
}

// Render blacklist chips in the modal
function renderBlacklistChips() {
  const container = document.getElementById('blacklistChipsContainer');
  container.innerHTML = '';
  
  if (blacklist.size === 0) {
    container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 1rem 0;">登録されている除外ワードはありません。</div>';
    return;
  }

  blacklist.forEach(word => {
    const chip = document.createElement('span');
    chip.className = 'blacklist-chip';
    chip.innerHTML = `${word} <button onclick="removeFromBlacklist('${word}')">&times;</button>`;
    container.appendChild(chip);
  });
}

// Convert Katakana to Hiragana helper
function kataToHira(text) {
  return text.replace(/[\u30A1-\u30F6]/g, function(match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Search button click
  document.getElementById('btnSearch').addEventListener('click', performSearch);
  
  // Custom dictionary upload triggers
  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', handleFileSelect);

  // Drag & drop on the main results card
  const mainResultsCard = document.getElementById('mainResultsCard');

  mainResultsCard.addEventListener('dragover', (e) => {
    e.preventDefault();
    mainResultsCard.style.borderColor = 'var(--accent-cyan)';
    mainResultsCard.style.background = 'rgba(6, 182, 212, 0.02)';
  });

  mainResultsCard.addEventListener('dragleave', () => {
    mainResultsCard.style.borderColor = '';
    mainResultsCard.style.background = '';
  });

  mainResultsCard.addEventListener('drop', (e) => {
    e.preventDefault();
    mainResultsCard.style.borderColor = '';
    mainResultsCard.style.background = '';
    if (e.dataTransfer.files.length > 0) {
      processCustomDictionaryFile(e.dataTransfer.files[0]);
    }
  });

  // Reset dictionary button
  document.getElementById('btnResetDict').addEventListener('click', () => {
    if (confirm("辞書データを初期の内蔵辞書に戻しますか？")) {
      loadBuiltinDictionary();
    }
  });

  // Export buttons
  document.getElementById('btnCopyAll').addEventListener('click', copyResultsToClipboard);
  document.getElementById('btnExportCSV').addEventListener('click', exportResultsToCSV);

  // General Modal closes
  document.querySelectorAll('.modal-close, .btn-modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('errorModal').classList.remove('active');
      document.getElementById('helpModal').classList.remove('active');
      document.getElementById('blacklistModal').classList.remove('active');
    });
  });

  // Help button
  document.getElementById('btnShowHelp').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('active');
  });

  // Blacklist modal triggers
  document.getElementById('btnShowBlacklist').addEventListener('click', () => {
    renderBlacklistChips();
    document.getElementById('blacklistModal').classList.add('active');
  });

  // Add word to blacklist manually in modal
  document.getElementById('btnAddBlacklist').addEventListener('click', () => {
    const input = document.getElementById('inputAddBlacklist');
    const val = input.value.trim();
    if (val) {
      blacklist.add(val);
      saveBlacklist();
      renderBlacklistChips();
      input.value = '';
    }
  });

  // Handle Enter key on blacklist input
  document.getElementById('inputAddBlacklist').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btnAddBlacklist').click();
    }
  });

  // Clear all blacklist words
  document.getElementById('btnClearBlacklist').addEventListener('click', () => {
    if (confirm("除外リスト登録されているすべての単語をクリアしますか？")) {
      blacklist.clear();
      saveBlacklist();
      renderBlacklistChips();
      updateGaWordsList();
    }
  });

  // Settings export & import listeners
  document.getElementById('btnExportSettings').addEventListener('click', exportSettings);
  document.getElementById('settingsFileInput').addEventListener('change', importSettings);

  // Group homophones toggle
  document.getElementById('groupHomophones').addEventListener('change', () => {
    currentPage = 1;
    renderResults();
  });

  // Ga word assistant filters
  document.getElementById('gaSearchInput').addEventListener('input', renderGaWords);
  document.getElementById('gaFilterBeforeLen').addEventListener('change', renderGaWords);
  document.getElementById('gaFilterAfterLen').addEventListener('change', renderGaWords);
  
  // Illust only filters
  document.getElementById('filterIllustOnly').addEventListener('change', renderResults);
  document.getElementById('gaFilterIllustOnly').addEventListener('change', renderGaWords);

  // Riddle rule dropdown change
  document.getElementById('riddleRule').addEventListener('change', updateRuleUI);
}

// File Import Handler
function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    processCustomDictionaryFile(e.target.files[0]);
  }
}

// Process Custom Text Dictionary File
function processCustomDictionaryFile(file) {
  if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
    showErrorModal("テキストファイル (.txt) または CSVファイル (.csv) をアップロードしてください。");
    return;
  }

  showLoading("カスタム辞書を読み込んでいます...", 0);
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = e.target.result;
      const lines = text.split(/\r?\n/);
      
      const newDict = [];
      const newYomiMap = new Map();
      let invalidCount = 0;

      const jpRegex = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u30FC]+$/;

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
          return;
        }

        const parts = trimmed.split(',');
        let word = "";
        let yomi = "";
        let pos = "N";

        if (parts.length >= 3) {
          word = parts[0].trim();
          yomi = parts[1].trim();
          const posRaw = parts[2].trim();
          if (posRaw === '名詞' || posRaw.toUpperCase() === 'N') pos = 'N';
          else if (posRaw === '形容詞' || posRaw.toUpperCase() === 'A') pos = 'A';
          else if (posRaw === '動詞' || posRaw.toUpperCase() === 'V') pos = 'V';
          else if (posRaw === '副詞' || posRaw.toUpperCase() === 'D') pos = 'D';
          else pos = 'N';
        } else if (parts.length === 2) {
          word = parts[0].trim();
          yomi = parts[1].trim();
        } else {
          word = parts[0].trim();
          yomi = word;
        }

        yomi = kataToHira(yomi);

        if (word && yomi && jpRegex.test(word) && jpRegex.test(yomi)) {
          // Exclude non-plain form verbs (must end with u-dan sound)
          if (pos === 'V') {
            const lastChar = yomi.slice(-1);
            const uDan = ['う', 'く', 'ぐ', 'す', 'ず', 'つ', 'づ', 'ぬ', 'ふ', 'ぶ', 'ぷ', 'む', 'ゆ', 'る'];
            if (!uDan.includes(lastChar)) {
              invalidCount++;
              return;
            }
          }

          newDict.push({ word, yomi, pos });
          
          if (!newYomiMap.has(yomi)) {
            newYomiMap.set(yomi, []);
          }
          newYomiMap.get(yomi).push({ word, pos });
        } else {
          invalidCount++;
        }
      });

      if (newDict.length === 0) {
        showErrorModal("有効な単語が検出されませんでした。ファイルの文字コードはUTF-8で、形式が「表記,よみ」または「1行1単語」になっているか確認してください。");
        hideLoading();
        return;
      }

      currentDictionary = newDict;
      yomiMap = newYomiMap;
      activeDictionaryName = file.name;
      updateDictionaryStatus(currentDictionary.length, true);
      updateGaWordsList();
      
      let msg = `辞書「${file.name}」から ${newDict.length.toLocaleString()} 語を読み込みました。`;
      if (invalidCount > 0) {
        msg += `\n(記号やアルファベットを含む等、無効な形式の行が ${invalidCount} 行スキップされました)`;
      }
      alert(msg);
      hideLoading();

    } catch (err) {
      console.error(err);
      showErrorModal("ファイルの読み込み中にエラーが発生しました: " + err.message);
      hideLoading();
    }
  };

  reader.onerror = function() {
    showErrorModal("ファイルの読み込みに失敗しました。");
    hideLoading();
  };

  reader.readAsText(file, 'UTF-8');
}

// Perform Word Search
function performSearch() {
  const rule = document.getElementById('riddleRule').value;
  const charA = document.getElementById('charA').value.trim();
  const charB = document.getElementById('charB').value.trim();
  
  // Validation based on rule
  if (rule === 'replace') {
    if (!charA) {
      alert("置換前の文字（列）を入力してください。");
      return;
    }
  } else if (rule === 'tanuki') {
    if (!charA) {
      alert("消去する文字を入力してください（例：「た」）。");
      return;
    }
  } else if (rule === 'deleteNth') {
    const n = parseInt(charA);
    if (isNaN(n) || n <= 0) {
      alert("消去する位置を正の整数で入力してください（例：3文字目を消す場合は「3」）。");
      return;
    }
  }

  // Convert input strings to hiragana
  const hiraA = kataToHira(charA);
  const hiraB = kataToHira(charB);

  const minLength = parseInt(document.getElementById('minLength').value) || 1;
  const maxLength = parseInt(document.getElementById('maxLength').value) || 99;
  
  const replaceMode = document.getElementById('replaceMode').value;
  const limitPosAfter = document.getElementById('limitPosAfter').checked;

  const allowedPOS = new Set();
  if (document.getElementById('posN').checked) allowedPOS.add('N');
  if (document.getElementById('posA').checked) allowedPOS.add('A');
  if (document.getElementById('posV').checked) allowedPOS.add('V');
  if (document.getElementById('posD').checked) allowedPOS.add('D');

  if (allowedPOS.size === 0) {
    alert("検索対象の品詞を少なくとも1つ選択してください。");
    return;
  }

  showLoading("検索を実行中...", 0);

  setTimeout(() => {
    try {
      searchResults = [];
      const seenPairs = new Set();

      for (let i = 0; i < currentDictionary.length; i++) {
        const item = currentDictionary[i];
        
        // Exclude blacklist word (source)
        if (blacklist.has(item.word)) {
          continue;
        }

        // Length constraint
        const len = item.yomi.length;
        if (len < minLength || len > maxLength) {
          continue;
        }

        // Part of Speech constraint (for the source word)
        if (!allowedPOS.has(item.pos)) {
          continue;
        }

        const yomi = item.yomi;
        const variations = [];

        if (rule === 'replace') {
          if (!yomi.includes(hiraA)) continue;
          let newYomi = "";
          if (replaceMode === 'all') {
            newYomi = yomi.replaceAll(hiraA, hiraB);
          } else if (replaceMode === 'first') {
            newYomi = yomi.replace(hiraA, hiraB);
          } else if (replaceMode === 'last') {
            const idx = yomi.lastIndexOf(hiraA);
            newYomi = yomi.substring(0, idx) + hiraB + yomi.substring(idx + hiraA.length);
          }
          variations.push({ newYomi, replacedCharSrc: hiraA, replacedCharDst: hiraB });
        }
        else if (rule === 'reverse') {
          const newYomi = yomi.split('').reverse().join('');
          if (newYomi !== yomi) {
            variations.push({ newYomi, replacedCharSrc: "", replacedCharDst: "" });
          }
        }
        else if (rule === 'tanuki') {
          if (!yomi.includes(hiraA)) continue;
          const newYomi = yomi.replaceAll(hiraA, '');
          variations.push({ newYomi, replacedCharSrc: hiraA, replacedCharDst: "" });
        }
        else if (rule === 'deleteNth') {
          const n = parseInt(hiraA);
          if (yomi.length < n) continue;
          const newYomi = yomi.substring(0, n - 1) + yomi.substring(n);
          variations.push({ newYomi, replacedCharSrc: yomi[n - 1], replacedCharDst: "" });
        }
        else if (rule === 'dakuon') {
          if (hiraA) {
            if (!yomi.includes(hiraA)) continue;
            const dests = getDakuonVariations(hiraA);
            dests.forEach(d => {
              const newYomi = yomi.replaceAll(hiraA, d);
              variations.push({ newYomi, replacedCharSrc: hiraA, replacedCharDst: d });
            });
          } else {
            for (let j = 0; j < yomi.length; j++) {
              const char = yomi[j];
              const dests = getDakuonVariations(char);
              dests.forEach(d => {
                const newYomi = yomi.substring(0, j) + d + yomi.substring(j + 1);
                variations.push({ newYomi, replacedCharSrc: char, replacedCharDst: d });
              });
            }
          }
        }

        // Process generated variations
        variations.forEach(v => {
          const newYomi = v.newYomi;
          if (newYomi && newYomi !== yomi && yomiMap.has(newYomi)) {
            const destinations = yomiMap.get(newYomi);
            
            destinations.forEach(dest => {
              if (limitPosAfter && !allowedPOS.has(dest.pos)) {
                return;
              }
              if (blacklist.has(dest.word)) {
                return;
              }

              const pairKey = `${item.word}_${yomi}_${dest.word}_${newYomi}`;
              if (!seenPairs.has(pairKey)) {
                seenPairs.add(pairKey);
                searchResults.push({
                  sourceWord: item.word,
                  sourceYomi: yomi,
                  sourcePos: item.pos,
                  destWord: dest.word,
                  destYomi: newYomi,
                  destPos: dest.pos,
                  replacedCharSrc: v.replacedCharSrc,
                  replacedCharDst: v.replacedCharDst
                });
              }
            });
          }
        });
      }

      // Sort results by length, then source word yomi
      searchResults.sort((a, b) => {
        if (a.sourceYomi.length !== b.sourceYomi.length) {
          return a.sourceYomi.length - b.sourceYomi.length;
        }
        return a.sourceYomi.localeCompare(b.sourceYomi, 'ja');
      });

      currentPage = 1;
      renderResults();
      hideLoading();

    } catch (e) {
      console.error(e);
      showErrorModal("検索中にエラーが発生しました: " + e.message);
      hideLoading();
    }
  }, 50);
}

// Helper to group search results by source/destination yomi (homophones grouping)
function getGroupedResults() {
  const grouped = new Map();
  
  searchResults.forEach(item => {
    const key = `${item.sourceYomi}_${item.destYomi}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        sourceYomi: item.sourceYomi,
        destYomi: item.destYomi,
        sources: [], // Array of { word, pos }
        dests: [],   // Array of { word, pos }
        replacedCharSrc: item.replacedCharSrc,
        replacedCharDst: item.replacedCharDst
      });
    }
    const group = grouped.get(key);
    
    // Avoid duplicate words within the same yomi group
    if (!group.sources.some(s => s.word === item.sourceWord)) {
      group.sources.push({ word: item.sourceWord, pos: item.sourcePos });
    }
    if (!group.dests.some(d => d.word === item.destWord)) {
      group.dests.push({ word: item.destWord, pos: item.destPos });
    }
  });

  return Array.from(grouped.values());
}

// Render Results with pagination
function renderResults() {
  const container = document.getElementById('resultsContainer');
  const countEl = document.getElementById('resultCount');
  const actionsRow = document.getElementById('resultActions');

  const isGrouped = document.getElementById('groupHomophones').checked;
  const illustOnly = document.getElementById('filterIllustOnly').checked;

  let itemsToRender = isGrouped ? getGroupedResults() : searchResults;

  if (illustOnly) {
    if (isGrouped) {
      itemsToRender = itemsToRender.filter(group => {
        const srcHas = group.sources.some(s => isIllustrable(s.word, group.sourceYomi));
        const destHas = group.dests.some(d => isIllustrable(d.word, group.destYomi));
        return srcHas || destHas;
      });
    } else {
      itemsToRender = itemsToRender.filter(item => {
        return isIllustrable(item.sourceWord, item.sourceYomi) || isIllustrable(item.destWord, item.destYomi);
      });
    }
  }

  countEl.textContent = itemsToRender.length;

  if (itemsToRender.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>条件に一致する単語ペアが見つかりませんでした。</p>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
          置換文字や品詞フィルタ、文字数制限を緩めてみてください。
        </p>
      </div>
    `;
    actionsRow.style.display = 'none';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  actionsRow.style.display = 'flex';

  const totalPages = Math.ceil(itemsToRender.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, itemsToRender.length);
  const paginatedItems = itemsToRender.slice(startIndex, endIndex);

  let html = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>元の単語 (よみ)</th>
            <th></th>
            <th>変換後の単語 (よみ)</th>
            <th>品詞</th>
          </tr>
        </thead>
        <tbody>
  `;

  paginatedItems.forEach(item => {
    if (isGrouped) {
      const srcHtmls = item.sources.map(src => {
        const srcHighlighted = highlightChar(src.word, item.sourceYomi, item.replacedCharSrc, 'src');
        const isIllust = isIllustrable(src.word, item.sourceYomi);
        return `
          <span class="word-chip-wrapper">
            <span style="font-weight: 600; font-size: 1rem;">${srcHighlighted.word}</span>
            <button class="btn-illust-toggle ${isIllust ? 'active' : ''}" onclick="toggleIllustrable('${src.word}', '${item.sourceYomi}')" title="イラスト可能フラグをトグル">🎨</button>
            <button class="btn-exclude" onclick="addToBlacklist('${src.word}')" title="「${src.word}」を除外">🚫</button>
          </span>
        `;
      });
      const srcDisplay = srcHtmls.join('<span class="word-separator">/</span>');

      const destHtmls = item.dests.map(dest => {
        const destHighlighted = highlightChar(dest.word, item.destYomi, item.replacedCharDst, 'dst');
        const isIllust = isIllustrable(dest.word, item.destYomi);
        return `
          <span class="word-chip-wrapper">
            <span style="font-weight: 600; font-size: 1rem; color: var(--accent-cyan);">${destHighlighted.word}</span>
            <button class="btn-illust-toggle ${isIllust ? 'active' : ''}" onclick="toggleIllustrable('${dest.word}', '${item.destYomi}')" title="イラスト可能フラグをトグル">🎨</button>
            <button class="btn-exclude" onclick="addToBlacklist('${dest.word}')" title="「${dest.word}」を除外">🚫</button>
          </span>
        `;
      });
      const destDisplay = destHtmls.join('<span class="word-separator">/</span>');

      const srcPosSet = new Set(item.sources.map(s => s.pos));
      const destPosSet = new Set(item.dests.map(d => d.pos));
      
      const srcPosTags = Array.from(srcPosSet).map(pos => `<span class="pos-tag pos-${pos}">${POS_LABELS[pos]}</span>`).join(' ');
      const destPosTags = Array.from(destPosSet).map(pos => `<span class="pos-tag pos-${pos}">${POS_LABELS[pos]}</span>`).join(' ');

      html += `
        <tr>
          <td>
            <div style="display: flex; flex-direction: column; width: 100%;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem;">
                ${srcDisplay}
              </div>
              <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.15rem;">${item.sourceYomi}</div>
            </div>
          </td>
          <td style="text-align: center; vertical-align: middle;">
            <span class="arrow-icon-result">➔</span>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; width: 100%;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem;">
                ${destDisplay}
              </div>
              <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.15rem;">${item.destYomi}</div>
            </div>
          </td>
          <td style="vertical-align: middle;">
            ${srcPosTags}
            <span style="color: var(--text-muted); font-size: 0.75rem; margin: 0 0.15rem;">➔</span>
            ${destPosTags}
          </td>
        </tr>
      `;
    } else {
      const srcHighlighted = highlightChar(item.sourceWord, item.sourceYomi, item.replacedCharSrc, 'src');
      const destHighlighted = highlightChar(item.destWord, item.destYomi, item.replacedCharDst, 'dst');
      const isSrcIllust = isIllustrable(item.sourceWord, item.sourceYomi);
      const isDestIllust = isIllustrable(item.destWord, item.destYomi);

      html += `
        <tr>
          <td>
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; flex-direction: column;">
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                  <span style="font-weight: 600; font-size: 1rem;">${srcHighlighted.word}</span>
                  <button class="btn-illust-toggle ${isSrcIllust ? 'active' : ''}" onclick="toggleIllustrable('${item.sourceWord}', '${item.sourceYomi}')" title="イラスト可能フラグをトグル">🎨</button>
                </div>
                <div style="color: var(--text-secondary); font-size: 0.75rem;">${srcHighlighted.yomi}</div>
              </div>
              <button class="btn-exclude" onclick="addToBlacklist('${item.sourceWord}')" title="「${item.sourceWord}」を除外">🚫</button>
            </div>
          </td>
          <td style="text-align: center; vertical-align: middle;">
            <span class="arrow-icon-result">➔</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; flex-direction: column;">
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                  <span style="font-weight: 600; font-size: 1rem; color: var(--accent-cyan);">${destHighlighted.word}</span>
                  <button class="btn-illust-toggle ${isDestIllust ? 'active' : ''}" onclick="toggleIllustrable('${item.destWord}', '${item.destYomi}')" title="イラスト可能フラグをトグル">🎨</button>
                </div>
                <div style="color: var(--text-secondary); font-size: 0.75rem;">${destHighlighted.yomi}</div>
              </div>
              <button class="btn-exclude" onclick="addToBlacklist('${item.destWord}')" title="「${item.destWord}」を除外">🚫</button>
            </div>
          </td>
          <td style="vertical-align: middle;">
            <span class="pos-tag pos-${item.sourcePos}">${POS_LABELS[item.sourcePos]}</span>
            <span style="color: var(--text-muted); font-size: 0.75rem; margin: 0 0.15rem;">➔</span>
            <span class="pos-tag pos-${item.destPos}">${POS_LABELS[item.destPos]}</span>
          </td>
        </tr>
      `;
    }
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
  renderPagination(totalPages);
}

// Highlight the replaced character in Kanji and Hiragana (best-effort)
function highlightChar(word, yomi, charToHighlight, type) {
  if (!charToHighlight) {
    // If we replaced it with nothing (deletion), no highlight is needed
    return { word, yomi };
  }
  const cssClass = type === 'src' ? 'char-highlight' : 'char-highlight-after';
  
  const escapedChar = charToHighlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const yomiRegex = new RegExp(escapedChar, 'g');
  const highlightedYomi = yomi.replace(yomiRegex, `<span class="${cssClass}">${charToHighlight}</span>`);

  if (word === yomi) {
    return { word: highlightedYomi, yomi: highlightedYomi };
  }

  let highlightedWord = word;
  if (word.includes(charToHighlight)) {
    const wordRegex = new RegExp(escapedChar, 'g');
    highlightedWord = word.replace(wordRegex, `<span class="${cssClass}">${charToHighlight}</span>`);
  } else {
    // Look if any characters of the pattern exist (heuristic for partial matches)
    let foundAny = false;
    for (let char of charToHighlight) {
      if (word.includes(char)) {
        foundAny = true;
        break;
      }
    }
    
    if (foundAny) {
      // Highlight the entire word to show something changed
      highlightedWord = `<span style="border-bottom: 1px dashed var(--warning);" title="よみの「${charToHighlight}」が置換されました">${word}</span>`;
    } else {
      highlightedWord = `<span style="border-bottom: 1px dashed var(--text-muted);" title="よみの「${charToHighlight}」が置換されました">${word}</span>`;
    }
  }

  return { word: highlightedWord, yomi: highlightedYomi };
}

// Render pagination buttons UI
function renderPagination(totalPages) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.innerHTML = '&laquo;';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    currentPage--;
    renderResults();
  });
  paginationContainer.appendChild(prevBtn);

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderResults();
    });
    paginationContainer.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.innerHTML = '&raquo;';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    currentPage++;
    renderResults();
  });
  paginationContainer.appendChild(nextBtn);
}

// Copy results to clipboard
function copyResultsToClipboard() {
  if (searchResults.length === 0) return;

  const isGrouped = document.getElementById('groupHomophones').checked;
  let text = "元の単語(よみ) -> 変換後の単語(よみ) [品詞]\n";

  if (isGrouped) {
    const grouped = getGroupedResults();
    grouped.forEach(item => {
      const srcWordsStr = item.sources.map(s => s.word).join('/');
      const destWordsStr = item.dests.map(d => d.word).join('/');
      const srcPosStr = Array.from(new Set(item.sources.map(s => POS_LABELS[s.pos]))).join(',');
      const destPosStr = Array.from(new Set(item.dests.map(d => POS_LABELS[d.pos]))).join(',');
      text += `${srcWordsStr} (${item.sourceYomi}) -> ${destWordsStr} (${item.destYomi}) [${srcPosStr}->${destPosStr}]\n`;
    });
  } else {
    searchResults.forEach(item => {
      text += `${item.sourceWord} (${item.sourceYomi}) -> ${item.destWord} (${item.destYomi}) [${POS_LABELS[item.sourcePos]}->${POS_LABELS[item.destPos]}]\n`;
    });
  }

  navigator.clipboard.writeText(text).then(() => {
    alert("検索結果をクリップボードにコピーしました！");
  }).catch(err => {
    console.error(err);
    alert("コピーに失敗しました。");
  });
}

// Export results as CSV
function exportResultsToCSV() {
  if (searchResults.length === 0) return;

  const isGrouped = document.getElementById('groupHomophones').checked;
  let csvContent = "\uFEFF"; // UTF-8 BOM for Excel

  if (isGrouped) {
    csvContent += "元単語(まとめ),元よみ,元品詞(まとめ),変換後単語(まとめ),変換後よみ,変換後品詞(まとめ)\n";
    const grouped = getGroupedResults();
    grouped.forEach(item => {
      const srcWordsStr = item.sources.map(s => s.word).join('/');
      const destWordsStr = item.dests.map(d => d.word).join('/');
      const srcPosStr = Array.from(new Set(item.sources.map(s => POS_LABELS[s.pos]))).join('/');
      const destPosStr = Array.from(new Set(item.dests.map(d => POS_LABELS[d.pos]))).join('/');
      csvContent += `"${srcWordsStr}","${item.sourceYomi}","${srcPosStr}","${destWordsStr}","${item.destYomi}","${destPosStr}"\n`;
    });
  } else {
    csvContent += "元単語,元よみ,元品詞,変換後単語,変換後よみ,変換後品詞\n";
    searchResults.forEach(item => {
      csvContent += `"${item.sourceWord}","${item.sourceYomi}","${POS_LABELS[item.sourcePos]}","${item.destWord}","${item.destYomi}","${POS_LABELS[item.destPos]}"\n`;
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `nazoFinder_results_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Loading Spinner Helpers
function showLoading(message, progress = 0) {
  const overlay = document.getElementById('loadingOverlay');
  document.getElementById('loadingText').textContent = message;
  overlay.classList.add('active');
  updateLoadingProgress(progress);
}

function updateLoadingProgress(progress) {
  const bar = document.getElementById('loadingProgressBar');
  bar.style.width = progress + "%";
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('active');
}

// Modal dialog display helper
function showErrorModal(message) {
  const modal = document.getElementById('errorModal');
  document.getElementById('errorMessage').textContent = message;
  modal.classList.add('active');
}

// Update the list of words containing "ga"
function updateGaWordsList() {
  gaWordsList = [];
  const seenYomi = new Set();
  const gaChar = 'が';

  currentDictionary.forEach(item => {
    // Exclude blacklist
    if (blacklist.has(item.word)) return;
    
    // POS filter: Nouns are highly preferred for wordplay
    if (item.pos !== 'N') return;

    const yomi = item.yomi;
    const gaIdx = yomi.indexOf(gaChar);
    
    // "ga" must be in the middle (not first, not last)
    if (gaIdx > 0 && gaIdx < yomi.length - 1) {
      if (!seenYomi.has(yomi)) {
        seenYomi.add(yomi);
        const before = yomi.substring(0, gaIdx);
        const after = yomi.substring(gaIdx + 1);
        gaWordsList.push({
          word: item.word,
          yomi: yomi,
          before: before,
          after: after
        });
      }
    }
  });

  // Sort by length, then alphabetically
  gaWordsList.sort((a, b) => {
    if (a.yomi.length !== b.yomi.length) {
      return a.yomi.length - b.yomi.length;
    }
    return a.yomi.localeCompare(b.yomi, 'ja');
  });

  renderGaWords();
}

// Render "Ga" words to the sidebar
function renderGaWords() {
  const container = document.getElementById('gaWordsContainer');
  const countEl = document.getElementById('gaWordCount');
  
  const filterText = document.getElementById('gaSearchInput').value.trim().toLowerCase();
  const beforeLenFilter = document.getElementById('gaFilterBeforeLen').value;
  const afterLenFilter = document.getElementById('gaFilterAfterLen').value;
  const illustOnly = document.getElementById('gaFilterIllustOnly').checked;

  const filtered = gaWordsList.filter(item => {
    // Illust filter
    if (illustOnly && !isIllustrable(item.word, item.yomi)) {
      return false;
    }

    // Before length filter
    if (beforeLenFilter !== 'all') {
      const len = item.before.length;
      if (beforeLenFilter === '3') {
        if (len < 3) return false;
      } else {
        if (len !== parseInt(beforeLenFilter)) return false;
      }
    }

    // After length filter
    if (afterLenFilter !== 'all') {
      const len = item.after.length;
      if (afterLenFilter === '3') {
        if (len < 3) return false;
      } else {
        if (len !== parseInt(afterLenFilter)) return false;
      }
    }

    // Text filter
    if (filterText) {
      return item.word.toLowerCase().includes(filterText) || item.yomi.includes(filterText);
    }
    
    return true;
  });

  countEl.textContent = `${filtered.length}語`;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 1rem 0;">該当する単語はありません。</div>`;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const isIllust = isIllustrable(item.word, item.yomi);
    html += `
      <div class="ga-word-item" onclick="selectGaWord('${item.before}', '${item.after}')">
        <div class="ga-word-top">
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <span class="ga-word-main">${item.word}</span>
            <button class="btn-illust-toggle ${isIllust ? 'active' : ''}" onclick="event.stopPropagation(); toggleIllustrable('${item.word}', '${item.yomi}')" title="イラスト可能フラグをトグル">🎨</button>
          </div>
          <span class="ga-word-sub">${item.yomi}</span>
        </div>
        <div class="ga-word-formula">
          <span class="formula-part">${item.before}</span>
          <span class="formula-operator">が</span>
          <span class="formula-part">${item.after}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Select a "Ga" word and fill in the search inputs, then execute search
function selectGaWord(before, after) {
  document.getElementById('charA').value = before;
  document.getElementById('charB').value = after;
  performSearch();
}

// Check if a word is illustrable (can be drawn)
function isIllustrable(word, yomi) {
  if (nonIllustrableSet.has(word)) return false;
  if (illustrableSet.has(word)) return true;
  
  const hiraYomi = kataToHira(yomi);
  return ILLUSTRABLE_PRESET.has(hiraYomi);
}

// Toggle a word's illustrable state and persist
function toggleIllustrable(word, yomi) {
  const current = isIllustrable(word, yomi);
  if (current) {
    illustrableSet.delete(word);
    nonIllustrableSet.add(word);
  } else {
    nonIllustrableSet.delete(word);
    illustrableSet.add(word);
  }
  saveIllustrableState();
  renderResults();
  renderGaWords();
}

// Load illustrable state from localStorage
function loadIllustrableState() {
  const savedI = localStorage.getItem('nazoFinder_illustrable');
  if (savedI) {
    try { illustrableSet = new Set(JSON.parse(savedI)); } catch(e) {}
  }
  const savedNI = localStorage.getItem('nazoFinder_nonIllustrable');
  if (savedNI) {
    try { nonIllustrableSet = new Set(JSON.parse(savedNI)); } catch(e) {}
  }
}

// Save illustrable state to localStorage
function saveIllustrableState() {
  localStorage.setItem('nazoFinder_illustrable', JSON.stringify(Array.from(illustrableSet)));
  localStorage.setItem('nazoFinder_nonIllustrable', JSON.stringify(Array.from(nonIllustrableSet)));
}

// Update search inputs visibility and placeholders based on selected riddle rule
function updateRuleUI() {
  const rule = document.getElementById('riddleRule').value;
  const charAWrapper = document.getElementById('charAWrapper');
  const charBWrapper = document.getElementById('charBWrapper');
  
  const labelA = document.getElementById('labelCharA');
  const inputA = document.getElementById('charA');
  const labelB = document.getElementById('labelCharB');
  const inputB = document.getElementById('charB');
  const arrow = document.getElementById('arrowIconAB');
  const replaceModeContainer = document.getElementById('replaceModeContainer');

  // Default display states
  charAWrapper.style.display = 'inline-flex';
  charBWrapper.style.display = 'inline-flex';
  arrow.style.display = 'inline';
  replaceModeContainer.style.display = 'none';

  inputA.disabled = false;
  inputB.disabled = false;

  if (rule === 'replace') {
    labelA.textContent = "置換前:";
    inputA.placeholder = "てか";
    labelB.textContent = "置換後:";
    inputB.placeholder = "み";
    replaceModeContainer.style.display = 'inline-flex';
  } else if (rule === 'reverse') {
    charAWrapper.style.display = 'none';
    charBWrapper.style.display = 'none';
    arrow.style.display = 'none';
  } else if (rule === 'tanuki') {
    labelA.textContent = "消す文字:";
    inputA.placeholder = "た";
    charBWrapper.style.display = 'none';
    arrow.style.display = 'none';
  } else if (rule === 'deleteNth') {
    labelA.textContent = "消す位置 (n文字目):";
    inputA.placeholder = "3";
    charBWrapper.style.display = 'none';
    arrow.style.display = 'none';
  } else if (rule === 'dakuon') {
    labelA.textContent = "対象文字 (空で全て):";
    inputA.placeholder = "か";
    charBWrapper.style.display = 'none';
    arrow.style.display = 'none';
  }
}

// Return variations of dakuon (voiced) / handakuon (semi-voiced) for a character
function getDakuonVariations(char) {
  const vars = [];
  const daku = {
    'か':'が', 'き':'ぎ', 'く':'ぐ', 'け':'げ', 'こ':'ご',
    'さ':'ざ', 'し':'じ', 'す':'ず', 'せ':'ぜ', 'そ':'ぞ',
    'た':'だ', 'ち':'ぢ', 'つ':'づ', 'て':'で', 'と':'ど',
    'は':'ば', 'ひ':'び', 'ふ':'ぶ', 'へ':'べ', 'ほ':'ぼ'
  }[char];
  if (daku) vars.push(daku);

  const handaku = {
    'は':'ぱ', 'ひ':'ぴ', 'ふ':'ぷ', 'へ':'ぺ', 'ほ':'ぽ'
  }[char];
  if (handaku) vars.push(handaku);

  return vars;
}

// Export settings (blacklist & illustrable sets) as a JSON file
function exportSettings() {
  const settings = {
    blacklist: Array.from(blacklist),
    illustrable: Array.from(illustrableSet),
    nonIllustrable: Array.from(nonIllustrableSet)
  };
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `nazoFinder_settings_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import settings (blacklist & illustrable sets) from a JSON file
function importSettings(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const settings = JSON.parse(evt.target.result);

      let importedAny = false;

      // Validation and conversion to Sets
      if (settings.blacklist && Array.isArray(settings.blacklist)) {
        blacklist = new Set(settings.blacklist);
        saveBlacklist();
        importedAny = true;
      }
      if (settings.illustrable && Array.isArray(settings.illustrable)) {
        illustrableSet = new Set(settings.illustrable);
        importedAny = true;
      }
      if (settings.nonIllustrable && Array.isArray(settings.nonIllustrable)) {
        nonIllustrableSet = new Set(settings.nonIllustrable);
        importedAny = true;
      }

      if (importedAny) {
        saveIllustrableState();

        // Update UI
        renderBlacklistChips();
        updateBlacklistCountUI();
        updateGaWordsList();
        renderResults();

        alert("設定をインポートしました！");
      } else {
        alert("有効な設定データが見つかりませんでした。");
      }
    } catch (err) {
      console.error(err);
      alert("設定ファイルの読み込みに失敗しました。正しいJSONファイルか確認してください。");
    }
    // Reset file input so same file can be imported again if needed
    e.target.value = '';
  };
  reader.readAsText(file);
}
