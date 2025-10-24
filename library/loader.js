import { readdirSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { pathToFileURL } from "url";
import cmd from "./map.js";
import chokidar from "chokidar";

class CmdRegis {
    constructor(dir) {
        this.directory = resolve(dir);
        this.isWatching = false;
    }

    async scann(dir = this.directory, result = []) {
        const files = readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
            const fullPath = join(dir, file.name);
            
            if (file.isDirectory()) {
                await this.scann(fullPath, result);
            } else if (file.isFile() && (file.name.endsWith(".ts") || file.name.endsWith(".js"))) {
                result.push(fullPath);
            }
        }
        return result;
    }

    async load() {
        if (!existsSync(this.directory)) {
            console.log(`Creating command directory: ${this.directory}`);
            mkdirSync(this.directory, { recursive: true });
            return;
        }

        cmd.reset();
        const files = await this.scann();
        let loadedCount = 0;

        for (let file of files) {
            try {
                if (!existsSync(file)) {
                    console.error(`Command file does not exist: ${file}`);
                    continue;
                }

                const fileUrl = pathToFileURL(file).href + `?t=${Date.now()}`;
                await import(fileUrl);
                loadedCount++;
            } catch (e) {
                console.error(`Error loading command from ${file}:`, e.message);
            }
        }

        console.log(`✅ Successfully loaded ${loadedCount} commands! Total: ${cmd.size()}`);
    }

    async watch() {
        if (this.isWatching) return;
        
        if (!existsSync(this.directory)) {
            console.log(`Creating command directory: ${this.directory}`);
            mkdirSync(this.directory, { recursive: true });
        }

        console.log(`👀 Watching command directory: ${this.directory}`);
        this.isWatching = true;

        chokidar
            .watch(this.directory, { 
                ignoreInitial: true,
                ignored: /(^|[\/\\])\../
            })
            .on("all", async (event, path) => {
                if (["add", "change", "unlink"].includes(event)) {
                    console.log(`🔄 File ${event}: ${path}`);
                    await this.reloadCommands();
                }
            })
            .on("error", (error) => {
                console.error(`❌ Watcher error:`, error);
            });
    }

    async reloadCommands() {
        try {
            await this.load();
            console.log(`✅ Commands reloaded! Total: ${cmd.size()}`);
        } catch (error) {
            console.error(`❌ Failed to reload commands:`, error);
        }
    }
}

export default new CmdRegis("./commands");