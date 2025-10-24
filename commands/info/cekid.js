import cmd from "../../library/map.js";

cmd.add({
  name: "cekid",
  alias: ["myid", "id", "userinfo"],
  desc: "Cek ID dan info diri sendiri",
  category: "info",
  run: async ({ message, client }) => { // Tambahkan message dan client di parameter
    const user = message.author; // ganti m menjadi message
    const member = message.member;
    const guild = message.guild;

    // Format waktu untuk Discord timestamp
    const createdTimestamp = Math.floor(user.createdTimestamp / 1000);
    const joinedTimestamp = member?.joinedAt ? Math.floor(member.joinedAt.getTime() / 1000) : null;

    const userInfo = `
👤 **USER INFORMATION**

🆔 **User ID:** \`${user.id}\`
📛 **Username:** ${user.tag}
${user.displayName !== user.username ? `🏷️ **Display Name:** ${user.displayName || user.username}\n` : ''}
🎨 **Accent Color:** ${user.accentColor ? `#${user.accentColor.toString(16).toUpperCase()}` : 'Default'}
📅 **Account Created:** <t:${createdTimestamp}:D>
⏰ **Created Ago:** <t:${createdTimestamp}:R>

${guild ? `
🏠 **SERVER INFORMATION**

📛 **Server:** ${guild.name}
🆔 **Server ID:** \`${guild.id}\`
👥 **Member Count:** ${guild.memberCount.toLocaleString()}
${joinedTimestamp ? `📅 **Joined Server:** <t:${joinedTimestamp}:D>\n⏰ **Joined Ago:** <t:${joinedTimestamp}:R>` : '📅 **Joined Server:** N/A'}
${member?.nickname ? `🎭 **Nickname:** ${member.nickname}\n` : ''}
${member?.roles.cache.size > 1 ? `🎯 **Roles:** ${member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.name).join(', ') || 'None'}` : ''}
` : '💬 **DM Channel**'}

🤖 **BOT INFORMATION**

📛 **Bot Name:** ${client.user.tag}
🆔 **Bot ID:** \`${client.user.id}\`
📡 **Ping:** ${client.ws.ping}ms
⏰ **Uptime:** ${formatUptime(client.uptime)}
    `.trim();

    await message.reply(userInfo);
  }
});

// Helper function untuk format uptime
function formatUptime(ms) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor(ms / 3600000) % 24;
  const minutes = Math.floor(ms / 60000) % 60;
  const seconds = Math.floor(ms / 1000) % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}h`);
  if (hours > 0) parts.push(`${hours}j`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}d`);
  
  return parts.join(' ') || '0d';
}