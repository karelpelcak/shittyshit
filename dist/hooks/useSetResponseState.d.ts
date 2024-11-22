import { ErrorFields, ResponseStateCategory } from '../store/responseState/types';
declare const useSetResponseState: (category: ResponseStateCategory) => (message: string | undefined, loading: boolean, errorFields?: ErrorFields[] | undefined) => void;
export default useSetResponseState;
