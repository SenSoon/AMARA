import fs from 'fs';

const BACKUP_PATH = './data/backup.json';

export async function backupGuild(guild) {
  const data = {
    channels: guild.channels.cache.map(c => ({
      name: c.name,
      type: c.type,
      parent: c.parentId,
      position: c.rawPosition
    })),
    roles: guild.roles.cache
      .filter(r => r.managed === false && r.name !== '@everyone')
      .map(r => ({
        name: r.name,
        color: r.color,
        permissions: r.permissions.bitfield,
        position: r.position
      }))
  };

  fs.writeFileSync(BACKUP_PATH, JSON.stringify(data, null, 2));
}

export async function restoreGuild(guild) {
  if (!fs.existsSync(BACKUP_PATH)) return;

  const data = JSON.parse(fs.readFileSync(BACKUP_PATH));

  for (const role of data.roles) {
    await guild.roles.create({
      name: role.name,
      color: role.color,
      permissions: BigInt(role.permissions),
      position: role.position
    });
  }

  for (const chan of data.channels) {
    await guild.channels.create({
      name: chan.name,
      type: chan.type,
      parent: chan.parent,
      position: chan.position
    });
  }
}
