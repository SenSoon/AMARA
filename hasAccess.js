console.log("✅ hasAccess.js chargé");
import fs from 'fs';

export function hasAccess(message, requiredPermission = null) {
  // ✅ Vérification de base
  if (!message || !message.author || !message.member) return false;

  const userId = message.author.id;
  const isOwner = userId === process.env.OWNER_ID;

  let whitelist = [];
  try {
    const config = JSON.parse(fs.readFileSync('./data/antiraid-config.json', 'utf-8'));
    whitelist = config.whitelist || [];
  } catch {
    whitelist = [];
  }

  const isWhitelisted = whitelist.includes(userId);
  const hasPerm = requiredPermission ? message.member.permissions.has(requiredPermission) : true;

  return isOwner || isWhitelisted || hasPerm;
}

export default hasAccess;

