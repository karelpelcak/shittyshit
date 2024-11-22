import type { GenericAbortSignal } from 'axios';
import { Currency, DateString, FlexiType, RouteId, SeatClass, Tariff, TicketType, VehicleKey, VehicleType } from './types';
import { Descriptions } from './useAddons';
import { ActionPrice } from './useCreateTickets';
export type Service = 'typy_vozidel_astra' | 'typy_vozidel_automaty' | 'typy_vozidel_bezp_sluzba' | 'typy_vozidel_bez_dotykove_obrazovky' | 'typy_vozidel_chlazene_napoje' | 'typy_vozidel_denni_tisk' | 'typy_vozidel_detske_kupe' | 'typy_vozidel_dotykova_obrazovka' | 'typy_vozidel_dzus' | 'typy_vozidel_imobilni' | 'typy_vozidel_imobilni_rampa' | 'typy_vozidel_klidova_zona' | 'typy_vozidel_klimatizace' | 'typy_vozidel_kocarky' | 'typy_vozidel_kresilko' | 'typy_vozidel_low_cost' | 'typy_vozidel_obcerstveni' | 'typy_vozidel_online_catering' | 'typy_vozidel_prednostni_servis' | 'typy_vozidel_preprava_kola' | 'typy_vozidel_restauracni_vuz' | 'typy_vozidel_sekt' | 'typy_vozidel_sluchatka' | 'typy_vozidel_snidane' | 'typy_vozidel_spaci_vuz' | 'typy_vozidel_spaci_vuz_zeny' | 'typy_vozidel_stevardka' | 'typy_vozidel_teple_napoje_zdarma' | 'typy_vozidel_tiche_kupe' | 'typy_vozidel_wifi_ano' | 'typy_vozidel_wifi_ne' | 'typy_vozidel_zabavni_portal_ano' | 'typy_vozidel_zasuvka' | 'typy_vozidel_zastuvka_ne';
export interface Line {
    id: number;
    code: string | null;
    from: string;
    to: string;
    lineGroupCode: string;
    lineNumber: number;
}
export interface CarbonOffset {
    amount: number;
    currency: Currency;
}
export interface TransferTime {
    days: number;
    hours: number;
    minutes: number;
}
export interface Transfer {
    fromStationId: number;
    toStationId: number;
    calculatedTransferTime: TransferTime;
    determinedTransferTime: TransferTime | null;
    description: string | null;
}
export interface TariffNotifications {
    title: string;
    description: string;
    content: string[];
}
export interface PriceClass {
    actionPrice: null | ActionPrice;
    bookable: boolean;
    conditions: {
        descriptions: Descriptions;
    };
    creditPrice: number;
    customerNotifications: string[];
    flexiType?: FlexiType;
    freeSeatsCount: number;
    lineGroupCode?: string;
    lineNumber?: number;
    price: number;
    priceSource: string;
    seatClassKey: SeatClass;
    services: Service[];
    tariffNotifications: TariffNotifications;
    tariffs: Tariff[];
    type: TicketType;
}
export interface TransfersInfo {
    info: string;
    transfers: Transfer[];
}
export interface RouteSectionCommons {
    arrivalCityName: string;
    arrivalStationId: number;
    arrivalCityId: number;
    arrivalStationName: string;
    arrivalTime: DateString;
    delay: string | null;
    departureCityName: string;
    departureStationId: number;
    departureCityId: number;
    departureStationName: string;
    departureTime: DateString;
    estimatedArrivalTime: DateString;
    freeSeatsCount: number;
    support: boolean;
    travelTime: string;
}
export interface Section extends RouteSectionCommons {
    departurePlatform: string | null;
    id: number;
    line: Line;
    notices: string[] | null;
    vehicleType: VehicleType;
    services: Service[];
    vehicleStandardKey: VehicleKey;
}
export interface RouteOverview extends RouteSectionCommons {
    bookable: boolean;
    creditPriceFrom: number;
    creditPriceTo: number;
    id: RouteId;
    mainSectionId: number;
    notices: boolean;
    priceFrom: number;
    priceTo: number;
    transfersCount: number;
    vehicleTypes: VehicleType[];
}
export interface Surcharge {
    price: number;
    notification: string;
}
export interface RouteDetail extends RouteOverview {
    carbonOffset: CarbonOffset;
    nationalTrip: boolean;
    priceClasses: PriceClass[];
    sections: Section[];
    transfersInfo: TransfersInfo | null;
    surcharge: null | Surcharge;
    vehicleStandardKey: VehicleKey;
}
export interface FlexiResponse {
    flexiType?: FlexiType;
    lineGroupCode: string;
    lineNumber: number;
    price: number;
    seatClassKey: SeatClass;
}
export interface RoutePayload {
    routeId: string | number;
    fromStationId: number;
    toStationId: number;
    tariffs: Tariff[];
}
export interface SroPriceClass {
    conditions: SroConditions;
    freeSeatsCount: number;
    numberOfPassengers: number;
    price: number;
    priceSource: string;
    seatClassKey: SeatClass;
}
export interface SroPriceClassSelectable extends SroPriceClass {
    tariffs: Tariff[];
    type: TicketType;
}
export interface SroConditions {
    cancelCharge: number;
    code: string;
    refundToOriginalSourcePossible: boolean;
}
export interface SroRouteResponse {
    priceClasses: SroPriceClass[];
    routeId: string;
}
declare const useConnectionRoute: (ignoreErrors?: boolean) => {
    data: RouteDetail | undefined;
    fetchRoute: (params: RoutePayload, signal?: GenericAbortSignal) => Promise<RouteDetail | undefined>;
    fetchSroRoutes: ({ routeId, ...payload }: RoutePayload, signal?: GenericAbortSignal) => Promise<SroPriceClass[] | undefined>;
    rjSroClasses: SroPriceClassSelectable[];
    routeError: import("axios").AxiosError<any, any> | null;
    routeLoading: boolean;
};
export default useConnectionRoute;
