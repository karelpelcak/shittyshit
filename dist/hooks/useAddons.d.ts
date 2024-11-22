import type { GenericAbortSignal } from 'axios';
import { AddonsPassengersPayload, Currency, RouteSectionDepArr, SelectedSeat, TicketAddonState } from './types';
interface AddonCommons {
    addonId: number;
    currency: Currency;
    price: number;
}
export interface TicketAddon {
    id: number;
    name: string;
    shortDescription: string;
    description: string;
    iconUrl: string;
    infoUrl: string | null;
    infoUrlLabel: string | null;
    price: number;
    currency: Currency;
    conditions: Conditions;
    state: TicketAddonState;
}
export interface SelectedAddon extends AddonCommons {
    addonCode?: string;
    conditionsHash: string;
    count: number;
}
export interface VerifyAddonsPayload extends AddonsPassengersPayload {
    selectedAddons: SelectedAddon[];
}
export interface RouteSectionData extends RouteSectionDepArr {
    selectedSeats: SelectedSeat[];
}
export interface Addon extends AddonCommons {
    addonCode: string;
    conditions: Conditions;
    shortDescription: string;
    description: string;
    iconUrl: string;
    infoUrl: null | string;
    infoUrlLabel: null | string;
    maxCount: number;
    name: string;
}
export interface Conditions {
    descriptions: Descriptions;
    code: string;
}
export interface Descriptions {
    cancel: string;
    rebook: string;
    expiration: string;
}
declare const useAddons: () => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    fetchAddons: (payload: AddonsPassengersPayload, signal?: GenericAbortSignal) => Promise<boolean>;
    putAddons: (ticketId: number, selectedAddons: SelectedAddon[], signal?: GenericAbortSignal) => Promise<boolean>;
    verifyAddons: (payload: VerifyAddonsPayload, signal?: GenericAbortSignal) => Promise<boolean>;
    data: Addon[] | undefined;
};
export default useAddons;
