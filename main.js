import { Client, GatewayIntentBits, Events } from 'discord.js';
import './config.js';
import cmdRegis from './library/loader.js';
import CommandHandler from './library/handler.js';

class DiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMembers,
            ]
        });
        
        this.handler = new CommandHandler(this.client);
        this.setupEvents();
    }

    setupEvents() {
        this.client.once(Events.ClientReady, this.onReady.bind(this));
        this.client.on(Events.MessageCreate, this.handler.handleMessage.bind(this.handler));
        this.client.on(Events.InteractionCreate, this.handler.handleSlashCommand.bind(this.handler));
        
        this.client.on(Events.Error, console.error);
        this.client.on(Events.Warn, console.warn);
    }

    async onReady(client) {
        console.log(`✅ ${client.user.tag} is now online!`);
        
        // Set bot activity
        client.user.setActivity({
            name: `${process.env.PREFIX || '!'}help | ${global.botname || client.user.username}`,
            type: 3
        });

        await this.initialize();
    }

    async initialize() {
        try {
            await cmdRegis.load();
            await this.handler.registerSlashCommands();
            await cmdRegis.watch();
            
            console.log(`🤖 ${global.botname || 'Bot'} ready!`);
            console.log(`👑 Owner: ${global.ownername || 'Not set'}`);
            console.log(`🔄 Auto-reload system: ACTIVE`);
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            process.exit(1);
        }
    }

    async start() {
        const token = global.token
        
        if (!token) {
            console.error('❌ No token found in config.js or .env');
            process.exit(1);
        }

        try {
            await this.client.login(token);
        } catch (error) {
            console.error('❌ Login failed:', error.message);
            process.exit(1);
        }
    }

    async stop() {
        console.log('🛑 Stopping bot and file watcher...');
        this.client.destroy();
        process.exit(1);
    }
}

process.on('SIGINT', () => {
    console.log('\n📝 Shutting down...');
    bot.stop();
});

process.on('SIGTERM', () => {
    console.log('\n📝 Shutting down...');
    bot.stop();
});

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('💥 Unhandled Rejection:', error);
});

// Start bot
const bot = new DiscordBot();
bot.start();

export default DiscordBot;