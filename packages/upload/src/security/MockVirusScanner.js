import IVirusScanner from "../contracts/IVirusScanner.js";

const EICAR_TEST_STRING = "EICAR-STANDARD-ANTIVIRUS-TEST-FILE";

export class MockVirusScanner extends IVirusScanner {
  constructor(infectedSignatures = []) {
    super();
    this.infectedSignatures = new Set([EICAR_TEST_STRING, ...infectedSignatures]);
  }

  async scan(buffer, fileName = "") {
    const text = buffer.toString("utf8");

    for (const signature of this.infectedSignatures) {
      if (text.includes(signature) || fileName.includes("EICAR")) {
        return { isInfected: true, threatName: "Win32.EICAR.TestFile" };
      }
    }
    return { isInfected: false, threatName: null };
  }
}

export default MockVirusScanner;
