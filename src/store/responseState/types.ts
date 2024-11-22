export const SET_RESPONSE_STATE = 'SET_RESPONSE_STATE';

export enum ResponseStateCategory {
  addons,
  connection,
  connectionRoute,
  createTickets,
  credit,
  locations,
  passengersData,
  payment,
  seats,
  tariffs,
  ticket,
  ticketAction,
  user,
  userTickets,
  useTicketsType,
  ticketReview,
  seatClasses,
  vehicleStandards,
}
export interface ErrorFields  {
  description?: string
  key?: string
  value?: string
}
export interface ResponseState {
  error?: {
    message?: string;
    errorFields?: ErrorFields[]
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
