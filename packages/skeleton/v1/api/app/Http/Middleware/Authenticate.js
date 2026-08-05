import { UnauthorizedException } from "@ecf/http";

export class Authenticate {
    async handle(request, next) {
        if (!request.user()) {
            throw new UnauthorizedException("Unauthenticated request.");
        }
        return next(request);
    }
}

export default Authenticate;
