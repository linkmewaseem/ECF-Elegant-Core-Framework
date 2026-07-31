/**
 * Interface ICursorPaginator
 * Cursor pagination, lazy generators, and streams handler interface.
 */
export default class ICursorPaginator {
    paginate(perPage = 15, page = 1) { throw new Error("Method paginate() must be implemented."); }
    cursorPaginate(perPage = 15, cursor = null, cursorColumn = "id") { throw new Error("Method cursorPaginate() must be implemented."); }
    cursor() { throw new Error("Method cursor() must be implemented."); }
    lazy(chunkSize = 100) { throw new Error("Method lazy() must be implemented."); }
    stream() { throw new Error("Method stream() must be implemented."); }
    each(callback) { throw new Error("Method each() must be implemented."); }
    chunk(chunkSize, callback) { throw new Error("Method chunk() must be implemented."); }
}
