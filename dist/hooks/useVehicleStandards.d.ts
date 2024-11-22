import { VehicleKey } from './types';
export interface VehicleStandard {
    key: VehicleKey;
    name: string;
    shortDescription: string;
    description: string;
    imageUrl: string;
    supportImageUrl: string;
    galleryUrl: null | string;
}
type FormattedVehicleStandards = Record<VehicleKey, VehicleStandard>;
interface UseVehicleStandardsReturnType {
    data: FormattedVehicleStandards | undefined;
    error?: {
        message?: string;
    };
    loading: boolean;
}
declare const useVehicleStandards: () => UseVehicleStandardsReturnType;
export default useVehicleStandards;
