// Omit applied to each member of a union, so the result stays a union.
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
