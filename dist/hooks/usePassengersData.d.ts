import { Tariff } from './types';
export declare enum PassengerFieldsFromApi {
    email = "EMAIL",
    firstName = "FIRST_NAME",
    surname = "SURNAME",
    phone = "PHONE",
    customerName = "CUSTOMER_NAME",
    customerAddress = "CUSTOMER_ADDRESS",
    dateOfBirth = "BIRTHDAY"
}
export declare enum PassengerFieldsToSend {
    email = "email",
    firstName = "firstName",
    phone = "phone",
    surname = "surname",
    customerName = "customerName",
    customerAddress = "customerAddress",
    dateOfBirth = "dateOfBirth"
}
export declare const mapPassengerData: {
    [key in PassengerFieldsFromApi]: PassengerFieldsToSend;
};
export interface ContactData {
    email: true;
    phone: boolean;
}
export interface PassengerField {
    name: PassengerFieldsToSend;
    value: string;
    error?: string;
}
export interface Passengers {
    tariff: Tariff;
    fields: Record<PassengerFieldsToSend, string>;
}
export interface PersonalDataPassengers {
    tariff?: Tariff;
    fields: PassengerField[];
}
export interface PersonalData {
    from: string;
    to: string;
    passengers: PersonalDataPassengers[];
}
export interface PassengersData {
    contactData: ContactData;
    personalData: PersonalData;
}
export interface PassengersApiData {
    firstPassengerData: PassengerFieldsFromApi[];
    otherPassengersData: PassengerFieldsFromApi[];
}
declare const usePassengersData: () => {
    data: {
        contactData: ContactData;
        personalData: PersonalData;
    };
    error: any;
    loading: boolean;
};
export default usePassengersData;
