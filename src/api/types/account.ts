import {ShoppingProvider} from './shopping';

export interface UserInfo {
  email: string;
  /** Null while the account never set one; fellow household members then see a masked address. */
  displayName?: string | null;
  onboarded?: boolean;
  /** Null until the first shopping import asked where the list should go. */
  shoppingProvider?: ShoppingProvider | null;
}

export interface InstanceInfo {
  termsOfService: string;
  sharingEnabled: boolean;
  householdsEnabled: boolean;
  /**
   * Whether this instance can read a recipe from a photograph. False when the operator has no
   * machine learning subsystem, switched scanning off, or has one that is unreachable.
   */
  ocrImportEnabled: boolean;
  /** Whether accounts may create api keys. */
  apiKeysEnabled: boolean;
}

export type ApiScope = 'shopping:read' | 'shopping:write';

export interface ApiKey {
  id: number;
  name: string;
  /** The secret's first characters, to tell keys apart. */
  displayPrefix: string;
  scopes: ApiScope[];
  createdOn: string;
  /** Null until first used; precise to about a minute. */
  lastUsedAt: string | null;
}

export interface IssuedApiKey {
  key: ApiKey;
  secret: string;
}
