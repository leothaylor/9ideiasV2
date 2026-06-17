export const CATEGORY_COLORS = {
  bjj: '#c2491f',
  financeiro: '#2774c4',
  negocio: '#b3791a',
  organizacao: '#16906f',
  ferramenta: '#6f63d1',
  outra: '#888780',
};

export const CATEGORY_LABELS = {
  bjj: 'BJJ',
  financeiro: 'Financeiro',
  negocio: 'Negócio',
  organizacao: 'Organização',
  ferramenta: 'Ferramenta',
  outra: 'Outra',
};

export const STATUS_COLORS = {
  done: '#2bb673',
  progress: '#2f8fe0',
  pending: '#d0a233',
};

export const STATUS_LABELS = {
  done: 'Concluído',
  progress: 'Em andamento',
  pending: 'Pendente',
};

let nextId = 0;

export function resetIdCounter(nodes) {
  const maxId = nodes.reduce((m, n) => Math.max(m, Number(n.id) || 0), -1);
  nextId = maxId + 1;
}

export function nextNodeId() {
  return String(nextId++);
}

/** Posição com jitter próxima a uma referência (ou aleatória em esfera se não houver). */
export function jitterPosition(referenceNodes) {
  const valid = (referenceNodes || []).filter(n => n && Number.isFinite(n.x));
  if (valid.length === 0) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 6 + Math.random() * 4;
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
    };
  }
  const cx = valid.reduce((s, n) => s + n.x, 0) / valid.length;
  const cy = valid.reduce((s, n) => s + n.y, 0) / valid.length;
  const cz = valid.reduce((s, n) => s + n.z, 0) / valid.length;
  const jitter = () => (Math.random() - 0.5) * 4;
  return { x: cx + jitter(), y: cy + jitter(), z: cz + jitter() };
}

export function createNode({ label, text, category, status, tags }, referenceNodes = []) {
  const pos = jitterPosition(referenceNodes);
  return {
    id: nextNodeId(),
    label: label || 'Sem título',
    text: text || '',
    category: category || 'outra',
    status: status || 'pending',
    tags: Array.isArray(tags) ? tags : [],
    ...pos,
  };
}

export function allTags(nodes) {
  const set = new Set();
  nodes.forEach(n => (n.tags || []).forEach(t => set.add(t)));
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
