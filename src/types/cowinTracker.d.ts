declare module "cowin-tracker/types" {
  export interface Constants {
    pincodes: string[];
    mobile: string;
    interval: number;
    alarm: string;
    filters: Filters;
    backgroundSearch?: boolean;
    scheduleFirstPerson?: boolean;
  }

  export interface Filters {
    fee_type?: "Free" | "Paid";
    age_group?: "18+" |  "45+";
    vaccine?: "COVISHIELD" | "COVAXIN";
    looking_for?: "Dose1" | "Dose2";
  }

  export interface CowinResponse {
    centers: Center[];
  }

  export interface Center {
    center_id: number;
    name: string;
    address: string;
    state_name: string;
    district_name: string;
    block_name: string;
    pincode: number;
    lat: number;
    long: number;
    from: string;
    to: string;
    fee_type: string;
    sessions: CowinSession[];
  }

  export interface CowinSession {
    session_id: string;
    date: string;
    available_capacity: number;
    min_age_limit: number;
    vaccine: string;
    slots: string[];
    available_capacity_dose1: number;
    available_capacity_dose2: number;
  }

  export interface Session extends Center, CowinSession {}
}
