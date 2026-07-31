import ICursorPaginator from "../contracts/ICursorPaginator.js";
import { Readable } from "node:stream";

export default class CursorPagination extends ICursorPaginator {
    #queryBuilder;

    constructor(queryBuilder) {
        super();
        this.#queryBuilder = queryBuilder;
    }

    async paginate(perPage = 15, page = 1) {
        const total = await this.#queryBuilder.clone().count();
        const offset = Math.max(0, (page - 1) * perPage);
        const data = await this.#queryBuilder.clone().offset(offset).limit(perPage).get();
        const lastPage = Math.ceil(total / perPage) || 1;

        return {
            data,
            total,
            perPage,
            currentPage: page,
            lastPage,
            hasMore: page < lastPage
        };
    }

    async cursorPaginate(perPage = 15, cursor = null, cursorColumn = "id") {
        let builder = this.#queryBuilder.clone().orderBy(cursorColumn, "ASC").limit(perPage + 1);

        if (cursor !== null && cursor !== undefined) {
            builder = builder.where(cursorColumn, ">", cursor);
        }

        const items = await builder.get();
        const hasMore = items.length > perPage;
        const data = hasMore ? items.slice(0, perPage) : items;

        const nextCursor = (hasMore && data.length > 0) ? data[data.length - 1][cursorColumn] : null;

        return {
            data,
            nextCursor,
            perPage,
            hasMore
        };
    }

    async *cursor(cursorColumn = "id") {
        let cursor = null;
        while (true) {
            let builder = this.#queryBuilder.clone().orderBy(cursorColumn, "ASC").limit(100);
            if (cursor !== null) {
                builder = builder.where(cursorColumn, ">", cursor);
            }
            const rows = await builder.get();
            if (rows.length === 0) break;

            for (const row of rows) {
                yield row;
                cursor = row[cursorColumn];
            }
        }
    }

    async *lazy(chunkSize = 100, cursorColumn = "id") {
        let cursor = null;
        while (true) {
            let builder = this.#queryBuilder.clone().orderBy(cursorColumn, "ASC").limit(chunkSize);
            if (cursor !== null) {
                builder = builder.where(cursorColumn, ">", cursor);
            }
            const rows = await builder.get();
            if (rows.length === 0) break;

            for (const row of rows) {
                yield row;
                cursor = row[cursorColumn];
            }
        }
    }

    stream(chunkSize = 100, cursorColumn = "id") {
        const self = this;
        let iterator = null;

        return new Readable({
            objectMode: true,
            async read() {
                if (!iterator) {
                    iterator = self.cursor(cursorColumn);
                }
                try {
                    const { value, done } = await iterator.next();
                    if (done) {
                        this.push(null);
                    } else {
                        this.push(value);
                    }
                } catch (err) {
                    this.destroy(err);
                }
            }
        });
    }

    async each(callback, chunkSize = 100, cursorColumn = "id") {
        for await (const row of this.lazy(chunkSize, cursorColumn)) {
            await callback(row);
        }
    }

    async chunk(chunkSize, callback, cursorColumn = "id") {
        let cursor = null;
        while (true) {
            let builder = this.#queryBuilder.clone().orderBy(cursorColumn, "ASC").limit(chunkSize);
            if (cursor !== null) {
                builder = builder.where(cursorColumn, ">", cursor);
            }
            const rows = await builder.get();
            if (rows.length === 0) break;

            await callback(rows);
            cursor = rows[rows.length - 1][cursorColumn];
        }
    }
}
