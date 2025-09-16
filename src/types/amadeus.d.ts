// Type declarations for amadeus module
declare module 'amadeus' {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: string;
  }

  interface AmadeusResponse {
    data: any[];
  }

  interface ReferenceDataLocations {
    get(params: {
      keyword: string;
      subType: string;
      page?: { limit: number };
    }): Promise<AmadeusResponse>;

    airports: {
      get(params: {
        latitude: number;
        longitude: number;
        radius: number;
        page?: { limit: number };
      }): Promise<AmadeusResponse>;
    };
  }

  interface ReferenceData {
    locations: ReferenceDataLocations;
  }

  class Amadeus {
    constructor(config: AmadeusConfig);
    referenceData: ReferenceData;
  }

  export = Amadeus;
}