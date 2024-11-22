import { Tariff } from './types';
export interface TariffResponse {
    key: Tariff;
    value: string;
}
declare const useTariffs: () => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    data: TariffResponse[] | undefined;
};
export default useTariffs;
