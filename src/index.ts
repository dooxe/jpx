/**
 * @module jpx
 */
export * from './Error';
export * from './Image';
export * from './Kernel';

/**
 * Some configuration
 */
export { config } from './config';

/**
 * Some filters
 */
export * as filters from './filters';

/**
 * Several loops utilities.
 * 
 * > [!WARNING] Those loops a time expensive.
 * >
 * > If you are into performance, use javascript loops instead
 */
export * as loops from './loops';