export interface WarnUser {
    id: string;
    name: string;
    discordID: string;
    count: number;
    offences: WarnOffence[];
}

export interface WarnOffence {
    date: Date;
    reason: string;
    author: string;
}
