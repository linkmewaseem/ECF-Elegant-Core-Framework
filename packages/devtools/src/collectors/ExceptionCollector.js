export class ExceptionCollector {
  collect(requestRecord, error) {
    if (requestRecord && error) {
      requestRecord.addException(error);
    }
  }
}

export default ExceptionCollector;
