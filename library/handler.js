import { Collection } from "discord.js";
import cmd from "./map.js";
import printInfo from "./print.js";
import chalk from "chalk";
import fs from "fs";
import { fileURLToPath } from "url";

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.cooldowns = new Collection();
    }

    async handleMessage(message) {
        if (message.author.bot) return;
        
        await printInfo(message, this.client);

        const prefix = process.env.PREFIX || '!';
        if (!message.content.startsWith(prefix)) return;

        const [cmdName, ...args] = message.content.slice(prefix.length).trim().split(/ +/);
        const command = cmd.findByNameOrAlias(cmdName.toLowerCase());
        
        if (!command) return;

        if (this.isOnCooldown(message.author.id, command)) {
            const timeLeft = this.getCooldown(message.author.id, command);
            const reply = await message.reply(`⏰ Wait ${timeLeft}s before using \`${command.name}\` again.`);
            setTimeout(() => reply.delete().catch(() => {}), 3000);
            return;
        }

        const permissionCheck = this.checkPermissions(command, message);
        if (!permissionCheck.allowed) {
            const reply = await message.reply(permissionCheck.message);
            setTimeout(() => reply.delete().catch(() => {}), 3000);
            return;
        }

        const context = {
            message,
            args,
            text: args.join(" "),
            command: cmdName,
            client: this.client,
            channel: message.channel,
            author: message.author,
            guild: message.guild,
            member: message.member
        };

        try {
            if (command.middleware) {
                await command.middleware(context);
            }

            if (command.run) {
                console.log(`🚀 ${message.author.tag} used: ${command.name}`);
                await command.run(context);
                this.setCooldown(message.author.id, command);
                console.log(`✅ ${command.name} executed\n`);
            }
        } catch (error) {
            console.error(`❌ ${command.name} error:`, error.message);
            const errorMsg = await message.reply(`❌ Error: ${error.message}`);
            setTimeout(() => errorMsg.delete().catch(() => {}), 5000);
        }
    }

    async handleSlashCommand(interaction) {
        if (!interaction.isCommand()) return;

        await this.printSlashInfo(interaction);

        const command = cmd.getSlashCommand(interaction.commandName);
        if (!command) {
            return interaction.reply({ content: "❌ Command not found!", ephemeral: true });
        }

        const permissionCheck = this.checkPermissions(command, interaction);
        if (!permissionCheck.allowed) {
            return interaction.reply({ content: permissionCheck.message, ephemeral: true });
        }

        const context = {
            interaction,
            client: this.client,
            channel: interaction.channel,
            author: interaction.user,
            guild: interaction.guild,
            member: interaction.member,
            options: interaction.options
        };

        try {
            if (command.middleware) {
                await command.middleware(context);
            }

            if (command.execute) {
                console.log(`🚀 ${interaction.user.tag} used: /${command.name}`);
                await command.execute(context);
                console.log(`✅ /${command.name} executed\n`);
            }
        } catch (error) {
            console.error(`❌ /${command.name} error:`, error.message);
            await interaction.reply({ content: `❌ Error: ${error.message}`, ephemeral: true });
        }
    }

    async printSlashInfo(interaction) {
        const chalk = (await import('chalk')).default;
        const color = this.getRandomColor(chalk);
        
        const guildInfo = interaction.guild 
            ? `${interaction.guild.name} | #${interaction.channel.name}`
            : 'DM';

        let info = `${color(`[ ${interaction.user.tag} ]`)} ${chalk.gray('→')} ${chalk.cyan(`SLASH: /${interaction.commandName}`)}\n`;
        info += `${color(`[ Server ]`)} ${chalk.gray('→')} ${chalk.cyan(guildInfo)}`;

        const options = interaction.options.data;
        if (options.length > 0) {
            const opts = options.map(opt => `${opt.name}: ${opt.value}`).join(', ');
            info += `\n${color(`[ Options ]`)} ${chalk.gray('→')} ${chalk.yellow(opts)}`;
        }

        console.log(info + '\n' + chalk.gray('─'.repeat(50)));
    }

    getRandomColor(chalk) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        return chalk.hex(colors[Math.floor(Math.random() * colors.length)]);
    }

    isOwner(id) {
        return global?.owner?.includes(id);
    }

    isBotAdmin(id) {
        return global?.admin?.includes(id);
    }

    checkPermissions(command, context) {
        const userId = context.author?.id || context.user?.id;
        const isMessage = 'reply' in context;

        if (this.isOwner(userId)) {
            return { allowed: true };
        }

        if (command.owner && !this.isOwner(userId)) {
            return { 
                allowed: false, 
                message: "❌ **Maaf khusus Ownerku** - Command ini hanya bisa digunakan oleh owner bot" 
            };
        }

        if (command.botIsAdmin && !this.isBotAdmin(userId)) {
            return { 
                allowed: false, 
                message: "❌ **Maaf khusus Bot Admin** - Command ini hanya bisa digunakan oleh bot admin" 
            };
        }
        
        if (command.permissions && context.guild && context.member) {
            const hasPerms = context.member.permissions.has(command.permissions);
            if (!hasPerms) {
                return { 
                    allowed: false, 
                    message: `❌ **Maaf khusus Admin** - Kamu membutuhkan permission: ${command.permissions.join(', ')}` 
                };
            }
        }
        
        return { allowed: true };
    }

    setCooldown(userId, command) {
        if (!command.cooldown) return;
        const key = `${userId}-${command.name}`;
        this.cooldowns.set(key, Date.now() + (command.cooldown * 1000));
        setTimeout(() => this.cooldowns.delete(key), command.cooldown * 1000);
    }

    isOnCooldown(userId, command) {
        if (!command.cooldown || this.isOwner(userId)) return false;
        const key = `${userId}-${command.name}`;
        return this.cooldowns.has(key);
    }

    getCooldown(userId, command) {
        const key = `${userId}-${command.name}`;
        const endTime = this.cooldowns.get(key);
        return Math.ceil((endTime - Date.now()) / 1000);
    }

    async registerSlashCommands(guildId = null) {
        const slashCommands = cmd.getSlashCommands();
        
        if (guildId) {
            const guild = this.client.guilds.cache.get(guildId);
            if (guild) {
                await guild.commands.set(slashCommands);
                console.log(`✅ Registered ${slashCommands.length} commands to ${guild.name}`);
            }
        } else {
            await this.client.application.commands.set(slashCommands);
            console.log(`✅ Registered ${slashCommands.length} global commands`);
        }
    }

    getStats() {
        const commands = cmd.values();
        const categories = {};
        
        commands.forEach(cmd => {
            const cat = cmd.category || 'general';
            categories[cat] = (categories[cat] || 0) + 1;
        });
        
        return {
            total: commands.length,
            categories,
            slash: cmd.getSlashCommands().length
        };
    }
}

export default CommandHandler;

  const __filename = fileURLToPath(import.meta.url);
  fs.watchFile(__filename, () => {
    fs.unwatchFile(__filename);
    console.log(chalk.redBright("🔄 Update 'library/handle.js' detected"));
  });
  