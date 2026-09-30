export interface HouseholdMember {
  userId: number;
  /** A name the account chose, or its address with the local part masked. Never the address. */
  displayName: string;
  shareRecipes: boolean;
  /** Whether this is you, so leaving and being removed can be told apart. */
  me: boolean;
}

export interface Household {
  id: string;
  name: string;
  /** Whether your own cookbook is in this household. All of it or none of it. */
  shareRecipes: boolean;
  memberCount: number;
  members?: HouseholdMember[] | null;
}

export interface HouseholdInvite {
  token: string;
  link: string;
  expiresAt: string;
}
