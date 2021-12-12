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
    total_points: number;
    review_points: number;
    blog_points: number;
    debug_points: number;
    project_points: number;
    concept_points: number;
    meme_points: number;
}
