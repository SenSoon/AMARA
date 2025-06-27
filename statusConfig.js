import fs from 'fs';

const CONFIG_PATH = './data/status-config.json';

export function loadStatusConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return { keywords: [], roleId: null };
  }
}

export function saveStatusConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}