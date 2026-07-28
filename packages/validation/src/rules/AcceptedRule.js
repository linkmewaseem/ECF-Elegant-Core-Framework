import Rule from "../Rule.js";

export default class AcceptedRule extends Rule {
    validate(value) {
        const acceptedValues = [true, 1, "1", "true", "yes", "on"];
        return acceptedValues.includes(value);
    }

    message() {
        return "The :attribute field must be accepted.";
    }
}
