import { RouteSectionData } from './useAddons';

export type VehicleType = 'BUS' | 'TRAIN';
export type Currency =
  | 'CHF'
  | 'CZK'
  | 'EUR'
  | 'GBP'
  | 'HRK'
  | 'HUF'
  | 'PLN'
  | 'UAH';

export type Language = 'de-AT' | 'en' | 'cs' | 'de' | 'sk' | 'hu' | 'uk' | 'pl';

export type StationCountry =
  | 'DE'
  | 'BE'
  | 'CH'
  | 'LU'
  | 'HR'
  | 'IT'
  | 'FR'
  | 'UA'
  | 'HU'
  | 'AT'
  | 'UK'
  | 'CZ'
  | 'SK'
  | 'ME'
  | 'PL'
  | 'NL'
  | 'BA';

export type TicketType = 'FLEXI' | 'RJ_SRO' | 'RJ_SEAT' | 'RJ_TIME';
export type State = 'UNPAID' | 'VALID' | 'USED' | 'CANCELED';
export type TicketState = State;
export type TicketAddonState = State | 'EXPIRED' | 'DELETED' | 'NULLIFIED';
export type FlexiType = 'FLEX' | 'WEEK' | 'MONTH' | 'QUARTER';

export enum Tariff {
  Regular = 'REGULAR',
  CzechStudentPass15 = 'CZECH_STUDENT_PASS_15',
  CzechStudentPass26 = 'CZECH_STUDENT_PASS_26',
  Isic = 'ISIC',
  AttendedChild = 'ATTENDED_CHILD',
  Disabled = 'DISABLED',
  DisabledAttendance = 'DISABLED_ATTENDANCE',
  Euro26 = 'EURO26',
  Child = 'CHILD',
  UaRefugee = 'UA_REFUGEE',
  UaRefugeeChild = 'UA_REFUGEE_CHILD',
  Disabled3 = 'DISABLED_3',
  ChildUnder12 = 'CHILD_UNDER_12',
}

export interface SeatPosition {
  vehicleNumber: number;
  seatIndex: number;
}

export interface SelectedSeat extends SeatPosition {
  sectionId: number;
}

export interface RouteSectionDepArr {
  sectionId: number;
  departureStationId: number;
  arrivalStationId: number;
}

export interface RouteSectionFromTo {
  sectionId: number;
  fromStationId: number;
  toStationId: number;
}

export interface AddonsPassengersPayload {
  tariffs: Tariff[];
  routeSections: RouteSectionData[];
}

export interface SeatSectionBasic {
  sectionId: number;
  fromStationId: number;
  toStationId: number;
}

export enum SeatClass {
  C0 = 'C0',
  C1 = 'C1',
  C2 = 'C2',
  No = 'NO',
  Train1StClass = 'TRAIN_1ST_CLASS',
  Train2NdClass = 'TRAIN_2ND_CLASS',
  TrainCouchetteBusiness4 = 'TRAIN_COUCHETTE_BUSINESS_4',
  TrainCouchetteBusiness = 'TRAIN_COUCHETTE_BUSINESS',
  TrainCouchetteRelax = 'TRAIN_COUCHETTE_RELAX',
  TrainCouchetteRelaxForWomen = 'TRAIN_COUCHETTE_RELAX_FOR_WOMEN',
  TrainCouchetteStandard = 'TRAIN_COUCHETTE_STANDARD',
  TrainLowCost = 'TRAIN_LOW_COST',
  TrainStandardPlus = 'TRAIN_STANDARD_PLUS',
  BusStandard = 'BUS_STANDARD',
  BusRelax = 'BUS_RELAX',
}

export enum PaymentType {
  Cash = 'CASH',
  Gift = 'GIFT',
  Online = 'ONLINE',
  Credit = 'CREDIT',
  FastBank = 'FAST_BANK',
  Transfer = 'TRANSFER',
}

export enum VehicleKey {
  YELLOW = 'YELLOW',
  YELLOW_R8 = 'YELLOW_R8',
  ECONOMY = 'ECONOMY',
  FUN_RELAX = 'FUN_RELAX',
  FUN_RELAX_SELF_SERVICE = 'FUN_RELAX_SELF_SERVICE',
  FUN_RELAX_NO_STEWARD = 'FUN_RELAX_NO_STEWARD',
  DEUTSCHE_BAHN = 'DEUTSCHE_BAHN',
  ECONOMY_PLATFORM = 'ECONOMY_PLATFORM',
  SAD = 'SAD',
  WEST_BAHN = 'WEST_BAHN',
  IDS_JMK = 'IDS_JMK',
  OBB = 'OBB',
  UKRAINIAN_RAILWAYS = 'UKRAINIAN_RAILWAYS',
  GEPARD_EXPRESS = 'GEPARD_EXPRESS',
  UNITED_BUSES = 'UNITED_BUSES',
}

export enum PaymentMethod {
  Account = 'ACCOUNT',
  Cash = 'CASH',
  Giftcertificate = 'GIFT_CERTIFICATE',
  Gopaysporopay = 'GOPAY_SPOROPAY',
  Gopaytatrapay = 'GOPAY_TATRAPAY',
  Gopayunicreditsk = 'GOPAY_UNICREDIT_SK',
  Gopayvub = 'GOPAY_VUB',
  Gpeapplepay = 'GPE_APPLE_PAY',
  Gpegooglepay = 'GPE_GOOGLE_PAY',
  Gpeonlinecard = 'GPE_ONLINE_CARD',
  Payuapplepay = 'PAYU_APPLE_PAY',
  Payucsasservis24 = 'PAYU_CSAS_SERVIS24',
  Payucsob = 'PAYU_CSOB',
  Payuera = 'PAYU_ERA',
  Payufio = 'PAYU_FIO',
  Payugemoneybank = 'PAYU_GE_MONEY_BANK',
  Payugiropay = 'PAYU_GIROPAY',
  Payugooglepay = 'PAYU_GOOGLE_PAY',
  Payuinstanttr = 'PAYU_INSTANT_TR',
  Payukb = 'PAYU_KB',
  Payumbankmpenize = 'PAYU_MBANK_MPENIZE',
  Payuonlinecard = 'PAYU_ONLINE_CARD',
  Payuraiffeisen = 'PAYU_RAIFFEISEN',
  Payusepa = 'PAYU_SEPA',
  Payusofort = 'PAYU_SOFORT',
  Payusofortat = 'PAYU_SOFORT_AT',
  Payuunicredit = 'PAYU_UNICREDIT',
  Transfer = 'TRANSFER',
}

/**
 * Can be one number as string '5545700263'
 * or multiple numbers split by comma '5545700263,5531912020'
 */
export type RouteId = string;

/**
 * ISO date in string format
 */
export type DateString = string;
