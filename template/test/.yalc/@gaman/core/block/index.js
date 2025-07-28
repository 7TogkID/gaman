/**
 * Define a new block for routing, middleware, error handling, etc.
 */
export function defineBlock(block) {
    if (!block.depedencies)
        block.depedencies = {};
    if (!block.services)
        block.services = {};
    const serviceCache = {}; // * service cache biar ga berat karna pakai proxy
    /**
     * * Proxy ini adalah Wrapper dinamis jadi bisa ngambil object dinamis mirip lamda lah
     */
    const context = new Proxy({}, {
        // * fungsi get ini seperti saat orang pakai context['service'] nah 'service' ini itu prop
        get(_, prop) {
            // ? kalau udah ada di cache pakai cache aja!
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
    // * register services_useable artinya services yang bakal di pakai
    const services_useable = {};
    if (block.services) {
        for (const [key, factory] of Object.entries(block.services)) {
            services_useable[key] = factory(context);
        }
    }
    // * register routes_useable artinya routes yang bakal di pakai
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
