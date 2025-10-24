class CmdMap {
    constructor() {
        this.commands = [];
        this.slashCommands = new Map();
    }
    
    values() {
        return this.commands;
    }
    
    add(content) {
        this.commands.push(content);
        if (content.slash) {
            this.slashCommands.set(content.name, content.slash);
        }
    }
    
    reset() {
        this.commands = [];
        this.slashCommands.clear();
    }
    
    size() {
        return this.commands.length;
    }
    
    findByNameOrAlias(name) {
        return this.commands.find(cmd => 
            cmd.name?.toLowerCase() === name.toLowerCase() ||
            cmd.alias?.some(alias => alias.toLowerCase() === name.toLowerCase())
        );
    }
    
    getSlashCommands() {
        return Array.from(this.slashCommands.values());
    }
    
    getSlashCommand(name) {
        return this.slashCommands.get(name);
    }
}

export default new CmdMap();