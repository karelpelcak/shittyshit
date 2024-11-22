declare const useBookingPrice: () => {
    addonsPrice: number;
    backPrice: number | undefined;
    bookingPrice: number;
    therePrice: number | undefined;
    totalPrice: number;
    CarbonOffsetPrice: number;
};
export default useBookingPrice;
