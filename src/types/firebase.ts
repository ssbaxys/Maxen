export interface UserData {
    email: string;
    phoneNumber?: string;
    visualNick?: string;
    root?: boolean;
    createdAt: number;
    servers?: Record<string, boolean>; // Map of serverId -> true
    preferences?: {
        theme?: string;
        language?: string;
        volume?: number;
        colorblindMode?: boolean;
        voiceoverEnabled?: boolean;
    };
}

export type ServerStatus = 'offline' | 'starting' | 'running' | 'stopping';

export interface ServerData {
    owner: string;
    name: string;
    node: string;
    status: ServerStatus;
    specs: {
        ram: number; // in GB
        cpu: number; // cores
        disk: number; // in GB
    };
    createdAt: number;
    settings?: ServerSettings;
    versionInfo?: {
        software: string;
        build: string;
    };
}

export interface ServerSettings {
    sftpPort: number;
    startupCommand?: string;
}

export interface ServerMember {
    role: 'admin' | 'viewer'; // Expanded perms later if needed
    addedAt: number;
    addedBy: string;
}

export interface FirewallRule {
    id: string;
    port: string;
    protocol: 'tcp' | 'udp' | 'tcp/udp';
    notes: string;
}

export interface LogEntry {
    message: string;
    type: 'INFO' | 'WARN' | 'ERROR';
    timestamp: number;
}

export interface StatEntry {
    time: number;
    cpu: number;
    ram: number;
    netIn: number;
    netOut: number;
}

export interface GlobalSettings {
    maintenanceMode?: boolean;
    registrationEnabled?: boolean;
}

export interface BanData {
    reason: string;
    issuedBy: string;
    issuedAt: number;
    expiresAt?: number; // timestamp or undefined for permanent
    blockedFeatures: string[]; // e.g. ['login', 'server_creation', 'console']
}

export interface AdminLog {
    id?: string;
    user: string; // Identifier of who did it (uid or email)
    action: string;
    target?: string; // Resource affected (e.g. server ID, user ID)
    timestamp: number;
    type: 'auth' | 'server' | 'system' | 'billing';
}
