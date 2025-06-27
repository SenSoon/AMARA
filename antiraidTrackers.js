const raidTrackers = {
  channelCreations: new Map(),
  channelDeletions: new Map(),
  roleCreations: new Map(),
  roleDeletions: new Map(),
  memberBans: new Map(),
  memberKicks: new Map(),
};

// Ajoute ou incrémente une action
function trackAction(type, userId) {
  if (!raidTrackers[type]) return;

  const count = raidTrackers[type].get(userId) || 0;
  raidTrackers[type].set(userId, count + 1);
}

// Récupère combien d'actions un utilisateur a effectuées
function getActionCount(type, userId) {
  return raidTrackers[type]?.get(userId) || 0;
}

// Réinitialise le compteur d’un type ou tout
function resetTracker(type = null) {
  if (type) {
    raidTrackers[type]?.clear();
  } else {
    for (const key in raidTrackers) {
      raidTrackers[key].clear();
    }
  }
}

export { trackAction, getActionCount, resetTracker };
