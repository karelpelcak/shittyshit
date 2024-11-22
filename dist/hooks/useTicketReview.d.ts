import type { GenericAbortSignal } from 'axios';
export interface Review {
    sectionId: number;
    fields: QuestionField[];
}
export interface QuestionField {
    questionId: number;
    type: 'RADIO_BUTTON' | 'TEXT';
    text: string;
    options: Option[];
}
export interface Option {
    text: string;
    answerId: number;
}
export interface RatingPayload {
    forms: Form[];
}
export interface Form {
    sectionId: number;
    form: FormFields;
}
export interface FormFields {
    fields: AnswerField[];
}
export interface AnswerField {
    questionId: number;
    text: string;
    answerId?: number | null;
}
interface TicketReviewParams {
    ticketId: number;
    luh?: string;
}
declare const useTicketReview: ({ ticketId, luh }: TicketReviewParams) => {
    reviewForm: {
        data?: Review[] | undefined;
        error: import("axios").AxiosError<any, any> | null;
        response?: import("axios").AxiosResponse<Review[], any> | undefined;
    };
    loading: boolean;
    sendReview: (data: RatingPayload, signal?: GenericAbortSignal) => Promise<boolean>;
};
export default useTicketReview;
