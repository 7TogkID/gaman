/**
 * Define a new block for routing, middleware, error handling, etc.
 */
export function defineBlock(block) {
    if (!block.depedencies)
        block.depedencies = {};
    let services_useable = {};
    if (block.services) {
        for (const [key, factory] of Object.entries(block.services)) {
            services_useable[key] = factory(block.depedencies || {});
        }
    }
    let routes_useable = {};
    if (block.routes) {
        for (const routeFactory of block.routes) {
            const routes = routeFactory({
                ...services_useable,
                ...block.depedencies,
            });
            routes_useable = { ...routes_useable, ...routes };
        }
    }
    return {
        ...block,
        services_useable,
        routes_useable,
    };
}
defineBlock({
    404: () => {
        return {};
    },
});
