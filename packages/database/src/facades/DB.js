import { Facade } from "@ecf/core";

class DB extends Facade {
    static accessor() {
        return "db";
    }
}

export default Facade.create(DB);
