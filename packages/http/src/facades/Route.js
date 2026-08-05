import {Facade} from "@ecfjs/core"; // adjust import path per monorepo aliasing

class Route extends Facade {
    static accessor() {
        return "router";
    }
}

export default Facade.create(Route);