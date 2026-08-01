import IVirusScanner from "../contracts/IVirusScanner.js";

export class NullScanner extends IVirusScanner {
  async scan() {
    return { isInfected: false, threatName: null };
  }
}

export default NullScanner;
