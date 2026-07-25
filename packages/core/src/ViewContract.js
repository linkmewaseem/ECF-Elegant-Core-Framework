import ViewContractError from "./errors/ViewContractError.js";

export default class ViewContract {
    async render(name, data = {}) {
        throw new ViewContractError("ViewContract.render() must be implemented.");
    }
}
