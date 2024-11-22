import type { GenericAbortSignal } from 'axios';
import { SeatClass, SeatSectionBasic, SelectedSeat, Tariff, VehicleType, VehicleKey } from './types';
import { Service } from './useConnectionRoute';
export interface PreselectedSeat extends SelectedSeat {
    vehicleDeckNumber: number;
}
export interface SectionCommons {
    fixedSeatReservation: boolean;
    selectedSeats: SelectedSeat[];
    vehicles: Vehicle[];
}
export interface SeatSection extends SectionCommons {
    selectedSeats: PreselectedSeat[];
    sectionId: number;
}
export interface VehicleService {
    code: string;
    name: string;
    imageCode: Service;
}
export interface VehicleSeatClass {
    name: SeatClass;
    services: VehicleService[];
}
export interface Vehicle {
    id: number;
    code: string | null;
    type: VehicleType;
    number: number;
    seatClasses: VehicleSeatClass[];
    standard: VehicleKey;
    notifications: string[];
    cateringEnabled: boolean;
    decks: Deck[];
}
export interface Deck {
    number: number;
    name: string;
    layoutURL: string;
    freeSeats: Seat[];
    occupiedSeats: Seat[];
}
export interface Seat {
    index: number;
    seatClass: SeatClass;
    seatConstraint: null | string;
    seatNotes: string[];
}
export interface SeatsPayload {
    seatClass: SeatClass;
    sections: SeatSectionBasic[];
    tariffs: Tariff[];
}
type Options = {
    ignoreGlobalState?: boolean;
};
declare const useSeats: (options?: Options) => {
    error: import("axios").AxiosError<any, any> | {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | null;
    loading: boolean;
    data: SeatSection[] | undefined;
    fetchSeats: (reqData: SeatsPayload, signal?: GenericAbortSignal) => Promise<boolean>;
};
export default useSeats;
