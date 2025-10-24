// print.js
import chalk from "chalk";
import fs from "fs";
import { fileURLToPath } from "url";

const hairColors = [
  "#C0C0C0", "#A9A9A9",
  "#064420", "#16A085", "#013220", 
  "#E0FFFF", "#B0E0E6"
];

function pickRandomHairColor() {
  const randomHex = hairColors[Math.floor(Math.random() * hairColors.length)];
  return chalk.hex(randomHex);
}

export default async function printInfo(m, client = { user: {} }) {
  const colorh = pickRandomHairColor();
  const isDM = !m.guild;
  const isGroup = m.guild && m.channel?.isTextBased();
  const senderName = m.author?.tag || "Unknown";
  const serverName = isGroup ? m.guild.name : "DM";
  const channelName = isGroup ? `#${m.channel.name}` : "Direct Message";
  const messageText = m.content || "[No Content]";
  const commandUsed = m.content.split(' ')[0] || "";

  let info = `${colorh(`[ ${senderName} ]`)} ${chalk.gray.bold("→")} ${chalk.cyan.bold(messageText)}\n`;
  info += `${colorh(`[ ${isGroup ? "Server" : "DM"} ]`)} ${chalk.gray.bold("→")} ${chalk.cyan.bold(serverName)} ${chalk.gray("|")} ${chalk.cyan(channelName)}`;
  
  if (commandUsed) {
    info += `\n${colorh(`[ Command ]`)} ${chalk.gray.bold("→")} ${chalk.yellow.bold(commandUsed)}`;
  }

  console.log(info + "\n" + chalk.gray("─".repeat(50)));
}


  const __filename = fileURLToPath(import.meta.url);
  fs.watchFile(__filename, () => {
    fs.unwatchFile(__filename);
    console.log(chalk.redBright("🔄 Update 'library/print.js' detected"));
  });
