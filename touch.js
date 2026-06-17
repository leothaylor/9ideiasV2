import * as THREE from 'three';

export function isTouchDevice() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}

/**
 * Adiciona uma esfera invisível maior ao redor do nó para facilitar o toque
 * em telas pequenas ("dedo gordo"). O raycaster da lib usa todo o Object3D,
 * então essa malha extra amplia a área clicável sem mudar o visual.
 */
export function addTouchHitbox(group, visibleRadius) {
  const hitRadius = visibleRadius * (isTouchDevice() ? 2.2 : 1.3);
  const hitbox = new THREE.Mesh(
    new THREE.SphereGeometry(hitRadius, 8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.userData.isHitbox = true;
  group.add(hitbox);
  return hitbox;
}
