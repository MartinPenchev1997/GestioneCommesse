export function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Errore nel decoding del token:', error);
    return null;
  }
}

export function getClaims(decoded: any): any {
  return decoded ? decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] : null;
}
export function getRole(decoded:any): any {
  return decoded ? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] : null;
}

