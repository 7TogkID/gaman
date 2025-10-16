import { Edge } from 'edge.js';

export type EdgeHandlerFactory = (edge: Edge) => void | Promise<void>;

export function composeEdgeHandler(
	factory: EdgeHandlerFactory,
): EdgeHandlerFactory {
	return factory;
}