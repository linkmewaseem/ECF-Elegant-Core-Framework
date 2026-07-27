export default class AttributeBag {
    constructor(attributes = {}) {
        this.attributes = { ...attributes };
    }

    get(key, defaultValue = null) {
        return key in this.attributes ? this.attributes[key] : defaultValue;
    }

    has(key) {
        return key in this.attributes;
    }

    merge(defaults = {}) {
        const merged = { ...defaults };
        for (const [key, value] of Object.entries(this.attributes)) {
            if (key === "class" && merged.class) {
                merged.class = `${merged.class} ${value}`.trim();
            } else if (key === "style" && merged.style) {
                merged.style = `${merged.style}; ${value}`.trim();
            } else {
                merged[key] = value;
            }
        }
        return AttributeBag.create(merged);
    }

    toString() {
        const parts = [];
        for (const [key, value] of Object.entries(this.attributes)) {
            if (value === true) {
                parts.push(key);
            } else if (value !== false && value !== null && value !== undefined) {
                parts.push(`${key}="${this.escapeQuote(String(value))}"`);
            }
        }
        return parts.join(" ");
    }

    escapeQuote(str) {
        return str.replace(/"/g, "&quot;");
    }

    static create(attributes = {}) {
        const bag = new AttributeBag(attributes);
        return new Proxy(bag, {
            get(target, prop, receiver) {
                if (typeof prop === "symbol" || prop in target || typeof target[prop] === "function") {
                    const value = Reflect.get(target, prop, receiver);
                    if (typeof value === "function") {
                        return value.bind(target);
                    }
                    return value;
                }
                return target.get(prop);
            }
        });
    }
}
