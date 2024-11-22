export declare const SET_RESPONSE_STATE = "SET_RESPONSE_STATE";
export declare enum ResponseStateCategory {
    addons = 0,
    connection = 1,
    connectionRoute = 2,
    createTickets = 3,
    credit = 4,
    locations = 5,
    passengersData = 6,
    payment = 7,
    seats = 8,
    tariffs = 9,
    ticket = 10,
    ticketAction = 11,
    user = 12,
    userTickets = 13,
    useTicketsType = 14,
    ticketReview = 15,
    seatClasses = 16,
    vehicleStandards = 17
}
export interface ErrorFields {
    description?: string;
    key?: string;
    value?: string;
}
export interface ResponseState {
    error?: {
        message?: string;
        errorFields?: ErrorFields[];
    };
    loading: boolean;
}
export interface ResponseStatePayload extends ResponseState {
    type?: ResponseStateCategory;
}
interface SetResponseStateAction {
    type: typeof SET_RESPONSE_STATE;
    payload: ResponseStatePayload;
}
export type ResponseStateReducerProps = {
    [key in ResponseStateCategory]: ResponseState;
};
export type ResponseStateActions = SetResponseStateAction;
export {};
