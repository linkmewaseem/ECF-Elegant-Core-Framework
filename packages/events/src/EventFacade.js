import { Facade } from "@ecf/core";

export class EventFacade extends Facade {
  static getFacadeAccessor() {
    return "events";
  }
}

export const Event = EventFacade;
export default EventFacade;
