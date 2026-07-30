export class WhereClause {
    constructor({ type = "basic", column, operator = "=", value = null, boolean = "AND", not = false }) {
        this.type = type;
        this.column = column;
        this.operator = operator;
        this.value = value;
        this.boolean = boolean.toUpperCase();
        this.not = Boolean(not);
    }
}

export class OrderClause {
    constructor(column, direction = "ASC") {
        this.column = column;
        this.direction = String(direction).toUpperCase() === "DESC" ? "DESC" : "ASC";
    }
}

export class JoinClause {
    constructor({ type = "INNER", table, first, operator = "=", second }) {
        this.type = String(type).toUpperCase();
        this.table = table;
        this.first = first;
        this.operator = operator;
        this.second = second;
    }
}

export class AggregateClause {
    constructor(type = "count", column = "*") {
        this.type = String(type).toLowerCase();
        this.column = column;
    }
}
