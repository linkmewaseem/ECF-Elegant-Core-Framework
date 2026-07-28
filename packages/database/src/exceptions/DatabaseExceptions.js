import { ECFError } from "@ecf/core";

export class DatabaseException extends ECFError {
    constructor(message = "A database error occurred.", cause = null, context = {}) {
        super(message, cause, context);
        this.name = "DatabaseException";
    }
}

export class ConnectionException extends DatabaseException {
    constructor(message = "Failed to connect to database.", cause = null, context = {}) {
        super(message, cause, context);
        this.name = "ConnectionException";
    }
}

export class QueryException extends DatabaseException {
    constructor(message, sql = "", bindings = [], cause = null, context = {}) {
        super(message, cause, { ...context, sql, bindings });
        this.name = "QueryException";
        this.sql = sql;
        this.bindings = bindings;
    }
}

export class TransactionException extends DatabaseException {
    constructor(message = "Transaction error occurred.", cause = null, context = {}) {
        super(message, cause, context);
        this.name = "TransactionException";
    }
}
