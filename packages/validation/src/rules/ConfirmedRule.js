import Rule from "../Rule.js";

export default class ConfirmedRule extends Rule {
    validate(value, field, data = {}) {
        if (value === undefined || value === null || value === "") return true;
        const confirmationField = `${field}_confirmation`;
        const confirmationValue = data[confirmationField];
        return value === confirmationValue;
    }

    message() {
        return "The :attribute field confirmation does not match.";
    }
}
