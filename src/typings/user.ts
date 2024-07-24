interface StsTokenManager {
    refreshToken: string;
    accessToken: string;
    expirationTime: number;
  }
  
interface UserMetadata {
    createdAt: string;
    creationTime: string;
    lastLoginAt: string;
    lastSignInTime: string;
  }
  
interface ProactiveRefresh {
    user: UserImpl;
    isRunning: boolean;
    timerId: any; 
    errorBackoff: number;
  }

interface ProviderData {
    displayName: string;
    email: string;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
    uid: string;
  }
  
interface ProviderUserInfo {
    displayName: string | null;
    email: string | null;
    federatedId: string;
    photoUrl: string | null;
    providerId: string;
    rawId: string;
    validSince: string;
  }
  
interface ReloadUserInfo {
    localId: string;
    email: string;
    displayName: string;
    photoUrl: string | null;
    emailVerified: boolean;
    lastLoginAt: string;
    lastRefreshAt: string;
}
  
export interface UserImpl {
    providerId: string;
    proactiveRefresh: ProactiveRefresh;
    reloadUserInfo: ReloadUserInfo;
    reloadListener: null; // Adjust type if reloadListener has a specific type
    uid: string;
    accessToken: string;
    displayName: string | null;
    email: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    metadata: UserMetadata;
    phoneNumber: string | null; // Adjust type based on actual data or if it can be null
    photoURL: string | null;
    providerData: ProviderData; // Define a more specific type if providerData has a known structure
    providerUserInfo: ProviderUserInfo;
    stsTokenManager: StsTokenManager;
    tenantId: string | null; // Adjust type based on actual data or if it can be null
    refreshToken: string;
  }
  