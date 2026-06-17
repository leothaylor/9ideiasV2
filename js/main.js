import { createKnowledgeGraph, disposeNode, applyHighlight } from './graph.js';
import { createNode, resetIdCounter } from './data.js';
import { exportGraphData, parseJsonImport, parseMarkdownImport, mergeGraphData } from './io.js';
import {
  renderLegend, renderTagList, setupAddDialog, setupImportFlow,
  setupExportButton, setupResetButton, setupMobilePanelToggle,
} from './ui.js';

const container = document.getElementById('canvas-box');
const emptyHint = document.getElementById('empty-hint');
const activeTags = new Set();

let graph = createKnowledgeGraph(container);
let currentData = { nodes: [], links: [] };

renderLegend();
setupMobilePanelToggle();

async function loadInitialData() {
  try {
    const res = await fetch('data/exemplo.json');
    if (!res.ok) throw new Error('sem dataset de exemplo');
    const json = await res.json();
    setGraphData({ nodes: json.nodes, links: json.links });
  } catch (err) {
    console.error('Falha ao carregar dataset de exemplo:', err);
    setGraphData({ nodes: [], links: [] });
  }
}

function setGraphData(data) {
  // Limpa objetos three customizados dos nós antigos antes de substituir.
  (currentData.nodes || []).forEach(n => { if (n.__threeObj) disposeNode(n.__threeObj); });
  currentData = data;
  resetIdCounter(data.nodes);
  graph.graphData(data);
  emptyHint.hidden = data.nodes.length > 0;
  refreshTagList();
}

function refreshTagList() {
  renderTagList(currentData.nodes, activeTags, toggleTag);
  applyShowcase();
}

function toggleTag(tag) {
  if (activeTags.has(tag)) activeTags.delete(tag);
  else activeTags.add(tag);
  refreshTagList();
}

function applyShowcase() {
  if (activeTags.size === 0) {
    applyHighlight(graph, new Set());
    return;
  }
  const highlightIds = new Set(
    currentData.nodes
      .filter(n => (n.tags || []).some(t => activeTags.has(t)))
      .map(n => n.id)
  );
  applyHighlight(graph, highlightIds);
}

// Adicionar ideia manualmente.
setupAddDialog(formData => {
  const referenceNodes = []; // sem conexões pré-definidas no momento da criação manual
  const node = createNode(formData, referenceNodes);
  currentData.nodes.push(node);
  graph.graphData(currentData);
  refreshTagList();
});

// Exportar / Importar.
setupExportButton(() => exportGraphData(graph.graphData()));

setupImportFlow({
  onParseFile: (filename, text) => {
    if (filename.toLowerCase().endsWith('.json')) return parseJsonImport(text);
    return parseMarkdownImport(text);
  },
  onMerge: parsed => setGraphData(mergeGraphData(currentData, parsed, 'merge')),
  onReplace: parsed => setGraphData(mergeGraphData(currentData, parsed, 'replace')),
});

// Resetar física.
setupResetButton(() => {
  if (typeof graph.d3ReheatSimulation === 'function') graph.d3ReheatSimulation();
});

window.addEventListener('resize', () => {
  graph.width(container.clientWidth).height(container.clientHeight);
});

loadInitialData();
