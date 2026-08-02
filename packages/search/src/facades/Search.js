export class SearchFacade {
  static instance = null;

  static setInstance(manager) {
    SearchFacade.instance = manager;
  }

  static getInstance() {
    if (!SearchFacade.instance) {
      throw new Error("SearchFacade instance has not been bound to IoC container.");
    }
    return SearchFacade.instance;
  }

  static index(indexName) {
    return SearchFacade.getInstance().index(indexName);
  }

  static collection(name, indexNames = []) {
    return SearchFacade.getInstance().collection(name, indexNames);
  }

  static dsl(dslObj) {
    return SearchFacade.getInstance().index("*").dsl(dslObj);
  }

  static reindex(modelClassOrName, items = []) {
    return SearchFacade.getInstance().reindex(modelClassOrName, items);
  }

  static extend(name, factory) {
    return SearchFacade.getInstance().extend(name, factory);
  }

  static use(name) {
    return SearchFacade.getInstance().use(name);
  }

  static capabilities(driverName = null) {
    return SearchFacade.getInstance().capabilities(driverName);
  }

  static suggest(prefix, limit = 5) {
    return SearchFacade.getInstance().suggest(prefix, limit);
  }

  static fake() {
    return SearchFacade.getInstance().fake();
  }
}

export const Search = SearchFacade;
export default SearchFacade;
