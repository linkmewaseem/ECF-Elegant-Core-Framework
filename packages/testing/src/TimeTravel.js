/**
 * Time Travel & Mock Clock Controller.
 * Freeze, travel, advance, and restore execution time cleanly.
 */
export class TimeTravel {
  static #originalDateNow = Date.now;
  static #frozenTime = null;

  /**
   * Freeze time at a specific timestamp or current time.
   * @param {Date|number|string} [targetTime]
   */
  static freeze(targetTime = null) {
    const timestamp = targetTime ? new Date(targetTime).getTime() : Date.now();
    TimeTravel.#frozenTime = timestamp;
    Date.now = () => TimeTravel.#frozenTime;
    return TimeTravel.#frozenTime;
  }

  /**
   * Travel to a specific target time.
   * @param {Date|number|string} targetTime
   */
  static travelTo(targetTime) {
    return TimeTravel.freeze(targetTime);
  }

  /**
   * Travel/advance by specified seconds.
   * @param {number} seconds
   */
  static advance(seconds) {
    if (TimeTravel.#frozenTime === null) {
      TimeTravel.freeze();
    }
    TimeTravel.#frozenTime += seconds * 1000;
    return TimeTravel.#frozenTime;
  }

  /**
   * Alias for advance(seconds).
   */
  static travel(seconds) {
    return TimeTravel.advance(seconds);
  }

  /**
   * Restore native system clock.
   */
  static restore() {
    TimeTravel.#frozenTime = null;
    Date.now = TimeTravel.#originalDateNow;
  }
}

export default TimeTravel;
