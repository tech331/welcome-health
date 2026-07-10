// Lightweight Google Maps JS loader + Places helpers. We only type the small
// surface we use so the app doesn't need the full @types/google.maps package.

export type PlacePrediction = {
  placeId: string;
  description: string;
};

export type ParsedAddress = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
};

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GooglePrediction = {
  place_id: string;
  description: string;
};

type GooglePlaceResult = {
  address_components?: GoogleAddressComponent[];
};

type AutocompleteService = {
  getPlacePredictions: (
    request: {
      input: string;
      componentRestrictions?: { country: string | string[] };
      types?: string[];
    },
    callback: (predictions: GooglePrediction[] | null, status: string) => void,
  ) => void;
};

type PlacesService = {
  getDetails: (
    request: { placeId: string; fields: string[] },
    callback: (result: GooglePlaceResult | null, status: string) => void,
  ) => void;
};

type GoogleMapsPlaces = {
  AutocompleteService: new () => AutocompleteService;
  PlacesService: new (attrContainer: HTMLElement) => PlacesService;
  PlacesServiceStatus: { OK: string };
};

type GoogleMapsGlobal = {
  maps?: { places?: GoogleMapsPlaces };
};

declare global {
  interface Window {
    google?: GoogleMapsGlobal;
  }
}

let loaderPromise: Promise<GoogleMapsPlaces> | null = null;

export function getGoogleMapsApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

export function loadGoogleMapsPlaces(): Promise<GoogleMapsPlaces> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }

  const existing = window.google?.maps?.places;
  if (existing) return Promise.resolve(existing);

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"));
  }

  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const places = window.google?.maps?.places;
      if (places) resolve(places);
      else reject(new Error("Google Maps Places failed to initialise"));
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

function pickComponent(
  components: GoogleAddressComponent[],
  type: string,
  useShort = false,
): string {
  const match = components.find((component) => component.types.includes(type));
  if (!match) return "";
  return useShort ? match.short_name : match.long_name;
}

export function parseAddressComponents(
  result: GooglePlaceResult,
): ParsedAddress {
  const components = result.address_components ?? [];

  const subpremise = pickComponent(components, "subpremise");
  const streetNumber = pickComponent(components, "street_number");
  const route = pickComponent(components, "route");

  const streetLine = [streetNumber, route].filter(Boolean).join(" ");
  const addressLine1 = subpremise
    ? `${subpremise}/${streetLine}`.trim()
    : streetLine;

  const city =
    pickComponent(components, "locality") ||
    pickComponent(components, "postal_town") ||
    pickComponent(components, "sublocality") ||
    pickComponent(components, "administrative_area_level_2");

  const state = pickComponent(components, "administrative_area_level_1", true);
  const postcode = pickComponent(components, "postal_code");

  return {
    addressLine1,
    addressLine2: "",
    city,
    state,
    postcode,
  };
}
