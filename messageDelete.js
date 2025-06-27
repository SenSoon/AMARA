const snipes = new Map();

export function registerSnipe(client) {
  client.on('messageDelete', message => {
    if (message.partial || !message.content || message.author?.bot) return;

    const sniped = snipes.get(message.channel.id) || [];

    sniped.unshift({
      content: message.content,
      author: message.author.tag,
      time: Date.now()
    });

    // Limite à 10 messages
    if (sniped.length > 10) sniped.pop();

    snipes.set(message.channel.id, sniped);
  });

  client.snipes = snipes;
}
