export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
  html_url: string;
}

function api() { return (window as any).electronAPI; }

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const a = api();
  if (a?.github?.requestDeviceCode) return a.github.requestDeviceCode();
  throw new Error('electronAPI not available');
}

export async function pollForToken(deviceCode: string, interval: number, expiresIn: number): Promise<string> {
  const a = api();
  if (a?.github?.pollForToken) return a.github.pollForToken(deviceCode, interval, expiresIn);
  throw new Error('electronAPI not available');
}

export async function getGitHubUser(token: string): Promise<GitHubUser> {
  const a = api();
  if (a?.github?.getUser) return a.github.getUser(token);
  throw new Error('electronAPI not available');
}

export async function validateToken(token: string): Promise<GitHubUser | null> {
  try {
    return await getGitHubUser(token);
  } catch {
    return null;
  }
}
