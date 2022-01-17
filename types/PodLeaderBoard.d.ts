export interface PodLeaderBoard {
    id: string;
    name: string;
    points: number;
}

export interface TeamLeaderBoard {
    id: string;
    name: string;
    points: number;
}

export interface IndividualLeaderBoard {
    id: string;
    name: string;
    discordID: string;
    teamID: string;
    podID: string;
    total_points: number;
    review_points: number;
    blog_points: number;
    debug_points: number;
    project_points: number;
    concept_points: number;
    meme_points: number;
    grattitude_points: number;
    rank: ?number;
}

export interface Points {
    total_points: number;
    review_points: number;
    blog_points: number;
    debug_points: number;
    project_points: number;
    concept_points: number;
    meme_points: number;
    grattitude_points: number;
}

export interface LeaderboardCategoryType {
    total: IndividualLeaderBoard;
    review: IndividualLeaderBoard;
    blog: IndividualLeaderBoard;
    debug: IndividualLeaderBoard;
    project: IndividualLeaderBoard;
    concept: IndividualLeaderBoard;
    meme: IndividualLeaderBoard;
    grattitude_points: IndividualLeaderBoard;
}
