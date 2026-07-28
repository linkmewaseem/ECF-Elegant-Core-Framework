import Rule from "../Rule.js";
import { isIP, isIPv4, isIPv6 } from "node:net";

export default class IpRule extends Rule {
    constructor(version = "any") {
        super();
        this.version = version;
    }

    validate(value, field, data = {}, params = []) {
        if (value === undefined || value === null || value === "") return true;
        if (typeof value !== "string") return false;

        const version = (params[0] || this.version).toLowerCase();
        if (version === "v4" || version === "ipv4") return isIPv4(value);
        if (version === "v6" || version === "ipv6") return isIPv6(value);
        return isIP(value) !== 0;
    }

    message() {
        return "The :attribute field must be a valid IP address.";
    }
}
