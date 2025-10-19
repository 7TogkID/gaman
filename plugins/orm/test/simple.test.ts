import { describe, it, expect } from 'vitest';
import { GamanORM } from '../orm';
import { BaseModel } from '../model/base';

describe('Simple Test', () => {
	it('should import GamanORM', () => {
		expect(GamanORM).toBeDefined();
	});

	it('should import BaseModel', () => {
		expect(BaseModel).toBeDefined();
	});
});
