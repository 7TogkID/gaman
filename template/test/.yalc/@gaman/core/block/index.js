/**
 * Define a new block for routing, middleware, error handling, etc.
 */
export function defineBlock(block) {
    if (!block.depedencies)
        block.depedencies = {};
    if (!block.services)
        block.services = {};
    const serviceCache = {};
    const context = new Proxy({}, {
        get(_, prop) {
            if (prop in serviceCache)
                return serviceCache[prop];
            if (prop in block.services) {
                const factory = block.services[prop];
                const instance = factory(context);
                serviceCache[prop] = instance;
                return instance;
            }
            if (prop in block.depedencies)
                return block.depedencies[prop];
            return undefined;
        },
    });
    const services_useable = {};
    if (block.services) {
        for (const [key, factory] of Object.entries(block.services)) {
            services_useable[key] = factory(context);
        }
    }
    // Build routes
    let routes_useable = {};
    if (block.routes) {
        for (const factory of block.routes) {
            const routes = factory(context);
            routes_useable = { ...routes_useable, ...routes };
        }
    }
    return {
        ...block,
        services_useable,
        routes_useable,
    };
}
