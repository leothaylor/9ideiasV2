import * as THREE from 'three';
import ForceGraph3D from '3d-force-graph';
import { Text } from 'troika-three-text';
import { CATEGORY_COLORS, STATUS_COLORS } from './data.js';
import { addTouchHitbox } from './touch.js';

const AUTO_ROTATE_IDLE_MS = 4000;

export function disposeNode(obj) {
  if (!obj) return;
  obj.traverse(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(m => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
    if (child.dispose) child.dispose();
  });
}

export function createKnowledgeGraph(container) {
  const graph = ForceGraph3D({ controlType: 'orbit' })(container)
    .backgroundColor('rgba(0,0,0,0)')
    .showNavInfo(false)
    .nodeRelSize(4.2)
    .nodeVal(n => 6 + Math.min(18, (n.label || '').length * 0.3))
    .nodeColor(n => CATEGORY_COLORS[n.category] || CATEGORY_COLORS.outra)
    .nodeLabel(n => `<div><strong>${escapeHtml(n.label)}</strong><br>${escapeHtml(n.text || '')}</div>`)
    .nodeOpacity(0.95)
    .linkColor(() => 'rgba(170,170,180,0.45)')
    .linkWidth(0.6)
    .linkCurvature(0.18)
    .nodeThreeObjectExtend(false)
    .nodeThreeObject(makeNodeObject);

  // Fog para profundidade.
  const scene = graph.scene();
  scene.fog = new THREE.FogExp2(0x0c0d10, 0.018);

  // Física: ajustar forças nativas d3-force-3d para se comportar como o protótipo.
  graph.d3Force('charge').strength(-90).distanceMax(260);
  graph.d3Force('link').distance(42).strength(0.6);

  // Auto-rotação suave quando ocioso.
  const controls = graph.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  let idleTimer = null;
  function pauseAutoRotate() {
    controls.autoRotate = false;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { controls.autoRotate = true; }, AUTO_ROTATE_IDLE_MS);
  }
  container.addEventListener('pointerdown', pauseAutoRotate);
  container.addEventListener('wheel', pauseAutoRotate, { passive: true });

  graph._pauseAutoRotate = pauseAutoRotate;
  return graph;
}

function makeNodeObject(node) {
  const group = new THREE.Group();
  const radius = 2.3 + Math.min(2.5, (node.label || '').length * 0.05);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 24, 24),
    new THREE.MeshStandardMaterial({
      color: CATEGORY_COLORS[node.category] || CATEGORY_COLORS.outra,
      roughness: 0.5,
      metalness: 0.1,
      transparent: true,
      opacity: 1,
    })
  );
  group.add(sphere);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.18, radius * 0.09, 8, 32),
    new THREE.MeshBasicMaterial({
      color: STATUS_COLORS[node.status] || STATUS_COLORS.pending,
      transparent: true,
      opacity: 0.9,
    })
  );
  ring.userData.isStatusRing = true;
  group.add(ring);

  const text = new Text();
  text.text = node.label || '';
  text.fontSize = radius * 0.62;
  text.color = 0xffffff;
  text.anchorX = 'center';
  text.anchorY = 'middle';
  text.position.set(0, radius + 1.6, 0);
  text.sync();
  group.add(text);

  addTouchHitbox(group, radius);

  group.userData.sphere = sphere;
  group.userData.ring = ring;
  group.userData.text = text;
  group.userData.baseOpacity = 1;
  return group;
}

/** Aplica modo "showcase": opacidade reduzida para nós fora do conjunto destacado. */
export function applyHighlight(graph, highlightIds) {
  graph.graphData().nodes.forEach(node => {
    const obj = node.__threeObj;
    if (!obj) return;
    const dim = highlightIds && highlightIds.size > 0 && !highlightIds.has(node.id);
    const opacity = dim ? 0.12 : 1;
    if (obj.userData.sphere) obj.userData.sphere.material.opacity = opacity;
    if (obj.userData.ring) obj.userData.ring.material.opacity = dim ? 0.08 : 0.9;
    if (obj.userData.text) obj.userData.text.fillOpacity = dim ? 0.15 : 1;
  });

  graph.linkOpacity(() => 1);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
