import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import {
  ErrorFields,
  ResponseStateCategory,
  SET_RESPONSE_STATE,
} from '../store/responseState/types';

const useSetResponseState = (category: ResponseStateCategory) => {
  const dispatch = useContextSelector(ResponseStateContext, c => c.dispatch);

  return (
    message: string | undefined,
    loading: boolean,
    errorFields: ErrorFields[] | undefined = undefined,
  ) => {
    dispatch({
      type: SET_RESPONSE_STATE,
      payload: { type: category, error: { message, errorFields }, loading },
    });
  };
};

export default useSetResponseState;
