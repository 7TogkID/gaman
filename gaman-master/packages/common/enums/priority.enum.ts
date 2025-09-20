export enum Priority {
	MONITOR = 0,
	VERY_HIGH = 1,
	HIGH = 2,
	NORMAL = 3,
	LOW = 4,
	VERY_LOW = 5,
}

export type PriorityType = keyof typeof Priority;