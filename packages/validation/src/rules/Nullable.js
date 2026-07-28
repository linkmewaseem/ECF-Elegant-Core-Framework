import Rule from "../Rule.js";

export default class Nullable extends Rule {
    validate(value) {
        return true;
    }

    message() {
        return "";
    }
}
