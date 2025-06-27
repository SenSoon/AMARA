import fs from 'fs';
import path from 'path';

const logPath = path.resolve('./data/modlog.json');

function ensureDataFile() {
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, '{}');
}

export function addWarning(guildId, userId, modId, reason) {
  ensureDataFile();
  const raw = fs.readFileSync(logPath, 'utf8');
  const data = JSON.parse(raw);

  if (!data[userId]) data[userId] = [];

  data[userId].push({
    type: 'warn',
    reason,
    by: modId,
    guild: guildId,
    date: new Date().toISOString()
  });

  fs.writeFileSync(logPath, JSON.stringify(data, null, 2));
}

export function getWarnings(userId) {
  ensureDataFile();
  const raw = fs.readFileSync(logPath, 'utf8');
  const data = JSON.parse(raw);
  return data[userId] || [];
}
