export declare const REFRESH_COOLDOWN = "REFRESH_COOLDOWN";
export declare const REFUSE_UPSELL = "REFUSE_UPSELL";
export interface RefreshCooldownUpsell {
    type: typeof REFRESH_COOLDOWN;
}
export interface RefuseUpsellAction {
    type: typeof REFUSE_UPSELL;
}
export interface UpsellReducerProps {
    displayCount: number;
    cooldownTs: number;
}
export type UpsellActions = RefreshCooldownUpsell | RefuseUpsellAction;
