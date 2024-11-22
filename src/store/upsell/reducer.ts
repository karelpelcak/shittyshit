import type { Draft } from 'immer';
import { UpsellActions, UpsellReducerProps } from './types';

const TWO_WEEKS_TIMESTAMP = 12096e5;

export const upsellInitialState: UpsellReducerProps = {
  cooldownTs: 0,
  displayCount: 0,
};

const upsellReducer = (draft: Draft<UpsellReducerProps>, action: UpsellActions) => {
  switch (action.type) {
    case 'REFUSE_UPSELL': {
      draft.displayCount++;
      if (draft.displayCount === 2) {
        draft.cooldownTs = new Date().valueOf() + TWO_WEEKS_TIMESTAMP;
      }
      break;
    }
    case 'REFRESH_COOLDOWN': {
      if (draft.cooldownTs && new Date().valueOf() > draft.cooldownTs) {
        draft.cooldownTs = 0;
        draft.displayCount = 0;
      }
      break;
    }
  }
};

export default upsellReducer;
