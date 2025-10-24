import cmd from "../../library/map.js";

cmd.add({
  name: "example",
  alias: ["exp"],
  desc: "Example Plugin Bot Discord",
  category: "info",
  run: async ({ message }) => {
    const caption = `import cmd from "../library/cmd.js";
// Nambahin folder tag akses file kek gini
// import cmd from "../../library/cmd.js";

cmd.add({
  name: "name_command",
  alias: ["name_alias"],
  desc: "Deskripsi command",
  category: "category",
  owner: false,
  botIsAdmin: false,
  permission: false,
  run: async ({ message, client, args, text, command, client: client, channel, author, guild, member }) => {
    await message.reply("Hello World!");
  }
});`;

    await message.reply(`📋 **Example Command**\n\`\`\`javascript\n${caption}\n\`\`\``);
  }
});