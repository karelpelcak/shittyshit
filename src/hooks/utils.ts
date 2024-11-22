import equal from 'fast-deep-equal/es6/react';
import { SectionWithSeats } from '../store/booking/types';
import { SeatClass, SelectedSeat } from './types';
import { PriceClass, Section } from './useConnectionRoute';
import { TicketTypeId } from './usePayment';
import { SeatTicket, SroTicket, Tickets } from './useUserTickets';

export const basketItemsToTicketTypes = (tickets: Tickets) =>
  Object.entries(tickets).reduce((prev, [type, ticketList]) => {
    if (!ticketList.length) {
      return prev;
    }
    prev.push(
      ...ticketList.map(
        ({ id, sroTicketId }:
        Partial<Pick<SroTicket, 'sroTicketId'> & Pick<SeatTicket, 'id'>>,
        ) =>
          ({
            id: id || sroTicketId,
            type,
          }),
      ),
    );
    return prev;
  }, [] as TicketTypeId[]);

export const createTxToken = () => {
  let result = '';
  let rest = '';
  let number = new Date().valueOf();
  const characters =
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  while (number > 1) {
    const remainder = Math.floor(number % characters.length);
    number /= characters.length;
    result += characters[remainder];
  }

  for (let i = result.length; i < 8; i++) {
    rest += '1';
  }
  return rest + result;
};

export const mapFieldToUser = Object.freeze({
  EMAIL: 'email',
  FIRST_NAME: 'firstName',
  SURNAME: 'surname',
});

export const couchetteClasses: `${SeatClass}`[] = [
  'TRAIN_COUCHETTE_BUSINESS_4',
  'TRAIN_COUCHETTE_BUSINESS',
];

export const getMoreExpensiveClass = (
  baseClass: SeatClass,
  priceClasses: PriceClass[],
): PriceClass | null => {
  const actualClassIndex = priceClasses.findIndex(
    (pc) => pc.seatClassKey === baseClass,
  );

  const actualClass = priceClasses[actualClassIndex];
  const moreExpensiveClass = priceClasses[actualClassIndex + 1];

  if (
    !actualClass || // Not found
    !moreExpensiveClass || // Last class selected
    actualClass.type !== 'RJ_SEAT' || // Don't offer timetickets
    moreExpensiveClass.type !== 'RJ_SEAT' ||
    actualClass.price >= moreExpensiveClass.price || // Don't offer cheaper class
    moreExpensiveClass.price / actualClass.price > 1.5 || // The price difference is lower than 50%
    actualClass.seatClassKey === moreExpensiveClass.seatClassKey || // Don't offer same class (e.g. action prices)
    actualClass.actionPrice || // Don't offer for employee / with bicycle etc
    moreExpensiveClass.actionPrice || // Don't offer upsell class with bicycle...
    couchetteClasses.includes(moreExpensiveClass.seatClassKey) // Don't offer coupe
  ) {
    return null;
  }

  return moreExpensiveClass;
};

const shouldIgnoreAction = (event: string) => event === 'SET_RESPONSE_STATE';

export const gtmPush = (payload: {
  event: string;
  [key: string]: any;
}): void => {
  if (
    typeof window !== 'undefined' &&
    // @ts-expect-error dataLayer
    window.dataLayer?.push &&
    !shouldIgnoreAction(payload.event)
  ) {
    // @ts-expect-error dataLayer
    window.dataLayer.push(payload);
  }
};

export const getAffiliateCode = (): string | undefined => {
  const affiliateCode =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('affiliateCode')
      : '';

  if (!affiliateCode) {
    return undefined;
  }

  const expirationTs = parseInt(
    localStorage.getItem('affiliateCodeExpiration') || '',
    10,
  );

  if (expirationTs < new Date().valueOf()) {
    localStorage.removeItem('affiliateCode');
    localStorage.removeItem('affiliateCodeExpiration');
    return undefined;
  }

  return affiliateCode;
};

export const mapFromToSections = (
  depArrSections: Section[],
): SectionWithSeats[] =>
  depArrSections.map((s) => ({
    sectionId: s.id,
    fromStationId: s.departureStationId,
    toStationId: s.arrivalStationId,
  }));

export const r8Stations = [
  4987881000, 3088864001, 4961583000, 5009212000, 4961583001, 2370298003,
  372825006, 5095524133, 5095524027, 372825007, 372825008, 4961583004, 7063331002,
];

export const r23Stations = [
  5010256458, 5812866010, 5145776001, 5010257320, 5812866008, 5812866007,
  5812866006, 5812866005, 5812866004, 5812866003, 5812866002, 5812866001,
  3088864000, 5812866009,
];

export const isRegional = (fromStationId: number, toStationId: number) =>
  (r8Stations.includes(fromStationId) && r8Stations.includes(toStationId)) ||
  (r23Stations.includes(fromStationId) && r23Stations.includes(toStationId));

/**
 * Soft booking can book other seat than selected. We need to inform user about it
 */
export const getNewSeats = (
  reqSeats: SelectedSeat[],
  respSeats: SelectedSeat[],
) =>
  equal(reqSeats, respSeats)
    ? []
    : respSeats.filter(
      (respSeat) => !reqSeats.some((reqSeat) => equal(reqSeat, respSeat)),
    );

export const getAddonTranslationKey = (addonCode: string, prependAll?: boolean): string => {
  const lowerCaseAddon = addonCode.toLowerCase();
  if (lowerCaseAddon.includes('kolo')) {
    return 'addon.bike';
  }
  if (lowerCaseAddon.includes('lyze')) {
    return 'addon.ski';
  }
  if (lowerCaseAddon.includes('parkovani')) {
    return 'addon.parking';
  }
  if (lowerCaseAddon.includes('zavazadlo')) {
    return 'addon.luggage';
  }
  if (lowerCaseAddon.includes('smartguide')) {
    return 'addon.smartguide';
  }
  if (lowerCaseAddon.includes('berider')) {
    return 'addon.berider';
  }
  if (lowerCaseAddon.includes('hoppygo')) {
    return 'addon.hoppygo';
  }

  if (prependAll) {
    return 'addon.' + addonCode;
  }

  return addonCode;
};

export const unorderedArrayEqual = (arr1: string[], arr2: string[]) => {
  if (!arr1 || !arr2) {
    return false;
  }
  const sorted1 = arr1.sort();
  const sorted2 = arr2.sort();

  return sorted1.every((e, i) => sorted2[i] === e);
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const p = 0.017453292519943295; // Math.PI / 180
  const a =
    0.5 -
    Math.cos((lat2 - lat1) * p) / 2 +
    (Math.cos(lat1 * p) *
      Math.cos(lat2 * p) *
      (1 - Math.cos((lon2 - lon1) * p))) /
    2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
};

export const getPriorityInArray = <Item>(arr: Item[], item: Item) =>
  arr.includes(item) ? arr.indexOf(item) : arr.length;
