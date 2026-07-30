import Grammar from "../Grammar.js";

export default class MySQLGrammar extends Grammar {
    wrapValue(value) {
        if (value === "*") return "*";
        return `\`${value.replace(/`/g, "``")}\``;
    }
}
