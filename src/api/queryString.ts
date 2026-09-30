export const queryString = (params: Record<string, string | number | null | undefined>): string => {
  const present = Object.entries(params).filter(([, value]) => value !== null && value !== undefined);
  return present.length === 0 ? '' :
    '?' + present.map(([name, value]) => `${name}=${encodeURIComponent(String(value))}`).join('&');
};

export const householdScope = (householdId?: string | null): string => queryString({household: householdId});
