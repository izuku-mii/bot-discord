import cmd from "../library/map.js";
import { Buffer } from "node:buffer";
import { AttachmentBuilder } from "discord.js";

cmd.add({
    name: "menu",
    alias: ["help", "list"],
    category: ["info"],
    desc: "Show all commands or filter by category with detailed information",
    async run({ message, args }) {
        const commands = cmd.values();

        // Kirim sebagai teks biasa atau file .txt kalau terlalu panjang
        const sendSmart = async (text) => {
            if (text.length > 1800) {
                const buffer = Buffer.from(text, "utf-8");
                const file = new AttachmentBuilder(buffer, { name: "menu.txt" });
                return message.reply({
                    content: "📄 The menu is too long, here’s the full list:",
                    files: [file],
                });
            } else {
                return message.reply(text);
            }
        };

        // Jika user pakai .menu <kategori>
        if (args.length > 0) {
            const targetCategory = args[0].toLowerCase();
            const filteredCommands = commands.filter((cmd) => {
                if (!cmd.category) return false;
                const cats = Array.isArray(cmd.category)
                    ? cmd.category
                    : [cmd.category];
                return cats.map((c) => c.toLowerCase()).includes(targetCategory);
            });

            if (filteredCommands.length === 0) {
                return message.reply(`No commands found in category: ${targetCategory}`);
            }

            const categoryCommands = filteredCommands
                .map((cmd) => {
                    const aliases = cmd.alias
                        ? `\n🏷️ *Aliases:* ${cmd.alias.join(", ")}`
                        : "";
                    const usage = cmd.usage ? `\n📋 *Usage:* ${cmd.usage}` : "";
                    const example = cmd.example ? `\n💡 *Example:* ${cmd.example}` : "";
                    return `• *${cmd.name}*\n📝 ${
                        cmd.desc || "No description"
                    }${usage}${example}${aliases}`;
                })
                .join("\n\n");

            const response = `*📁 ${targetCategory.toUpperCase()} Commands*\n\n${categoryCommands}\n\nTotal: ${filteredCommands.length} command(s)`;
            return sendSmart(response);
        }

        // Jika tanpa argumen: tampilkan semua kategori
        const commandsByCategory = {};
        for (const command of commands) {
            const categories = Array.isArray(command.category)
                ? command.category
                : command.category
                ? [command.category]
                : ["uncategorized"];

            for (const cat of categories) {
                if (!commandsByCategory[cat]) commandsByCategory[cat] = [];
                commandsByCategory[cat].push(command);
            }
        }

        let menuText = "*🤖 BOT DISCORD COMMAND MENU*\n\n";
        const categories = Object.keys(commandsByCategory).sort();

        for (const category of categories) {
            const categoryCommands = commandsByCategory[category];
            menuText += `*📁 ${category.toUpperCase()} (${categoryCommands.length})*\n`;
            for (const command of categoryCommands) {
                const aliases = command.alias
                    ? ` | ${command.alias.join(", ")}`
                    : "";
                const usage = command.usage ? ` | 📋 ${command.usage}` : "";
                menuText += `  • *${command.name}*${aliases}${usage}\n    📝 ${
                    command.desc || "No description"
                }\n`;
            }
            menuText += "\n";
        }

        menuText += `*💡 Usage:* To see commands in a specific category, use: .menu [category]\n`;
        menuText += `*📋 Example:* .menu info\n`;
        menuText += `\n*📊 Total Commands:* ${commands.length}`;

        await sendSmart(menuText);
    },
});