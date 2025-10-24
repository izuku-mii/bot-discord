import cmd from "../../library/map.js";
import { spawn } from "child_process";
import util from "util";
cmd.add({
    name: "exec",
    alias: ["shell", "$"],
    category: ["owner"],
    desc: "Execute shell command (owner only)",
    isOwner: true,
    async run({ message, args }) {
        const command = (args || []).join(" ").trim();
        if (!command)
            return m.reply("Masukkan command untuk dijalankan.");
        const commandParts = command.split(" ");
        const cmdName = commandParts[0];
        const cmdArgs = commandParts.slice(1);
        if (!cmdName)
            return message.reply("Invalid command.");
        const execProcess = spawn(cmdName, cmdArgs, {
            cwd: process.cwd(),
            shell: false,
            stdio: ["pipe", "pipe", "pipe"],
        });
        let stdout = "";
        let stderr = "";
        execProcess.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        execProcess.stderr.on("data", (data) => {
            stderr += data.toString();
        });
        const timeout = setTimeout(() => {
            execProcess.kill("SIGTERM");
            stderr += "\n[!] Command terminated: terlalu lama dijalankan.";
        }, 15000);
        execProcess.on("close", (code) => {
            clearTimeout(timeout);
            let output = "";
            if (code === 0 && stdout.trim()) {
                output = stdout.trim();
            }
            else if (stderr.trim()) {
                output = stderr.trim();
            }
            else {
                output = "No output.";
            }
            message.reply("```" + output + "```");
        });
        execProcess.on("error", (err) => {
            clearTimeout(timeout);
            message.reply("Error menjalankan command:\\n```" + err.message + "```");
        });
    },
});

cmd.add({
    name: "eval",
    alias: ["ev", "="],
    category: ["owner"],
    desc: "Execute JavaScript/TypeScript code (owner only)",
    usage: ".eval [code]",
    example: ".eval 2 + 2",
    isOwner: true,
    async run({ message, args }) {
        const text = args.join(" ");
        if (!text)
            return message.reply("Mana code nya woi");
        let result = "";
        if (/let|var|return|const|await/.test(text)) {
            result = `(async() => {\n${text}\n})()`;
        }
        else {
            result = text;
        }
        const execute = await eval(result);
        message.reply(util.format(execute));
    },
});