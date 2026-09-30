// Stands in for ../secureStorage in tests: the real one reaches expo modules, which do not resolve under node.
// What is stored is exported, so that a test can seed and inspect it.
export const secrets = new Map<string, string>();

export const readSecure = async (key: string): Promise<string | null> => secrets.get(key) ?? null;

export const writeSecure = async (key: string, value: string): Promise<void> => void secrets.set(key, value);

export const removeSecure = async (key: string): Promise<void> => void secrets.delete(key);
