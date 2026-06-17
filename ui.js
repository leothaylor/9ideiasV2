import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS, allTags } from './data.js';

export function renderLegend() {
  const legend = document.getElementById('legend');
  legend.innerHTML = Object.keys(CATEGORY_LABELS).map(cat =>
    `<span><span class="legend-dot" style="background:${CATEGORY_COLORS[cat]}"></span>${CATEGORY_LABELS[cat]}</span>`
  ).join('');

  const legendStatus = document.getElementById('legend-status');
  legendStatus.innerHTML = Object.keys(STATUS_LABELS).map(st =>
    `<span><span class="legend-dot" style="background:${STATUS_COLORS[st]}"></span>${STATUS_LABELS[st]}</span>`
  ).join('');
}

export function renderTagList(nodes, activeTags, onToggleTag) {
  const tagList = document.getElementById('tag-list');
  const tags = allTags(nodes);
  if (tags.length === 0) {
    tagList.innerHTML = '<span style="font-size:12px;color:var(--text-tertiary)">Sem tags ainda</span>';
    return;
  }
  tagList.innerHTML = '';
  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-chip' + (activeTags.has(tag) ? ' active' : '');
    btn.textContent = tag;
    btn.addEventListener('click', () => onToggleTag(tag));
    tagList.appendChild(btn);
  });
}

export function setupAddDialog(onAdd) {
  const dialog = document.getElementById('dialog-add');
  const form = document.getElementById('form-add');

  document.getElementById('btn-add').addEventListener('click', () => {
    form.reset();
    dialog.showModal();
  });
  document.getElementById('btn-add-cancel').addEventListener('click', () => dialog.close());

  form.addEventListener('submit', e => {
    e.preventDefault();
    const label = document.getElementById('add-label').value.trim();
    if (!label) return;
    const text = document.getElementById('add-text').value.trim();
    const category = document.getElementById('add-category').value;
    const status = document.getElementById('add-status').value;
    const tags = document.getElementById('add-tags').value
      .split(',').map(t => t.trim()).filter(Boolean);
    onAdd({ label, text, category, status, tags });
    dialog.close();
  });
}

export function setupImportFlow({ onParseFile, onMerge, onReplace }) {
  const fileInput = document.getElementById('file-input');
  const dialog = document.getElementById('dialog-import-mode');
  let pendingParsed = null;

  document.getElementById('btn-import').addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      pendingParsed = onParseFile(file.name, text);
      dialog.showModal();
    } catch (err) {
      alert('Não foi possível ler o arquivo: ' + err.message);
    }
    fileInput.value = '';
  });

  document.getElementById('btn-import-merge').addEventListener('click', () => {
    if (pendingParsed) onMerge(pendingParsed);
    dialog.close();
  });
  document.getElementById('btn-import-replace').addEventListener('click', () => {
    if (pendingParsed) onReplace(pendingParsed);
    dialog.close();
  });
  document.getElementById('btn-import-cancel').addEventListener('click', () => dialog.close());
}

export function setupExportButton(onExport) {
  document.getElementById('btn-export').addEventListener('click', onExport);
}

export function setupResetButton(onReset) {
  document.getElementById('btn-reset').addEventListener('click', onReset);
}

export function setupMobilePanelToggle() {
  const sidePanel = document.getElementById('side-panel');
  document.getElementById('btn-filters').addEventListener('click', () => {
    sidePanel.classList.toggle('open');
  });
}
