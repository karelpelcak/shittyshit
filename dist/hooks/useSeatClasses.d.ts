import { SeatClass } from './types';
export interface SeatClassData {
    vehicleClass: '1' | '2' | 'undefined';
    key: SeatClass;
    title: string;
    shortDescription: string;
    description: string;
    imageUrl: null | string;
    galleryUrl: null | string;
}
type FormattedSeatClasses = Record<SeatClass, SeatClassData>;
declare const useSeatClasses: () => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    data: FormattedSeatClasses | undefined;
};
export default useSeatClasses;
