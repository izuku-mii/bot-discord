// Setup Owner Name or Bot Name
import chalk from "chalk";
import fs from "fs";
import { fileURLToPath } from "url";

global.token = "your_token"
global.botname = "Kashiwada Multi Device"
global.ownername = "Oota"
global.owner = ["112830574083"]

global.apikey = {
  izumi: "https://api.ootaizumi.web.id"
}

  const __filename = fileURLToPath(import.meta.url);
  fs.watchFile(__filename, () => {
    fs.unwatchFile(__filename);
    console.log(chalk.redBright("🔄 Update 'config.js' detected"));
  });
  