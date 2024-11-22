import { ConnectionSearchCity } from './useLocations';
declare const useSearchLocations: (searchString: string) => {
    filtered: ConnectionSearchCity[];
    shouldSearch: boolean;
};
export default useSearchLocations;
