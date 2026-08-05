import { Facade } from "@ecfjs/core";

class SchemaFacade extends Facade {
    static accessor() {
        return "db.schema";
    }
}

export default Facade.create(SchemaFacade);
