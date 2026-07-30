export default class ColumnDefinition {
    constructor(type, name, parameters = {}) {
        this.type = type;
        this.name = name;
        this.parameters = parameters;
        this.options = {};
        this.attributes = {
            nullable: false,
            default: null,
            unsigned: false,
            unique: false,
            uniqueName: null,
            primary: false,
            autoIncrement: false,
            comment: null,
            after: null,
            first: false,
            charset: null,
            collation: null,
            useCurrent: false,
            useCurrentOnUpdate: false,
            index: false,
            indexName: null
        };
    }

    get(key, defaultValue = null) {
        return this.attributes[key] !== undefined ? this.attributes[key] : defaultValue;
    }

    set(key, value) {
        this.attributes[key] = value;
        return this;
    }

    option(key, value = true) {
        this.options[key] = value;
        return this;
    }

    getOption(key, defaultValue = null) {
        return this.options[key] !== undefined ? this.options[key] : defaultValue;
    }

    nullable(value = true) {
        this.attributes.nullable = Boolean(value);
        return this;
    }

    notNull() {
        return this.nullable(false);
    }

    notNullable() {
        return this.nullable(false);
    }

    default(value) {
        this.attributes.default = value;
        return this;
    }

    unsigned(value = true) {
        this.attributes.unsigned = Boolean(value);
        return this;
    }

    unique(indexName = null) {
        this.attributes.unique = true;
        if (indexName) {
            this.attributes.uniqueName = indexName;
        }
        return this;
    }

    primary(value = true) {
        this.attributes.primary = Boolean(value);
        return this;
    }

    autoIncrement(value = true) {
        this.attributes.autoIncrement = Boolean(value);
        return this;
    }

    comment(commentText) {
        this.attributes.comment = commentText;
        return this;
    }

    after(columnName) {
        this.attributes.after = columnName;
        return this;
    }

    first(value = true) {
        this.attributes.first = Boolean(value);
        return this;
    }

    charset(charset) {
        this.attributes.charset = charset;
        return this;
    }

    collation(collation) {
        this.attributes.collation = collation;
        return this;
    }

    useCurrent() {
        this.attributes.useCurrent = true;
        return this;
    }

    useCurrentOnUpdate() {
        this.attributes.useCurrentOnUpdate = true;
        return this;
    }

    index(indexName = null) {
        this.attributes.index = true;
        if (indexName) {
            this.attributes.indexName = indexName;
        }
        return this;
    }
}
