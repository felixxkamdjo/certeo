export interface Evaluation {
	id: string;
	title: string;
	trainingName: string;
	type: string;
	questionCount: number;
	createdAt: string;
}

export interface EvaluationStatistics {
	totalEvaluations: number;
	totalParticipations: number;
	averageScore: number;
}

export interface EvaluationsData {
	items: Evaluation[];
	statistics: EvaluationStatistics;
}
